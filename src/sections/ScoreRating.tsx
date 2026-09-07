import { ButtonLink } from '@/components/Button'
import { RatingDial } from '@/components/RatingDial'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { SCORE_VS_RATING } from '@/lib/business'

/**
 * Score × Rating — a seção que carrega o posicionamento inteiro.
 *
 * Todo concorrente vende "limpar nome". Este é o único conteúdo do site que
 * nenhum deles tem, porque exige explicar em vez de prometer: existem dois
 * indicadores, eles discordam, e é a discordância que produz a recusa que
 * ninguém entende.
 *
 * A tabela é uma `<table>` de verdade, e não uma grade de `<div>`. São dados
 * comparáveis em duas dimensões — critério e indicador —, exatamente o caso
 * para o qual a tag existe; num leitor de tela, a versão em div viraria uma
 * lista de doze frases soltas sem dizer qual pertence a qual coluna.
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
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Comparação entre o score de crédito e o rating bancário
                </caption>
                <thead>
                  <tr className="border-b border-edge">
                    <th scope="col" className="label-mono px-5 py-4 font-normal">
                      Critério
                    </th>
                    <th scope="col" className="px-5 py-4 font-display text-base text-plat-100">
                      Score
                    </th>
                    <th scope="col" className="px-5 py-4 font-display text-base text-gold-200">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SCORE_VS_RATING.map((linha) => (
                    <tr
                      key={linha.criterio}
                      className="border-b border-edge/60 transition-colors duration-400 last:border-0 hover:bg-white/[0.018]"
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 align-top font-normal text-plat-500 whitespace-nowrap"
                      >
                        {linha.criterio}
                      </th>
                      <td className="px-5 py-4 align-top text-plat-300">{linha.score}</td>
                      <td className="px-5 py-4 align-top text-gold-100/90">{linha.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
