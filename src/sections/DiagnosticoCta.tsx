import { DiagnosticoTool } from '@/components/DiagnosticoTool'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

/**
 * O diagnóstico na home.
 *
 * É a mesma ferramenta da rota /diagnostico, montada aqui em vez de virar um
 * botão que leva até lá. O motivo é de conversão, não de arquitetura: um
 * "clique para fazer o teste" custa uma navegação, e cada navegação perde
 * gente. Com a ferramenta na página, a primeira pergunta já está respondível
 * no mesmo gesto de rolagem.
 *
 * A rota separada continua existindo porque é destino de anúncio e de link no
 * Instagram — ali a pessoa precisa cair direto na ferramenta, sem rolar a home
 * inteira.
 */
export function DiagnosticoCta() {
  return (
    <section id="diagnostico-cta" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              etiqueta="Diagnóstico"
              titulo="Cinco perguntas"
              complemento="e uma leitura."
            >
              <p>
                A mesma triagem que abre todo atendimento, em cinco cliques — para você já chegar
                sabendo o que perguntar.
              </p>
            </SectionHeading>

            <Reveal delay={0.2}>
              <ul className="mt-9 space-y-3 text-sm text-plat-400">
                {[
                  'Roda inteiro no seu navegador',
                  'Sem cadastro, sem e-mail, sem servidor',
                  'O resultado vira uma mensagem que você decide enviar',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <DiagnosticoTool />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
