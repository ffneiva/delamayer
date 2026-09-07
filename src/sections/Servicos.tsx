import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { useBrilho } from '@/hooks/useBrilho'
import { SERVICES } from '@/lib/business'
import { cn } from '@/lib/utils'

/**
 * Os serviços.
 *
 * Cada card abre para revelar o que a pessoa recebe. A escolha de esconder a
 * lista de entregas atrás de um clique não é estética: são seis serviços com
 * três a quatro itens cada, e mostrar tudo de uma vez produziria uma parede de
 * 24 marcadores que ninguém lê. O resumo cabe na varredura; o detalhe fica a
 * um toque de quem se interessou.
 *
 * O que NÃO se esconde é o nome e o resumo — a informação de consulta fica
 * sempre visível, e a escondida é só o aprofundamento.
 *
 * A abertura anima por `grid-template-rows: 0fr → 1fr`, que é a única forma de
 * transicionar até "altura do conteúdo" sem medir nada em JavaScript e sem
 * chutar um `max-height` que corta o texto quando ele cresce.
 */
export function Servicos() {
  const [aberto, setAberto] = useState<string | null>(SERVICES[0].id)
  const brilho = useBrilho()

  return (
    <section id="servicos" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading etiqueta="Serviços" titulo="O que a gente" complemento="faz de fato.">
          <p>Seis frentes, uma porta de entrada. Tudo começa no diagnóstico.</p>
        </SectionHeading>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:gap-5">
          {SERVICES.map((servico, i) => {
            const expandido = aberto === servico.id
            const painelId = `servico-painel-${servico.id}`

            return (
              <Reveal
                as="li"
                key={servico.id}
                delay={i * 0.05}
                {...brilho}
                className={cn(
                  'card brilho overflow-hidden transition-[border-color,background-color] duration-500',
                  expandido ? 'border-gold-800/70 bg-gold-900/[0.07]' : 'hover:border-plat-700',
                )}
              >
                <button
                  type="button"
                  onClick={() => setAberto(expandido ? null : servico.id)}
                  aria-expanded={expandido}
                  aria-controls={painelId}
                  className="flex w-full items-start gap-4 p-6 text-left lg:p-7"
                >
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-xl text-plat-50 lg:text-2xl">
                        {servico.name}
                      </span>
                      {servico.tag ? (
                        <span className="rounded-full border border-gold-800/70 px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.16em] text-gold-300 uppercase">
                          {servico.tag}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block text-sm text-plat-400">{servico.resumo}</span>
                  </span>

                  {/* Um "+" que vira "−". Duas barras cruzadas, a vertical
                      girando 90° — mais legível que trocar o glifo, porque a
                      transição comunica que é o mesmo controle. */}
                  <span aria-hidden className="relative mt-1 block h-4 w-4 shrink-0 text-gold-400">
                    <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                    <span
                      className={cn(
                        'absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-vault)]',
                        expandido && 'rotate-90',
                      )}
                    />
                  </span>
                </button>

                <div
                  id={painelId}
                  className="grid transition-[grid-template-rows] duration-600 ease-[var(--ease-vault)]"
                  style={{ gridTemplateRows: expandido ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 lg:px-7 lg:pb-7">
                      <p className="text-[0.95rem] leading-relaxed text-plat-300">
                        {servico.description}
                      </p>

                      <p className="label-mono mt-6 mb-3">Você recebe</p>
                      <ul className="space-y-2.5">
                        {servico.entrega.map((item) => (
                          <li key={item} className="flex gap-3 text-sm text-plat-400">
                            <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-gold-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
