import { execFileSync } from 'node:child_process'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { canonicalFor, NAO_ENCONTRADA, ogUrlDe, ROUTES } from './src/lib/routes.ts'
import { buildJsonLd, buildLlmsTxt } from './src/lib/seo.ts'

/**
 * Injeta o JSON-LD no index.html em tempo de build.
 *
 * O schema é derivado de src/lib/business.ts — a mesma fonte que alimenta a
 * página —, então telefone, horário e endereço não podem divergir entre o que
 * o visitante lê e o que o Google indexa. E como a injeção acontece no build,
 * o dado chega estático no HTML, sem depender de o crawler executar JavaScript.
 */
function jsonLdPlugin(): Plugin {
  return {
    name: 'delamayer-jsonld',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(buildJsonLd()),
          injectTo: 'head',
        },
      ]
    },
  }
}

/**
 * Gera um HTML estático por rota, a partir do index.html já construído.
 *
 * Sem isto, /diagnostico e /rating seriam servidos com o mesmo `<head>` da
 * home: o mesmo título, a mesma description, a mesma canonical. Três
 * consequências concretas — o robô do Google avaliaria a página de destino do
 * anúncio e veria conteúdo genérico; o Search Console acusaria títulos
 * duplicados; e o link colado no WhatsApp mostraria a prévia errada.
 *
 * O truque é barato: o app continua sendo uma SPA (mesmo bundle, mesmo CSS),
 * só o `<head>` muda por arquivo. Cada rota vira `dist/<rota>/index.html`, e
 * uma CloudFront Function reescreve a URL sem extensão para esse caminho.
 */
function perRouteHtmlPlugin(): Plugin {
  return {
    name: 'delamayer-rotas-estaticas',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index?.type !== 'asset') return
      const base = String(index.source)

      // A rota de 404 entra junto: vira dist/404.html, que a distribuição serve
      // com status 404 de verdade (ver CustomErrorResponses no aws-setup.sh).
      // É o que separa "página inexistente" de *soft 404*.
      for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
        if (rota.path === '/') continue

        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(rota.title)}</title>`)
          .replace(
            /(<meta\s+name="description"\s+content=")[^"]*(")/,
            `$1${escapeHtml(rota.description)}$2`,
          )
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonicalFor(rota)}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(rota.title)}$2`)
          .replace(
            /(<meta property="og:description" content=")[^"]*(")/,
            `$1${escapeHtml(rota.description)}$2`,
          )
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonicalFor(rota)}$2`)
          // A arte de compartilhamento é própria de cada rota (ver ogUrlDe).
          // Sem esta reescrita, as cinco páginas apareceriam no WhatsApp com a
          // mesma imagem — e um link colado é lido pela imagem antes do texto.
          .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogUrlDe(rota)}$2`)
          .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${ogUrlDe(rota)}$2`)
          .replace(
            /(<meta property="og:image:alt" content=")[^"]*(")/,
            `$1${escapeHtml(rota.ogLinhas ? rota.ogLinhas.join(' ') : rota.title)}$2`,
          )
          .replace(
            /(<meta name="twitter:image:alt" content=")[^"]*(")/,
            `$1${escapeHtml(rota.ogLinhas ? rota.ogLinhas.join(' ') : rota.title)}$2`,
          )
          .replace(
            /(<meta name="twitter:title" content=")[^"]*(")/,
            `$1${escapeHtml(rota.title)}$2`,
          )
          .replace(
            /(<meta name="robots" content=")[^"]*(")/,
            `$1${rota.noindex ? 'noindex, follow' : DIRETIVAS_ROBOTS}$2`,
          )
          // Dados estruturados próprios por rota: trilha de navegação nas
          // filhas, FAQPage só onde as perguntas realmente aparecem.
          .replace(
            /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
            `$1${JSON.stringify(buildJsonLd(rota.path))}$2`,
          )

        this.emitFile({
          type: 'asset',
          fileName:
            rota.path === '/404' ? '404.html' : `${rota.path.replace(/^\//, '')}/index.html`,
          source: html,
        })
      }
    },
  }
}

/**
 * Gera sitemap.xml e llms.txt no build.
 *
 * Os dois eram candidatos naturais a arquivo estático em public/ — e os dois
 * envelheceriam do mesmo jeito. Um `lastmod` escrito à mão marca o dia em que
 * alguém lembrou de editá-lo, não o dia em que a página mudou; e uma rota nova
 * só entraria no sitemap se alguém lembrasse de acrescentá-la. Ninguém lembra.
 *
 * Do sitemap saem só `loc` e `lastmod`. `priority` e `changefreq` estão no
 * protocolo, mas o Google declara publicamente que os ignora — mantê-los seria
 * decoração que dá a impressão de estar controlando algo.
 *
 * A data vem do último commit, não do relógio do build. Um redeploy sem
 * mudança nenhuma — refazer o build para trocar um certificado, por exemplo —
 * marcaria todas as páginas como alteradas hoje, e um sitemap que diz isso
 * toda semana é um sitemap que o Google aprende a desconsiderar.
 */
function dataDoUltimoCommit(): string {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], { encoding: 'utf8' })
      .trim()
      .slice(0, 10)
  } catch {
    // Build fora de um clone (tarball, container sem git): a data de hoje é um
    // palpite pior, mas um sitemap sem lastmod é aceito do mesmo jeito.
    return new Date().toISOString().slice(0, 10)
  }
}

function seoAssetsPlugin(): Plugin {
  return {
    name: 'delamayer-seo-assets',
    apply: 'build',
    generateBundle() {
      const lastmod = dataDoUltimoCommit()
      const urls = ROUTES.filter((rota) => !rota.noindex)
        .map(
          (rota) =>
            `  <url>\n    <loc>${canonicalFor(rota)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
        )
        .join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: buildLlmsTxt(),
      })
    },
  }
}

/**
 * O que o buscador pode mostrar do conteúdo.
 *
 * Os três limites são explicitamente liberados. `max-snippet:-1` deixa o
 * trecho na busca ter o tamanho que o Google achar melhor, em vez de ser
 * cortado no padrão conservador; `max-image-preview:large` libera a miniatura
 * grande; e `max-video-preview:-1` permite a prévia inteira do vídeo da
 * matéria — que só faz sentido junto com o `VideoObject` de lib/seo.ts.
 *
 * Nada disso é "mais indexação": a página seria indexada do mesmo jeito. O que
 * muda é o tamanho do espaço que ela ocupa no resultado.
 */
const DIRETIVAS_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jsonLdPlugin(), perRouteHtmlPlugin(), seoAssetsPlugin()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // O único chunk acima de 500 kB é o do three.js, e ele é carregado sob
    // demanda depois que a página já está interativa. O aviso padrão do Vite
    // aqui seria ruído — mas o teto continua existindo para pegar regressões.
    chunkSizeWarningLimit: 950,
    rollupOptions: {
      output: {
        // O three.js NÃO entra aqui de propósito.
        //
        // Declará-lo como manualChunk o promove a chunk compartilhado, e o Vite
        // passa a emitir <link rel="modulepreload"> para ele no index.html — ou
        // seja, os ~900 kB seriam baixados no primeiro paint, exatamente o que o
        // lazy import do Hero existe para evitar. Deixando o Rollup decidir, o
        // three fica dentro do chunk dinâmico do BrandScene e só é buscado
        // quando a cena é realmente montada.
        //
        // O gsap é o oposto: é usado pelas animações de scroll da home desde a
        // primeira rolagem, então isolá-lo num chunk estável melhora o cache
        // entre deploys (ele muda muito menos que o código do site).
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
})
