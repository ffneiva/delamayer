import { useRef } from 'react'
import { useGsap } from '@/hooks/useGsap'
import { useReducedMotion } from '@/hooks/useMediaQuery'

/**
 * O texto que acende palavra por palavra conforme a pessoa rola.
 *
 * É a única animação do site em que a rolagem controla a *leitura*, e não só a
 * aparição: o texto começa apagado e cada palavra ganha contraste quando chega
 * a vez dela. Serve para forçar o ritmo de uma frase que, lida de corrido,
 * passa despercebida — e ela é o argumento central da marca.
 *
 * Duas escolhas técnicas que evitam armadilhas conhecidas:
 *
 * · **As palavras são `<span>` no JSX**, não fatiadas por SplitText em tempo
 *   de execução. O leitor de tela e o Google continuam lendo uma frase só, e
 *   não uma sopa de elementos.
 *
 * · **`opacity` de 0,18 a 1, nunca 0.** Se o GSAP falhar em carregar, ou se o
 *   gatilho não disparar, o texto continua legível. Um estado inicial de
 *   `opacity: 0` transformaria uma falha de biblioteca em página em branco.
 */
const TEXTO =
  'A maioria das pessoas descobre que tem um problema de crédito no pior momento ' +
  'possível: na frente do gerente, com a proposta na mão. E ouve uma explicação ' +
  'que não explica nada — “o sistema não aprovou”. O sistema tem nome, tem escala ' +
  'e tem motivo. Descobrir qual é o seu é a primeira coisa que a gente faz.'

export function Manifesto() {
  const escopo = useRef<HTMLDivElement>(null)
  const reduzido = useReducedMotion()

  useGsap(
    (gsap) => {
      gsap.to('[data-palavra]', {
        opacity: 1,
        color: '#edeff2',
        ease: 'none',
        stagger: 0.4,
        scrollTrigger: {
          trigger: escopo.current,
          start: 'top 68%',
          end: 'bottom 62%',
          scrub: 0.6,
        },
      })
    },
    escopo,
    [],
    !reduzido,
  )

  return (
    <section className="py-24 md:py-36">
      <div ref={escopo} className="container-x">
        <p className="max-w-4xl font-display text-[clamp(1.35rem,3.4vw,2.5rem)] leading-[1.35] font-medium">
          {TEXTO.split(' ').map((palavra, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: o texto é fixo e a posição é a identidade
              key={`${palavra}-${i}`}
              data-palavra
              className="inline-block text-plat-700"
              style={reduzido ? undefined : { opacity: 0.18 }}
            >
              {palavra}
              {' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
