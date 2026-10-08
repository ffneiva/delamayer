import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { FAQ, type FaqItem } from '@/lib/business'
import { cn } from '@/lib/utils'

/**
 * Perguntas frequentes.
 *
 * Um acordeão escrito à mão em vez de `<details>`: o elemento nativo não anima
 * a abertura de forma controlável entre navegadores, e aqui a transição de
 * altura é parte do acabamento. O custo é ter que implementar a semântica —
 * `aria-expanded`, `aria-controls` e a região com `role="region"` — que o
 * `<details>` daria de graça. É o que está feito abaixo.
 *
 * Só um item fica aberto por vez. Com nove respostas longas abertas ao mesmo
 * tempo, a seção viraria um muro de texto e a navegação por teclado teria que
 * atravessar tudo para chegar ao rodapé.
 *
 * As perguntas exibidas aqui são exatamente as que o JSON-LD declara como
 * FAQPage (ver lib/seo.ts) — declarar no dado estruturado uma pergunta que a
 * página não mostra é violação das diretrizes do Google.
 */
export function Faq({
  itens = FAQ,
  titulo = 'Perguntas que a gente',
  complemento = 'ouve toda semana.',
  etiqueta = 'Dúvidas',
}: {
  itens?: FaqItem[]
  titulo?: string
  complemento?: string
  etiqueta?: string
}) {
  const [aberto, setAberto] = useState<string | null>(itens[0]?.id ?? null)

  return (
    <section id="faq" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading etiqueta={etiqueta} titulo={titulo} complemento={complemento} />
          </div>

          <ul className="divide-y divide-edge border-y border-edge">
            {itens.map((item, i) => {
              const expandido = aberto === item.id
              const painelId = `faq-painel-${item.id}`
              const botaoId = `faq-botao-${item.id}`

              return (
                <Reveal as="li" key={item.id} delay={i * 0.04}>
                  <h3>
                    <button
                      type="button"
                      id={botaoId}
                      onClick={() => setAberto(expandido ? null : item.id)}
                      aria-expanded={expandido}
                      aria-controls={painelId}
                      className="group flex w-full items-start gap-5 py-6 text-left"
                    >
                      <span
                        className={cn(
                          'flex-1 font-display text-lg leading-snug transition-colors duration-400 md:text-xl',
                          expandido ? 'text-gold-100' : 'text-plat-100 group-hover:text-plat-50',
                        )}
                      >
                        {item.q}
                      </span>

                      <span
                        aria-hidden
                        className="relative mt-1.5 block h-4 w-4 shrink-0 text-gold-500"
                      >
                        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                        <span
                          className={cn(
                            'absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-vault)]',
                            expandido && 'rotate-90',
                          )}
                        />
                      </span>
                    </button>
                  </h3>

                  <section
                    id={painelId}
                    aria-labelledby={botaoId}
                    className="grid transition-[grid-template-rows] duration-600 ease-[var(--ease-vault)]"
                    style={{ gridTemplateRows: expandido ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pr-9 pb-7 text-[0.95rem] leading-relaxed text-plat-400">
                        {item.a}
                      </p>
                    </div>
                  </section>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
