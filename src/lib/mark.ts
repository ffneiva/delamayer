/**
 * A geometria do monograma da marca — uma fonte, três destinos.
 *
 * O símbolo aparece em três lugares que normalmente seriam três arquivos
 * diferentes: o favicon, o logotipo na navegação e a peça de metal em WebGL do
 * herói. Manter três cópias significa que ajustar a espessura do traço exige
 * lembrar de três lugares — e ninguém lembra.
 *
 * ── O que o desenho é ────────────────────────────────────────────────────────
 *
 * Um **traço monolinear único**, de espessura constante, que percorre:
 *
 *     ponta da diagonal (embaixo à direita)
 *       ↖ sobe até o pé da haste superior
 *       ↑ haste superior
 *       → aresta do topo
 *       ⤷ barriga do "D" (arco de círculo)
 *       ← base
 *       ↑ haste inferior
 *       ↘ segunda diagonal, fechando o triângulo sobre a base
 *
 * As duas diagonais e a barriga se cruzam embaixo à direita — é esse cruzamento
 * que dá ao símbolo o gesto de corte, em vez de parecer um "D" com uma barra.
 *
 * ── De onde vêm os números ───────────────────────────────────────────────────
 *
 * Não foram estimados no olho. O arquivo original da marca foi binarizado numa
 * grade de 78×80 e cada vértice lido dali; a barriga é o círculo que passa pelos
 * três pontos medidos (topo, extremo direito e base). A espessura veio de medir
 * a largura da haste esquerda no arquivo original: 42,5 px numa renderização de
 * 600 px, o que dá 9,07 unidades nesta caixa.
 *
 * Por isso as coordenadas abaixo são "feias": elas descrevem um desenho que
 * existe, não um que seria conveniente descrever.
 */

/** Lado da caixa final. Todo o resto é normalizado para caber aqui. */
export const MARK_SIZE = 128

/** Espessura do traço, na escala das coordenadas brutas. */
const TRACO = 9

// ─────────────────────────────────────────────────────────────────────────────
// Coordenadas brutas, na escala em que foram medidas
// ─────────────────────────────────────────────────────────────────────────────

const PONTA_DIAGONAL = { x: 114, y: 122 } // onde a diagonal longa termina
const PE_HASTE = { x: 9.6, y: 25.6 } // fim da haste superior, início da diagonal
const TOPO_ESQ = { x: 9.6, y: 8.8 }
const TOPO_DIR = { x: 64, y: 8.8 } // onde a aresta do topo vira barriga
const BARRIGA_BASE = { x: 76.8, y: 117.6 } // onde a barriga encontra a base
const BASE_ESQ = { x: 9.6, y: 117.6 }
const HASTE_INF = { x: 9.6, y: 52.8 } // topo da haste inferior
const FIM_DIAGONAL_2 = { x: 67.2, y: 117.6 }

/**
 * O círculo da barriga.
 *
 * Circunscrito aos três pontos medidos no arquivo original: o encontro com a
 * aresta do topo, o extremo direito e o encontro com a base. Ajustar qualquer
 * um deles exige recalcular os três valores juntos — eles não são independentes.
 */
const BARRIGA = { cx: 52.85, cy: 65.26, r: 57.56 }

/** Quantos segmentos aproximam a barriga quando ela vira polígono. */
const SEGMENTOS_ARCO = 56

type Ponto = { x: number; y: number }

// ─────────────────────────────────────────────────────────────────────────────
// Normalização — leva a caixa bruta para 0..MARK_SIZE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A margem que sobra dos dois lados depois de encaixar o desenho.
 *
 * Não é decoração: sem folga, o traço encosta na borda do viewBox e o
 * antisserrilhado corta meio pixel no favicon.
 */
const MARGEM = 5

function pontosDaBarriga(): Ponto[] {
  const de = Math.atan2(TOPO_DIR.y - BARRIGA.cy, TOPO_DIR.x - BARRIGA.cx)
  const ate = Math.atan2(BARRIGA_BASE.y - BARRIGA.cy, BARRIGA_BASE.x - BARRIGA.cx)

  const pontos: Ponto[] = []
  // O primeiro e o último ponto do arco coincidem com os vértices vizinhos, e
  // por isso são omitidos: um ponto duplicado no polígono zera a direção do
  // segmento e produz uma normal indefinida no cálculo do contorno.
  for (let i = 1; i < SEGMENTOS_ARCO; i++) {
    const t = de + ((ate - de) * i) / SEGMENTOS_ARCO
    pontos.push({
      x: BARRIGA.cx + Math.cos(t) * BARRIGA.r,
      y: BARRIGA.cy + Math.sin(t) * BARRIGA.r,
    })
  }
  return pontos
}

/**
 * O traço inteiro como uma única polilinha, na escala bruta.
 *
 * A ordem importa: é ela que define de que lado ficam as normais e, portanto,
 * como os cantos são chanfrados em `contornoDaFita`.
 */
function polilinhaBruta(): Ponto[] {
  return [
    PONTA_DIAGONAL,
    PE_HASTE,
    TOPO_ESQ,
    TOPO_DIR,
    ...pontosDaBarriga(),
    BARRIGA_BASE,
    BASE_ESQ,
    HASTE_INF,
    FIM_DIAGONAL_2,
  ]
}

/** Escala e deslocamento que encaixam o desenho (com traço) na caixa final. */
function ajuste() {
  const pontos = polilinhaBruta()
  const meio = TRACO / 2
  const minX = Math.min(...pontos.map((p) => p.x)) - meio
  const maxX = Math.max(...pontos.map((p) => p.x)) + meio
  const minY = Math.min(...pontos.map((p) => p.y)) - meio
  const maxY = Math.max(...pontos.map((p) => p.y)) + meio

  const util = MARK_SIZE - MARGEM * 2
  const escala = Math.min(util / (maxX - minX), util / (maxY - minY))

  return {
    escala,
    dx: MARGEM + (util - (maxX - minX) * escala) / 2 - minX * escala,
    dy: MARGEM + (util - (maxY - minY) * escala) / 2 - minY * escala,
  }
}

const AJUSTE = ajuste()

const paraCaixa = (p: Ponto): Ponto => ({
  x: p.x * AJUSTE.escala + AJUSTE.dx,
  y: p.y * AJUSTE.escala + AJUSTE.dy,
})

/** Espessura do traço já na escala da caixa final. */
export const MARK_STROKE = TRACO * AJUSTE.escala

// ─────────────────────────────────────────────────────────────────────────────
// Saída 1 — o `d` de um <path>, para ser desenhado com `stroke`
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A linha de centro do traço, pronta para `stroke` + `fill: none`.
 *
 * O caminho carrega o arco como comando `A`, e não como uma sequência de
 * segmentos: além de ser uma fração do tamanho, o navegador o rasteriza na
 * resolução do dispositivo, então a barriga fica lisa em qualquer densidade de
 * tela — coisa que um polígono de 56 lados não faz.
 *
 * Quem desenha decide a espessura. `MARK_STROKE` é o valor fiel ao original; o
 * favicon pequeno usa mais, porque abaixo de ~24 px o traço fiel some.
 */
export function markCenterline(): string {
  const p = (ponto: Ponto) => {
    const c = paraCaixa(ponto)
    return `${c.x.toFixed(2)} ${c.y.toFixed(2)}`
  }
  const raio = (BARRIGA.r * AJUSTE.escala).toFixed(2)

  return [
    `M ${p(PONTA_DIAGONAL)}`,
    `L ${p(PE_HASTE)}`,
    `L ${p(TOPO_ESQ)}`,
    `L ${p(TOPO_DIR)}`,
    // varredura 1, arco menor: a barriga cobre ~144°, e não os 180° de um
    // semicírculo — foi assim que ela foi medida no arquivo original.
    `A ${raio} ${raio} 0 0 1 ${p(BARRIGA_BASE)}`,
    `L ${p(BASE_ESQ)}`,
    `L ${p(HASTE_INF)}`,
    `L ${p(FIM_DIAGONAL_2)}`,
  ].join(' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Saída 2 — polígonos preenchidos, para extrudar em three.js
// ─────────────────────────────────────────────────────────────────────────────

export type Contorno = { externo: Ponto[]; furos: Ponto[][] }

function direcao(a: Ponto, b: Ponto): Ponto {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const comprimento = Math.hypot(dx, dy) || 1
  return { x: dx / comprimento, y: dy / comprimento }
}

/**
 * Converte a linha de centro em duas bordas paralelas, com canto em esquadria.
 *
 * Num vértice, a borda não é simplesmente o ponto deslocado pela normal de um
 * dos segmentos — isso abriria uma fenda no lado externo da curva. A normal
 * correta é a bissetriz das duas normais, esticada por `1/cos(θ)` para que a
 * espessura perpendicular continue igual dos dois lados.
 *
 * O `Math.max(0.25, …)` é o limite de esquadria. Sem ele, um canto muito agudo
 * — e a ponta da diagonal é bem aguda — projetaria um espeto de comprimento
 * quase infinito.
 */
function bordas(pontos: Ponto[], espessura: number) {
  const meio = espessura / 2
  const esquerda: Ponto[] = []
  const direita: Ponto[] = []

  for (let i = 0; i < pontos.length; i++) {
    let nx: number
    let ny: number
    let estica = 1

    if (i === 0) {
      const d = direcao(pontos[0], pontos[1])
      nx = -d.y
      ny = d.x
    } else if (i === pontos.length - 1) {
      const d = direcao(pontos[i - 1], pontos[i])
      nx = -d.y
      ny = d.x
    } else {
      const d1 = direcao(pontos[i - 1], pontos[i])
      const d2 = direcao(pontos[i], pontos[i + 1])
      const n1 = { x: -d1.y, y: d1.x }
      const n2 = { x: -d2.y, y: d2.x }
      let mx = n1.x + n2.x
      let my = n1.y + n2.y
      const comprimento = Math.hypot(mx, my) || 1
      mx /= comprimento
      my /= comprimento
      estica = 1 / Math.max(0.25, mx * n1.x + my * n1.y)
      nx = mx
      ny = my
    }

    esquerda.push({ x: pontos[i].x + nx * meio * estica, y: pontos[i].y + ny * meio * estica })
    direita.push({ x: pontos[i].x - nx * meio * estica, y: pontos[i].y - ny * meio * estica })
  }

  return { esquerda, direita }
}

/**
 * Onde a fita é cortada em pedaços independentes.
 *
 * O traço é um só, mas ele **se cruza consigo mesmo**: a diagonal longa
 * atravessa a barriga embaixo à direita. Um polígono auto-intersectante
 * triangula errado — o `ShapeGeometry` do three.js produz faces invertidas e
 * buracos.
 *
 * A saída é cortar em três pedaços que não se cruzam, mas calcular as bordas
 * **antes** do corte: como os pedaços vizinhos compartilham exatamente os
 * mesmos pontos de borda no ponto de corte, eles se encaixam sem fenda nem
 * degrau, e o resultado extrudado é indistinguível de uma peça única.
 */
function cortes(total: number): Array<[number, number]> {
  // 0 → 1  : a diagonal longa
  // 1 → n-2: a haste, o topo, a barriga, a base e a haste inferior
  // n-2 → n-1: a segunda diagonal
  return [
    [0, 1],
    [1, total - 2],
    [total - 2, total - 1],
  ]
}

/**
 * O monograma como polígonos fechados, prontos para virar `THREE.Shape`.
 *
 * Duas conversões acontecem aqui, e só aqui:
 *
 *  1. **Y invertido.** O SVG cresce para baixo, o three.js para cima. Sem isto
 *     o monograma apareceria de cabeça para baixo na cena.
 *  2. **Centro na origem e escala unitária.** A cena trabalha em unidades em
 *     que o símbolo tem ~2 de altura, o que deixa posições de câmera e luz
 *     legíveis em vez de espalhadas na casa das centenas.
 */
export function markOutline(): Contorno[] {
  const pontos = polilinhaBruta().map(paraCaixa)
  const { esquerda, direita } = bordas(pontos, MARK_STROKE)

  const escala = 2 / MARK_SIZE
  const centro = MARK_SIZE / 2
  const paraCena = (p: Ponto): Ponto => ({
    x: (p.x - centro) * escala,
    y: -(p.y - centro) * escala,
  })

  return cortes(pontos.length).map(([de, ate]) => ({
    externo: [...esquerda.slice(de, ate + 1), ...direita.slice(de, ate + 1).reverse()].map(
      paraCena,
    ),
    furos: [],
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Paleta da marca
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O degradê de ouro do símbolo, amostrado do arquivo original.
 *
 * A mesma sequência serve ao CSS, ao SVG do favicon e à cor base do metal em
 * WebGL. São quatro paradas porque o ouro do logotipo não é um tom só: ele vai
 * de champanhe claro no alto a bronze na dobra e volta a clarear na saída — é
 * essa virada que dá a leitura de metal, e não de amarelo.
 */
export const OURO = ['#F3DFAE', '#D9AE5B', '#B07C24', '#E8CB8A'] as const

export const PRETO = '#050506'
