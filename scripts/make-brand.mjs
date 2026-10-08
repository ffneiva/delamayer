/**
 * Gera os arquivos de marca a partir da geometria em src/lib/mark.ts.
 *
 *   npm run brand
 *
 * Saem daqui: favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png,
 * icon-512.png e og.png. Todos derivam do MESMO desenho que o componente
 * <Mark> usa em tela e que o BrandScene extruda em 3D — não existe uma cópia
 * do logotipo em lugar nenhum.
 *
 * Por que gerar em vez de versionar um PNG feito à mão: o dia em que a
 * espessura do traço mudar, ela muda em um arquivo e os seis PNGs saem
 * corretos. Com arquivos manuais, cinco deles ficariam desatualizados e
 * ninguém perceberia — favicon é a coisa que menos se olha e mais se nota
 * quando está errada.
 *
 * O favicon de 32 px usa um traço mais grosso de propósito. Na espessura de
 * tela, o contorno do "D" tem menos de um pixel àquele tamanho e simplesmente
 * desaparece, deixando só a diagonal — que sozinha não lê como a marca.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { MARK_SIZE, MARK_STROKE, markCenterline, OURO, PRETO } from '../src/lib/mark.ts'
import { ogArquivoDe, ROUTES } from '../src/lib/routes.ts'

const PUBLIC = path.resolve(import.meta.dirname, '../public')

const DEGRADE = `
  <linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${OURO[0]}"/>
    <stop offset="35%" stop-color="${OURO[1]}"/>
    <stop offset="62%" stop-color="${OURO[2]}"/>
    <stop offset="100%" stop-color="${OURO[3]}"/>
  </linearGradient>`

/**
 * @param opcoes.traco espessura do contorno do "D"
 * @param opcoes.fundo cor do fundo, ou null para transparente
 * @param opcoes.margem folga ao redor, em unidades do viewBox
 */
function svgDaMarca({ traco, fundo = null, margem = 0, raioFundo = 0 }) {
  const lado = MARK_SIZE + margem * 2
  const fundoEl = fundo
    ? `<rect width="${lado}" height="${lado}" rx="${raioFundo}" fill="${fundo}"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado}" height="${lado}">
  <defs>${DEGRADE}</defs>
  ${fundoEl}
  <g transform="translate(${margem} ${margem})">
    <path d="${markCenterline()}" fill="none" stroke="url(#ouro)" stroke-width="${traco}"
          stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="10"/>
  </g>
</svg>`
}

/**
 * A imagem de compartilhamento — uma por rota.
 *
 * Ela é o site inteiro reduzido a um retângulo: o monograma, o nome e a frase
 * que separa a Delamayer dos concorrentes. Sem foto de gente sorrindo com
 * cartão de crédito — o assunto é dívida, e o clichê do estoque contradiz o
 * tom do resto.
 *
 * O texto grande muda por rota (`ogLinhas` em src/lib/routes.ts). Antes as
 * cinco páginas dividiam a mesma arte, e o efeito prático era ruim: um link
 * colado no WhatsApp é lido pela imagem antes do texto, então cinco páginas com
 * a mesma peça pareciam a mesma página.
 *
 * A tipografia usa a pilha genérica do sistema porque o renderizador de SVG do
 * sharp não carrega as fontes do projeto. É a única peça da marca em que isso
 * acontece, e o compromisso é aceitável: a imagem aparece no WhatsApp em
 * ~200 px de largura, onde a diferença entre Sora e a sans do sistema não é
 * perceptível.
 */
function svgDoOg({ linhas, nota }) {
  const [primeira, segunda] = linhas

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    ${DEGRADE}
    <linearGradient id="prata" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#c9ced7"/>
      <stop offset="55%" stop-color="#f2f4f7"/>
      <stop offset="100%" stop-color="#9aa1ac"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.2" r="0.8">
      <stop offset="0%" stop-color="#b07c24" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="#b07c24" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#b07c24" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${PRETO}"/>
  <rect width="1200" height="630" fill="url(#halo)"/>

  <g transform="translate(88 196) scale(1.62)">
    <path d="${markCenterline()}" fill="none" stroke="url(#ouro)" stroke-width="${MARK_STROKE}"
          stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="10"/>
  </g>

  <g transform="translate(350 0)" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif">
    <text x="0" y="240" fill="url(#prata)" font-size="72" font-weight="600" letter-spacing="10">DELAMAYER</text>
    <text x="4" y="290" fill="#c2913c" font-size="26" font-weight="300" letter-spacing="8">SOLUÇÕES FINANCEIRAS</text>

    <rect x="0" y="330" width="640" height="1" fill="#3a2f1c"/>

    <text x="0" y="392" fill="#edeff2" font-size="40" font-weight="600">${escapar(primeira)}</text>
    <text x="0" y="444" fill="#edeff2" font-size="40" font-weight="600">${escapar(segunda)}</text>

    <text x="0" y="512" fill="#8d95a1" font-size="24">${escapar(nota)}</text>
    <text x="0" y="548" fill="#8d95a1" font-size="24">delamayer.com.br · Goiânia/GO</text>
  </g>
</svg>`
}

/** XML não perdoa `&` nem `<` soltos dentro de um <text>. */
function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function main() {
  await mkdir(PUBLIC, { recursive: true })

  // ── favicon.svg: o vetor, servido a quem suporta (praticamente todos hoje).
  const faviconSvg = svgDaMarca({ traco: MARK_STROKE })
  await writeFile(path.join(PUBLIC, 'favicon.svg'), faviconSvg)
  console.log('  favicon.svg')

  // ── PNGs de ícone. O de 32 px leva o traço grosso; os grandes, o normal.
  const alvos = [
    { nome: 'favicon-32.png', lado: 32, traco: 15, fundo: null, margem: 8 },
    { nome: 'apple-touch-icon.png', lado: 180, traco: 11, fundo: PRETO, margem: 28, raio: 34 },
    { nome: 'icon-192.png', lado: 192, traco: 10.5, fundo: PRETO, margem: 26, raio: 0 },
    { nome: 'icon-512.png', lado: 512, traco: MARK_STROKE, fundo: PRETO, margem: 26, raio: 0 },
  ]

  for (const alvo of alvos) {
    const svg = svgDaMarca({
      traco: alvo.traco,
      fundo: alvo.fundo,
      margem: alvo.margem,
      raioFundo: alvo.raio ?? 0,
    })
    await sharp(Buffer.from(svg))
      .resize(alvo.lado, alvo.lado)
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(PUBLIC, alvo.nome))
    console.log(`  ${alvo.nome}`)
  }

  // ── Open Graph, uma peça por rota.
  //
  // O nome do arquivo sai de `ogArquivoDe`, a MESMA função que o plugin do Vite
  // usa para escrever a meta tag. Derivar o nome nos dois lugares por conta
  // própria é como uma tag acaba apontando para um arquivo que não existe.
  const home = ROUTES[0]
  const vistas = new Set()

  for (const rota of ROUTES) {
    const arquivo = ogArquivoDe(rota)
    if (vistas.has(arquivo)) continue
    vistas.add(arquivo)

    // Rota sem texto próprio (a política de privacidade, que ninguém
    // compartilha) cai na arte da home em vez de exigir uma peça inútil.
    const linhas = rota.ogLinhas ?? home.ogLinhas
    const nota = rota.ogNota ?? home.ogNota

    await sharp(Buffer.from(svgDoOg({ linhas, nota })))
      .png({ compressionLevel: 9 })
      .toFile(path.join(PUBLIC, arquivo))
    console.log(`  ${arquivo}`)
  }

  console.log('\nMarca gerada a partir de src/lib/mark.ts.')
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
