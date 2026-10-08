import { Contador } from '@/components/Contador'
import { Marquee } from '@/components/Marquee'
import { Reveal } from '@/components/Reveal'
import { EVIDENCIAS } from '@/lib/business'

/**
 * O painel de contexto.
 *
 * A função desta seção é dizer "você não é o único" antes de qualquer coisa
 * ser vendida — e provar com número, não com adjetivo. Metade da população
 * adulta do país está na mesma situação de quem está lendo.
 *
 * Cada card carrega a fonte junto. Não é rodapé jurídico: é o argumento. Um
 * site de crédito que exibe estatística sem atribuição é indistinguível dos
 * que a inventam, e a diferença precisa estar visível na mesma altura do olho.
 */
export function Numeros() {
  const fonte = EVIDENCIAS[0]

  return (
    <section className="relative overflow-hidden border-y border-edge bg-ink/60 py-16 md:py-20">
      {/* Faixa correndo ao fundo: repete a ideia sem competir com os números. */}
      <Marquee duracao={46} className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-[0.045]">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: repetição decorativa fixa
            key={i}
            className="font-display text-[clamp(4rem,12vw,9rem)] leading-none font-semibold whitespace-nowrap text-plat-100"
          >
            NÃO É SÓ VOCÊ ·
          </span>
        ))}
      </Marquee>

      <div className="container-x relative">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {EVIDENCIAS.map((evidencia, i) => (
            <Reveal as="li" key={evidencia.id} delay={i * 0.07}>
              <Contador
                texto={evidencia.valor}
                className="gold block font-display text-[clamp(2.2rem,4.6vw,3.1rem)] leading-none font-semibold"
              />
              <p className="mt-3 text-sm leading-relaxed text-plat-400">{evidencia.legenda}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.3}>
          <p className="mt-10 text-xs text-plat-600">
            Fonte:{' '}
            {fonte.url ? (
              <a
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline decoration-plat-700 underline-offset-4 transition-colors hover:text-plat-400"
              >
                {fonte.fonte}
              </a>
            ) : (
              fonte.fonte
            )}
            .
          </p>
        </Reveal>
      </div>
    </section>
  )
}
