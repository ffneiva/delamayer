import { useRef } from 'react'
import { BotaoWhatsApp } from '@/components/Button'
import { Cena3D } from '@/components/Cena3D'
import { Magnetic } from '@/components/Magnetic'
import { Reveal, SplitHeading } from '@/components/Reveal'
import { useGsap } from '@/hooks/useGsap'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { BUSINESS } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'

/**
 * O fecho.
 *
 * O monograma cresce e sobe conforme a seção entra — um parallax de escala
 * amarrado à rolagem. É o único lugar do site em que a marca aparece grande, e
 * a intenção é que a última coisa vista antes do rodapé seja ela.
 *
 * A escala parte de 0,72 e não de 0: um elemento que nasce em `scale(0)` some
 * completamente se o gatilho falhar, e o fim da página ficaria com um buraco.
 */
export function FinalCta() {
  const escopo = useRef<HTMLDivElement>(null)
  const reduzido = useReducedMotion()

  useGsap(
    (gsap) => {
      gsap.fromTo(
        '[data-marca-final]',
        { scale: 0.82, y: 50, opacity: 0.4 },
        {
          scale: 1,
          y: -10,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: escopo.current,
            start: 'top 88%',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        },
      )
    },
    escopo,
    [],
    !reduzido,
  )

  return (
    <section ref={escopo} className="relative overflow-hidden py-28 md:py-36">
      <div className="container-x relative text-center">
        {/* A marca fecha a página em ouro maciço, e não como desenho plano.
            O `Cena3D` só monta quando a seção entra na tela, então o segundo
            contexto WebGL nunca convive com o do herói. */}
        <div data-marca-final className="mx-auto mb-6 h-56 w-full max-w-md md:h-72">
          <Cena3D className="h-full w-full" escala={1.25} giroPorScroll={-0.45} />
        </div>

        <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2.1rem,6vw,4.4rem)] leading-[1.02] font-semibold">
          <SplitHeading text="A consulta é hoje." metal="prata" />{' '}
          <SplitHeading text="A liberdade vem depois." metal="ouro" stagger={0.05} />
        </h2>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-7 max-w-xl text-[1.02rem] leading-relaxed text-plat-400">
            Manda o CPF pelo WhatsApp e a leitura sai na conversa. Sem custo e sem compromisso.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Magnetic forca={0.22}>
              <BotaoWhatsApp
                href={linkWhatsApp(
                  `Olá! Vim pelo site da ${BUSINESS.shortName} e quero fazer a consulta do meu CPF.`,
                )}
                origem="cta-final"
                className="px-9 py-4 text-base"
              >
                Falar no WhatsApp {BUSINESS.phoneDisplay}
              </BotaoWhatsApp>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <p className="mt-8 text-xs text-plat-600">
            Atendimento de segunda a sexta, das 8h às 18h — mensagem fora do horário é respondida no
            próximo dia útil.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
