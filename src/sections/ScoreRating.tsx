import { ButtonLink } from '@/components/Button'
import { RatingDial } from '@/components/RatingDial'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { TabelaComparativa } from '@/components/TabelaComparativa'

/**
 * Score × Rating — a seção que carrega o posicionamento inteiro.
 *
 * Todo concorrente vende "limpar nome". Este é o único conteúdo do site que
 * nenhum deles tem, porque exige explicar em vez de prometer: existem dois
 * indicadores, eles discordam, e é a discordância que produz a recusa que
 * ninguém entende.
 *
 * A comparação vive em `<TabelaComparativa>`, que é compartilhada com a página
 * /rating — as duas mostram exatamente os mesmos dados, e mantê-las em dois
 * lugares garantia que um dia divergissem.
 */
export function ScoreRating() {
  return (
    <section id="score-rating" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          etiqueta="O diferencial"
          titulo="Score alto e crédito negado"
          complemento="não é contradição."
        >
          <p>
            São dois indicadores, com donos diferentes. Dá para ter 800 pontos no Serasa e um "D" no
            banco onde você pediu o financiamento.
          </p>
        </SectionHeading>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-20">
          <Reveal>
            <TabelaComparativa />
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <p className="label-mono mb-8 text-center">A escala que o banco usa</p>
            </Reveal>

            <RatingDial />

            <Reveal delay={0.2}>
              <p className="mt-8 text-center text-sm leading-relaxed text-plat-500">
                Ele não aparece em consulta nenhuma. O que dá para ler são os sinais que ele deixa —
                o histórico no Banco Central e os limites que sobem ou somem.
              </p>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/rating" variante="contorno" rotuloCursor="Abrir">
                  Ver a explicação completa
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
