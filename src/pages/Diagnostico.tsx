import { DiagnosticoTool } from '@/components/DiagnosticoTool'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { NAO_FAZEMOS } from '@/lib/business'

/**
 * /diagnostico — a ferramenta sozinha, sem o resto da home.
 *
 * É o destino dos anúncios e do link da bio do Instagram. A página inteira tem
 * um objetivo só, e nada compete com ele: sem seções de serviço, sem
 * depoimento, sem mapa. O que sobra abaixo da ferramenta é a única coisa que
 * ajuda a decidir — as três promessas que a Delamayer não faz.
 */
export function Diagnostico({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Diagnóstico"
        titulo="Cinco perguntas"
        complemento="e uma leitura honesta."
        onNavigate={onNavigate}
      >
        <p>
          Não substitui a consulta ao seu CPF — essa exige a sua autorização e acontece na conversa.
          O que isto faz é aplicar, em cinco cliques, a mesma triagem que abre todo atendimento, e
          te dar o vocabulário para perguntar a coisa certa.
        </p>
      </PageHero>

      <section className="pb-24 md:pb-32">
        <div className="container-x">
          <DiagnosticoTool className="mx-auto max-w-2xl" />
        </div>
      </section>

      <section className="border-t border-edge bg-vault py-20 md:py-24">
        <div className="container-x">
          <Reveal>
            <p className="label-mono mb-8">Antes de contratar qualquer um, incluindo a gente</p>
          </Reveal>

          <ul className="grid gap-8 md:grid-cols-3">
            {NAO_FAZEMOS.map((item, i) => (
              <Reveal as="li" key={item.titulo} delay={i * 0.08}>
                <h2 className="font-display text-lg leading-snug text-plat-50">{item.titulo}</h2>
                <p className="mt-3 text-sm leading-relaxed text-plat-400">{item.texto}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
