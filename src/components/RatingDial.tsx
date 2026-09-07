import { useRef, useState } from 'react'
import { useGsap } from '@/hooks/useGsap'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { RATING_ESCALA } from '@/lib/business'
import { clamp } from '@/lib/utils'

/**
 * O mostrador de rating — de F a A, amarrado à rolagem.
 *
 * É a peça que ensina o conceito sem um parágrafo: o ponteiro sobe de F para A
 * enquanto a pessoa rola, e a nota embaixo troca junto. Ler "o rating vai de A
 * a F" é abstrato; ver o ponteiro parar em C e ler "aprovado com taxa média e
 * limite curto" é concreto.
 *
 * Por que SVG e não WebGL, já que o site tem three.js: um arco com um ponteiro
 * é geometria 2D. Em WebGL custaria um segundo contexto de render vivo na
 * mesma página do herói — e ficaria com a borda serrilhada, que é justamente o
 * que SVG resolve de graça em qualquer densidade de tela.
 *
 * A rolagem controla o ângulo por `scrub`, e não por `duration`: assim a
 * pessoa pode subir e o ponteiro volta. Uma animação disparada por gatilho
 * rodaria uma vez e ficaria travada no fim.
 */

const RAIO = 108
const CENTRO = { x: 128, y: 122 }
/** O arco cobre 200°, começando embaixo à esquerda. Sobra o suficiente para
 *  as letras não colidirem com a base do mostrador. */
const ANGULO_INICIAL = 170
const ABERTURA = 200

const TOTAL = RATING_ESCALA.length

function polar(anguloGraus: number, raio: number) {
  const rad = (anguloGraus * Math.PI) / 180
  return { x: CENTRO.x + Math.cos(rad) * raio, y: CENTRO.y + Math.sin(rad) * raio }
}

/** Ângulo do centro da faixa de cada letra. F fica na ponta esquerda. */
function anguloDaLetra(indice: number) {
  // RATING_ESCALA vem de A a F; o mostrador vai de F (pior) a A (melhor), então
  // o índice é invertido antes de virar ângulo.
  const invertido = TOTAL - 1 - indice
  return ANGULO_INICIAL + (ABERTURA * (invertido + 0.5)) / TOTAL
}

/**
 * Fração de cada trecho gasta ANDANDO. O resto é descanso.
 *
 * Com movimento linear, o ponteiro atravessa as seis letras em velocidade
 * constante e nenhuma delas fica parada tempo suficiente para ser lida — na
 * prática, F e E passavam batido antes de a pessoa terminar de olhar. Andando
 * em 40% do trecho e descansando nos outros 60%, cada letra ganha uma pausa
 * proporcional, e o gesto passa a ser "de degrau em degrau" em vez de um
 * deslize contínuo.
 */
const FRACAO_ANDANDO = 0.4

/** easeInOutCubic: sai e chega devagar, o que faz a parada parecer intencional. */
function suavizar(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Traduz o progresso da rolagem (0 a 1) na posição do ponteiro.
 *
 * Devolve o ângulo em graus e o índice da letra em destaque, contando de F (0)
 * até A (5) — a mesma direção em que o ponteiro anda.
 */
function posicaoDoPonteiro(progresso: number) {
  // São TOTAL letras, logo TOTAL−1 trechos entre elas.
  const passo = clamp(progresso, 0, 1) * (TOTAL - 1)
  const trecho = Math.min(Math.floor(passo), TOTAL - 2)
  const dentroDoTrecho = passo - trecho

  const avanco = suavizar(clamp(dentroDoTrecho / FRACAO_ANDANDO, 0, 1))
  const continuo = trecho + avanco

  return {
    indice: Math.round(continuo),
    // O ponteiro aponta para o CENTRO da faixa de cada letra, e não para a
    // divisa entre elas — daí o meio passo somado.
    angulo: ANGULO_INICIAL + (ABERTURA * (continuo + 0.5)) / TOTAL,
  }
}

function caminhoDoArco(deGraus: number, ateGraus: number, raio: number) {
  const p1 = polar(deGraus, raio)
  const p2 = polar(ateGraus, raio)
  const arcoGrande = Math.abs(ateGraus - deGraus) > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${raio} ${raio} 0 ${arcoGrande} 1 ${p2.x} ${p2.y}`
}

export function RatingDial({ className }: { className?: string }) {
  const escopo = useRef<HTMLDivElement>(null)
  const ponteiro = useRef<SVGGElement>(null)
  const reduzido = useReducedMotion()

  // O índice ativo É estado do React porque muda poucas vezes (seis, no
  // percurso inteiro) e precisa re-renderizar o texto embaixo. O ângulo, que
  // muda a cada quadro, é escrito direto no DOM pelo GSAP.
  const [ativo, setAtivo] = useState(reduzido ? 0 : TOTAL - 1)

  useGsap(
    (gsap) => {
      const alvo = { progresso: 0 }

      gsap.to(alvo, {
        progresso: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: escopo.current,
          // Faixa de rolagem generosa: são seis paradas para ler, e o percurso
          // anterior (top 78% → bottom 42%) espremia as duas primeiras num
          // punhado de pixels.
          start: 'top 88%',
          end: 'bottom 25%',
          scrub: 0.8,
        },
        onUpdate: () => {
          const { indice, angulo } = posicaoDoPonteiro(alvo.progresso)
          if (ponteiro.current) {
            ponteiro.current.setAttribute('transform', `rotate(${angulo} ${CENTRO.x} ${CENTRO.y})`)
          }
          // `indice` conta de F (0) para A (5); RATING_ESCALA vai de A a F.
          setAtivo(TOTAL - 1 - indice)
        },
      })
    },
    escopo,
    [],
    !reduzido,
  )

  const atual = RATING_ESCALA[ativo]

  return (
    <div ref={escopo} className={className}>
      <svg
        viewBox="0 0 256 150"
        className="w-full"
        role="img"
        aria-label={`Escala de rating bancário, de A a F. Posição em destaque: ${atual.letra}, ${atual.rotulo}.`}
      >
        <defs>
          <linearGradient id="dial-ouro" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5d3f13" />
            <stop offset="45%" stopColor="#b07c24" />
            <stop offset="100%" stopColor="#f3dfae" />
          </linearGradient>
        </defs>

        {/* Trilho de fundo */}
        <path
          d={caminhoDoArco(ANGULO_INICIAL, ANGULO_INICIAL + ABERTURA, RAIO)}
          fill="none"
          stroke="#232329"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Arco em ouro: escuro em F, claro em A. O degradê é a explicação
            visual da escala — não precisa de legenda de cor. */}
        <path
          d={caminhoDoArco(ANGULO_INICIAL, ANGULO_INICIAL + ABERTURA, RAIO)}
          fill="none"
          stroke="url(#dial-ouro)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Marcas entre as faixas */}
        {RATING_ESCALA.map((_, i) => {
          if (i === 0) return null
          const a = ANGULO_INICIAL + (ABERTURA * i) / TOTAL
          const de = polar(a, RAIO - 8)
          const ate = polar(a, RAIO + 8)
          return (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: escala fixa de seis marcas
              key={i}
              x1={de.x}
              y1={de.y}
              x2={ate.x}
              y2={ate.y}
              stroke="#050506"
              strokeWidth="2.5"
            />
          )
        })}

        {/* Letras */}
        {RATING_ESCALA.map((faixa, i) => {
          const p = polar(anguloDaLetra(i), RAIO - 30)
          return (
            <text
              key={faixa.letra}
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              className="font-display"
              fontSize="15"
              fontWeight="600"
              fill={i === ativo ? '#fbf3e0' : '#4d525c'}
              style={{ transition: 'fill 380ms var(--ease-vault)' }}
            >
              {faixa.letra}
            </text>
          )
        })}

        {/* Ponteiro. Nasce apontando para a direita (0°) e é rotacionado. */}
        <g
          ref={ponteiro}
          transform={`rotate(${anguloDaLetra(reduzido ? 0 : TOTAL - 1)} ${CENTRO.x} ${CENTRO.y})`}
        >
          <line
            x1={CENTRO.x}
            y1={CENTRO.y}
            x2={CENTRO.x + RAIO - 16}
            y2={CENTRO.y}
            stroke="#f3dfae"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx={CENTRO.x} cy={CENTRO.y} r="7" fill="#0a0a0c" stroke="#b07c24" strokeWidth="2" />
      </svg>

      {/* A leitura da faixa. `aria-live` para que a troca seja anunciada a quem
          navega por leitor de tela — sem isso a animação é invisível ali.

          A `key` no índice é o que dá a transição: trocá-la faz o React
          remontar o bloco, e a animação de entrada roda de novo a cada letra.
          Sem ela, o texto trocaria num corte seco no meio de um movimento
          suave. */}
      <div aria-live="polite" className="mt-6 min-h-[4.5rem] text-center">
        <div key={ativo} className="animate-[fade-in_420ms_var(--ease-vault)_both]">
          <p className="font-display text-2xl text-gold-100">
            {atual.letra} — {atual.rotulo}
          </p>
          <p className="mt-1.5 text-sm text-plat-400">{atual.nota}</p>
        </div>
      </div>
    </div>
  )
}
