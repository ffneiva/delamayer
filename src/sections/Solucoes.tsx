import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { useBrilho } from '@/hooks/useBrilho'
import { SERVICOS_NUCLEO } from '@/lib/business'

/**
 * Os três serviços, logo abaixo da dobra.
 *
 * Esta seção existe por um motivo que não é de design: quem cai no site precisa
 * saber o que se faz aqui antes de rolar qualquer coisa. A versão anterior da
 * página contava a história primeiro — o tamanho do problema, a matéria na TV,
 * o manifesto — e só nomeava os serviços lá pela sétima seção. Funciona para
 * quem lê; não funciona para quem chegou de anúncio e tem cinco segundos de
 * paciência.
 *
 * O cabeçalho carrega a correção mais importante do site: a retirada do nome
 * negativado **não** é negociação de dívida, é ação judicial com pedido de
 * tutela antecipada. O texto inteiro do site foi reescrito em torno disso —
 * ver o comentário longo em business.ts, acima de SERVICES.
 *
 * Cada cartão tem `id` próprio (`servico-<id>`) porque é para eles que o menu
 * do topo aponta. Sem o `scroll-mt`, a barra fixa cobriria o título no salto.
 */
export function Solucoes() {
  const brilho = useBrilho()

  return (
    <section id="solucoes" className="scroll-mt-24 py-20 md:py-28">
      <div className="container-x">
        <SectionHeading etiqueta="O que a gente faz" titulo="Três frentes," complemento="nomeadas.">
          <p>
            Nenhuma delas passa por negociação de dívida. Limpa nome e exclusão de Bacen correm por
            processo judicial, com pedido de liminar — a tutela antecipada, que é o resultado antes
            da sentença. O destravamento do rating de crédito bancário é o único operacional: ali
            não se abre processo, se trabalha o relacionamento com o banco.
          </p>
        </SectionHeading>

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {SERVICOS_NUCLEO.map((servico, i) => (
            <Reveal
              as="li"
              key={servico.id}
              id={`servico-${servico.id}`}
              delay={i * 0.08}
              {...brilho}
              className="card brilho flex scroll-mt-28 flex-col p-7 transition-colors duration-500 hover:border-gold-800/70 lg:p-8"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-[0.7rem] text-gold-700 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {servico.tag ? (
                  <span className="rounded-full border border-gold-800/70 px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.16em] text-gold-300 uppercase">
                    {servico.tag}
                  </span>
                ) : null}
              </span>

              <h3 className="mt-5 font-display text-[1.45rem] leading-[1.15] text-plat-50">
                {servico.name}
              </h3>

              <p className="mt-3 text-[0.95rem] text-gold-200/90">{servico.resumo}</p>

              <p className="mt-4 text-[0.92rem] leading-relaxed text-plat-400">
                {servico.description}
              </p>

              <p className="label-mono mt-7 mb-3">Você recebe</p>
              <ul className="space-y-2.5">
                {servico.entrega.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-plat-400">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
