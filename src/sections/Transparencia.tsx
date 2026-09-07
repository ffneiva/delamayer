import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { NAO_FAZEMOS } from '@/lib/business'

/**
 * "O que a gente não faz."
 *
 * É a seção mais arriscada e a mais importante do site. Todo manual de
 * conversão diz para não introduzir objeção; aqui a objeção é introduzida de
 * propósito, porque o mercado inteiro já a plantou antes — quem chega nesta
 * página vem de anúncios que prometem "CPF limpo em 7 dias" e desconfia de
 * todo mundo, com razão.
 *
 * Dizer primeiro o que não se faz é a única forma de tornar acreditável o que
 * se faz. E tem um efeito colateral que os concorrentes não conseguem copiar:
 * para repetir esta seção, eles teriam que parar de prometer.
 *
 * O fundo invertido (mais claro que o resto) separa o bloco visualmente. É a
 * única seção do site com esse tratamento — a exceção é o que a marca.
 */
export function Transparencia() {
  return (
    <section
      id="transparencia"
      className="relative scroll-mt-24 overflow-hidden border-y border-edge bg-vault py-24 md:py-32"
    >
      {/* Diagonal em ouro no fundo: o mesmo gesto do símbolo da marca, em
          escala de seção. Fica muito apagada de propósito — é textura, não
          ilustração. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          background: 'repeating-linear-gradient(115deg, transparent 0 62px, #d4a855 62px 63px)',
        }}
      />

      <div className="container-x relative">
        <SectionHeading etiqueta="Transparência" titulo="O que a gente" complemento="não faz.">
          <p>
            Três promessas que você encontra por aí e não encontra aqui — porque cumprir é
            impossível.
          </p>
        </SectionHeading>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-edge bg-edge md:grid-cols-3">
          {NAO_FAZEMOS.map((item, i) => (
            <Reveal as="li" key={item.titulo} delay={i * 0.09} className="bg-vault p-7 lg:p-9">
              {/* O "×" desenhado, e não o caractere: em fonte display o × de
                  texto fica pequeno e desalinhado com a linha de base. */}
              <span aria-hidden className="relative mb-6 block h-5 w-5 text-gold-600">
                <span className="absolute top-1/2 left-0 h-px w-full origin-center rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full origin-center -rotate-45 bg-current" />
              </span>

              <h3 className="font-display text-xl leading-snug text-plat-50">{item.titulo}</h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-plat-400">{item.texto}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
