/**
 * Pré-renderiza o conteúdo de cada rota dentro do `#root` do HTML estático.
 *
 * Sem isto, o HTML servido tinha só o `<head>` e um parágrafo de contato: o
 * texto das páginas dependia de JavaScript. O Google executa JavaScript, mas o
 * Bing nem sempre, e os assistentes de IA (ChatGPT, Claude, Perplexity) não
 * executam. Para eles, o site estava praticamente vazio.
 *
 * Roda depois do `vite build`. Carrega o app pelo SSR do Vite, com um `window`
 * mínimo apontando para a rota da vez, e injeta o markup no arquivo já gerado.
 * O que depende do relógio sai neutro (ver hooks/useRelogio.ts), e o navegador
 * hidrata este mesmo HTML (ver main.tsx).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const DIST = path.resolve('dist')
const nada = () => {}
const midia = () => ({
  matches: false,
  addEventListener: nada,
  removeEventListener: nada,
  addListener: nada,
  removeListener: nada,
})

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})
let falhas = 0
const textos = []

/** HTML do `<main>` → Markdown simples, para o llms-full.txt. */
function paraTexto(html) {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? html
  return main
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, '')
    .replace(/<h1[^>]*>/g, '\n# ')
    .replace(/<h2[^>]*>/g, '\n\n## ')
    .replace(/<h3[^>]*>/g, '\n\n### ')
    .replace(/<li[^>]*>/g, '\n- ')
    .replace(/<\/(p|h[1-6]|li|div|section|dt|dd|tr)>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((l) =>
      l
        .replace(/\s+/g, ' ')
        .replace(/ ([,.;:!?)])/g, '$1')
        .trim(),
    )
    .filter(Boolean)
    .filter((l, i, todas) => l !== todas[i - 1])
    .join('\n')
}

try {
  const { ROUTES, NAO_ENCONTRADA } = await vite.ssrLoadModule('/src/prerender.tsx')
  for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
    const arquivo =
      rota.path === '/'
        ? 'index.html'
        : rota.path === '/404'
          ? '404.html'
          : `${rota.path.slice(1)}/index.html`
    const destino = path.join(DIST, arquivo)
    if (!existsSync(destino)) {
      console.error(`prerender: ${arquivo} não existe`)
      falhas++
      continue
    }

    globalThis.window = {
      location: {
        pathname: rota.path,
        href: `https://delamayer.com.br${rota.path}`,
        search: '',
        hash: '',
      },
      matchMedia: midia,
      innerWidth: 1280,
      innerHeight: 800,
      devicePixelRatio: 1,
      scrollY: 0,
      addEventListener: nada,
      removeEventListener: nada,
      history: {},
    }
    // Recarrega o módulo a cada rota: o estado de módulo não pode vazar de uma página para outra.
    vite.moduleGraph.invalidateAll()
    const { renderizar } = await vite.ssrLoadModule('/src/prerender.tsx')
    const corpo = renderizar()
    const html = readFileSync(destino, 'utf8')
    if (!html.includes('<div id="root"></div>')) {
      console.error(`prerender: #root vazio não achado em ${arquivo}`)
      falhas++
      continue
    }
    writeFileSync(destino, html.replace('<div id="root"></div>', `<div id="root">${corpo}</div>`))
    console.log(`prerender: ${arquivo} (${Math.round(corpo.length / 1024)} kB)`)
    if (!rota.noindex && rota.path !== '/404') {
      const url = `https://delamayer.com.br${rota.path}`
      textos.push(`---\n\nURL: ${url}\nTítulo: ${rota.title}\n\n${paraTexto(corpo)}\n`)
    }
  }
} finally {
  await vite.close()
}
// O llms.txt é o resumo; este é o texto completo de cada página, para
// assistentes de IA que querem a resposta inteira sem executar o site.
const cabeca = readFileSync(path.join(DIST, 'llms.txt'), 'utf8').split('\n').slice(0, 3).join('\n')
const aviso =
  'Texto completo das páginas do site, gerado a cada publicação a partir do próprio site.'
writeFileSync(path.join(DIST, 'llms-full.txt'), `${cabeca}\n\n${aviso}\n\n${textos.join('\n')}`)
console.log(`prerender: llms-full.txt (${textos.length} páginas)`)
if (falhas) process.exit(1)
