/**
 * Baixa os subsets latin/latin-ext das fontes do Google e imprime os @font-face
 * já apontando para /fonts/*.woff2.
 *
 * Auto-hospedar as fontes tira o Google Fonts do caminho crítico: menos uma
 * conexão TLS a um terceiro antes do primeiro texto pintar, e nada de dados do
 * visitante saindo do domínio do cliente — o que num site sobre dívida não é
 * detalhe de purista, é o mínimo.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * O CSS impresso vai colado no topo de src/index.css (bloco "Fontes
 * self-hosted"). Só é preciso rodar de novo ao trocar de família ou peso.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve(import.meta.dirname, '../public/fonts')

// O Google devolve woff2 moderno só para User-Agents que ele reconhece; com o
// UA padrão do fetch a resposta vem em TTF, três vezes maior.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const FAMILIES = [
  { query: 'family=Sora:wght@400;600;700', slug: 'sora' },
  { query: 'family=Inter:wght@300..700', slug: 'inter' },
  { query: 'family=JetBrains+Mono:wght@400;500', slug: 'jetbrains-mono' },
]

const KEEP_SUBSETS = new Set(['latin', 'latin-ext'])

async function main() {
  await mkdir(OUT, { recursive: true })
  const blocks = []

  for (const { query, slug } of FAMILIES) {
    const res = await fetch(`https://fonts.googleapis.com/css2?${query}&display=swap`, {
      headers: { 'User-Agent': UA },
    })
    const css = await res.text()

    // A resposta do Google vem anotada com /* subset */ antes de cada @font-face.
    for (const [, subset, block] of css.matchAll(
      /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g,
    )) {
      if (!KEEP_SUBSETS.has(subset)) continue

      const url = block.match(/url\((https:[^)]+)\)/)?.[1]
      const weight = block
        .match(/font-weight:\s*([^;]+);/)?.[1]
        .trim()
        .replace(/\s+/g, '_')
      if (!url || !weight) continue

      const nome = `${slug}-${subset}-${weight}.woff2`
      const bin = await fetch(url).then((r) => r.arrayBuffer())
      await writeFile(path.join(OUT, nome), Buffer.from(bin))

      blocks.push(block.replace(/src:\s*url\([^)]+\)/, `src: url(/fonts/${nome})`))
      console.log(`  ${nome}  ${(bin.byteLength / 1024).toFixed(1)} kB`)
    }
  }

  console.log(`\n/* ── cole a partir daqui em src/index.css ── */\n`)
  console.log(blocks.join('\n\n'))
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
