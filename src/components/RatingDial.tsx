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
          start: 'top 78%',
          end: 'bottom 42%',
          scrub: 0.8,
        },
        onUpdate: () => {
          // progresso 0 = F (pior), 1 = A (melhor)
          const angulo = ANGULO_INICIAL + ABERTURA * alvo.progresso
          if (ponteiro.current) {
            ponteiro.current.setAttribute('transform', `rotate(${angulo} ${CENTRO.x} ${CENTRO.y})`)
          }

          // De progresso para índice de RATING_ESCALA (que está de A a F).
          const faixa = clamp(Math.floor(alvo.progresso * TOTAL), 0, TOTAL - 1)
          setAtivo(TOTAL - 1 - faixa)
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
          navega por leitor de tela — sem isso a animação é invisível ali. */}
      <div aria-live="polite" className="mt-6 min-h-[4.5rem] text-center">
        <p className="font-display text-2xl text-gold-100">
          {atual.letra} — {atual.rotulo}
        </p>
        <p className="mt-1.5 text-sm text-plat-400">{atual.nota}</p>
      </div>
    </div>
  )
}
