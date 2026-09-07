import { useRef } from 'react'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { useGsap } from '@/hooks/useGsap'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { METODO } from '@/lib/business'

/**
 * O método, em quatro etapas — pinado e com rolagem horizontal no desktop.
 *
 * O gesto tem significado aqui, e não é enfeite: as quatro etapas são uma
 * sequência no tempo, e rolar para o lado enquanto a seção fica parada é a
 * tradução física de "avançar no processo". Numa lista vertical comum, a quarta
 * etapa concorreria com o que vem depois dela na página.
 *
 * No celular a seção vira uma lista vertical normal. Sequestrar a rolagem num
 * aparelho de toque é a forma mais rápida de fazer alguém sair do site — e
 * `pin` com `scrub` em toque tem histórico de brigar com a barra de endereço
 * que aparece e some.
 *
 * ── O bug que este arquivo já teve ──────────────────────────────────────────
 *
 * A primeira versão media a distância com `trilho.scrollWidth -
 * trilho.clientWidth`. O trilho é `w-max` — ou seja, ele tem exatamente a
 * largura do próprio conteúdo —, então os dois valores são **sempre iguais** e a
 * distância dava zero. O pin existia com comprimento zero, a rolagem horizontal
 * nunca acontecia, e a quarta etapa ficava permanentemente fora da tela.
 *
 * A medida certa compara o trilho com a **viewport**, que é o que de fato
 * limita o que se enxerga.
 */
export function Metodo() {
  const escopo = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLUListElement>(null)
  const desktop = useIsDesktop()
  const reduzido = useReducedMotion()
  const horizontal = desktop && !reduzido

  useGsap(
    (gsap) => {
      const el = trilho.current
      if (!el) return

      // Quanto falta para o último cartão encostar na borda direita da tela.
      // O `+ 1` de folga evita um pin de 1 px quando tudo já cabe.
      const distancia = () => Math.max(0, el.scrollWidth - window.innerWidth + 1)

      gsap.to(el, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: escopo.current,
          start: 'top top',
          // A altura de rolagem é a distância horizontal: assim a velocidade
          // percebida do lado é a mesma da rolagem vertical, e o gesto não
          // parece nem lento nem descontrolado.
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    escopo,
    [horizontal],
    horizontal,
  )

  return (
    <section id="metodo" className="scroll-mt-24">
      <div
        ref={escopo}
        // No desktop a seção ocupa exatamente uma tela: é ela que fica parada
        // enquanto os cartões correm. Sem altura fixa, o pin deixa um vão
        // embaixo do conteúdo — que foi como a primeira versão ficou.
        className="flex flex-col justify-center overflow-hidden py-24 lg:h-[100svh] lg:py-0"
      >
        <div className="container-x shrink-0">
          <SectionHeading
            etiqueta="Como funciona"
            titulo="Quatro etapas,"
            complemento="nesta ordem."
          >
            <p>
              A ordem importa mais que a velocidade. Pagar a dívida errada primeiro gasta o dinheiro
              que destravaria o crédito — e não muda nada na análise.
            </p>
          </SectionHeading>
        </div>

        <ul
          ref={trilho}
          className="mt-12 flex flex-col gap-6 px-5 md:px-10 lg:mt-14 lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:px-[max(2.5rem,calc((100vw-84rem)/2+3.5rem))]"
        >
          {METODO.map((etapa, i) => (
            <Reveal
              as="li"
              key={etapa.numero}
              delay={horizontal ? 0 : i * 0.08}
              className="card flex flex-col p-7 lg:w-[24rem] lg:shrink-0 lg:p-9"
            >
              <div className="flex items-baseline gap-4">
                <span
                  data-numero
                  className="gold font-display text-5xl leading-none font-semibold lg:text-6xl"
                >
                  {etapa.numero}
                </span>
                <span aria-hidden className="h-px flex-1 bg-edge" />
              </div>

              <h3 className="mt-7 font-display text-2xl text-plat-50 lg:text-3xl">
                {etapa.titulo}
              </h3>

              {/* `flex-1` empurra o rodapé do cartão para baixo, de modo que a
                  linha "Você sai com" fique na MESMA altura nos quatro — que é
                  o que faz a fileira parecer alinhada, e não quatro cartões
                  soltos de alturas parecidas. */}
              <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-plat-400">
                {etapa.texto}
              </p>

              <p className="mt-7 border-t border-edge pt-5 text-sm">
                <span className="label-mono mb-2 block">Você sai com</span>
                <span className="text-gold-100">{etapa.saida}</span>
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
