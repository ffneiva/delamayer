import { ButtonLink } from '@/components/Button'
import { Mapa } from '@/components/Mapa'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { BUSINESS, SCHEDULE } from '@/lib/business'
import { agoraEmGoiania, estadoAtual, porExtenso } from '@/lib/hours'
import { cn } from '@/lib/utils'

/**
 * Endereço, horário e mapa.
 *
 * O mapa é desenhado pelo próprio site (ver components/Mapa): tiles do
 * OpenStreetMap posicionados por cálculo, com a paleta da marca e alfinete
 * dourado. Ele carrega de imediato — sem clique, sem iframe e sem cookie de
 * terceiro.
 */
export function Localizacao() {
  const estado = estadoAtual()
  const hoje = agoraEmGoiania().dia

  return (
    <section id="contato" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading etiqueta="Onde ficamos" titulo="Setor Oeste," complemento="Goiânia.">
          <p>
            O atendimento acontece por WhatsApp, do diagnóstico ao acompanhamento. O escritório
            existe para quem prefere olhar no olho.
          </p>
        </SectionHeading>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <Reveal>
              <div className="card p-7">
                <p className="label-mono mb-4">Endereço</p>
                <address className="space-y-1 text-[0.98rem] leading-relaxed text-plat-300 not-italic">
                  <p className="font-display text-lg text-plat-50">{BUSINESS.address.venue}</p>
                  <p>{BUSINESS.address.street}</p>
                  <p>
                    {BUSINESS.address.district} · {BUSINESS.address.city}/{BUSINESS.address.state}
                  </p>
                  <p className="text-plat-500">CEP {BUSINESS.address.zip}</p>
                </address>

                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink
                    href={BUSINESS.mapsLink}
                    externo
                    variante="contorno"
                    rotuloCursor="Abrir"
                    className="px-5 py-2.5 text-[0.83rem]"
                  >
                    Traçar rota
                  </ButtonLink>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card mt-5 p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="label-mono">Horário</p>
                  <span
                    className={cn(
                      'font-mono text-[0.68rem] tracking-wider uppercase',
                      estado.aberto ? 'text-gold-300' : 'text-plat-500',
                    )}
                  >
                    {estado.rotulo}
                  </span>
                </div>

                <dl className="space-y-2.5 text-sm">
                  {SCHEDULE.map((dia, i) => (
                    <div
                      key={dia.label}
                      className={cn(
                        'flex items-baseline justify-between gap-4 border-b border-edge/60 pb-2.5 last:border-0',
                        i === hoje && 'text-gold-100',
                      )}
                    >
                      <dt className={cn(i !== hoje && 'text-plat-400')}>{dia.label}</dt>
                      <dd className={cn('tabular-nums', i !== hoje && 'text-plat-300')}>
                        {dia.open && dia.close
                          ? `${porExtenso(dia.open)} — ${porExtenso(dia.close)}`
                          : 'Fechado'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <Mapa className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[26rem]" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
