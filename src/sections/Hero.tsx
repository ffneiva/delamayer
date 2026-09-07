import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { Cena3D } from '@/components/Cena3D'
import { Magnetic } from '@/components/Magnetic'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { BUSINESS } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { cn } from '@/lib/utils'

/**
 * A primeira dobra.
 *
 * Três decisões de carregamento moram aqui, e todas existem porque a maior
 * parte do tráfego chega de Instagram, em celular, em rede móvel:
 *
 * 1. **A cena WebGL é `lazy`.** O chunk do three.js passa de 700 kB. Ele é
 *    buscado depois que a página já está interativa, e o `Suspense` mostra no
 *    lugar um halo dourado — não um retângulo cinza, que prometeria uma caixa
 *    que nunca chega.
 *
 * 2. **Ela nem existe em tela pequena.** `useIsDesktop` decide ANTES do
 *    `lazy`, então o import dinâmico sequer é disparado no celular. Um objeto
 *    3D com pointer-follow não tem o que seguir num aparelho sem ponteiro, e a
 *    conta de bateria é real.
 *
 * 3. **Nem em `prefers-reduced-motion`.** Pelo mesmo motivo.
 *
 * O texto NUNCA depende de nada disso. Ele é HTML no bundle principal, e a
 * animação de entrada só esconde alguma coisa quando a classe `hero-armed`
 * está presente — ver o comentário em index.css.
 */
const LINHAS = ['Do CPF travado', 'à chave do', 'apartamento.']

export function Hero({ ready }: { ready: boolean }) {
  const reduzido = useReducedMotion()

  return (
    <section
      id="inicio"
      className={cn(
        'relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20',
        // `hero-armed` é o interruptor de segurança: sem ele, nada é escondido.
        !reduzido && 'hero-armed',
        ready && 'hero-ready',
      )}
    >
      {/* A cena fica atrás do texto e ocupa a metade direita no desktop. */}
      <Cena3D
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block"
        giroPorScroll={0.55}
      />

      <div className="container-x relative z-10">
        <p data-hero-fade className="label-mono mb-7 flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold-700" />
          {BUSINESS.address.city} · {BUSINESS.address.state}
        </p>

        <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,8.2vw,6.2rem)] leading-[0.98] font-semibold">
          {LINHAS.map((linha, i) => (
            <span
              key={linha}
              data-hero-line
              className="block overflow-hidden pt-[0.06em] pb-[0.02em]"
            >
              <span className={cn('block', i === 2 ? 'gold' : 'text-plat-50')}>{linha}</span>
            </span>
          ))}
        </h1>

        <div data-hero-rule aria-hidden className="hairline mt-9 max-w-md origin-left" />

        <p data-hero-fade className="mt-8 max-w-lg text-[1.02rem] leading-relaxed text-plat-300">
          Regularizar o nome é o meio, não o fim. A gente lê o que trava o seu crédito, negocia com
          quem pode dar baixa e acompanha até a consulta mostrar o combinado.
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic forca={0.22}>
            <BotaoWhatsApp
              href={linkWhatsApp(
                `Olá! Vim pelo site da ${BUSINESS.shortName} e quero fazer a consulta do meu CPF.`,
              )}
              origem="hero"
            >
              Consulta grátis no WhatsApp
            </BotaoWhatsApp>
          </Magnetic>

          <ButtonLink href="/diagnostico" variante="contorno" rotuloCursor="Abrir">
            Fazer o diagnóstico
          </ButtonLink>
        </div>

        {/* Prova social honesta: não há avaliação pública nem depoimento
            verificável, então o que se exibe é o que existe — a matéria em TV
            aberta. Inventar "+500 clientes" seria o começo da ladeira. */}
        <p data-hero-fade className="mt-9 max-w-md text-sm text-plat-500">
          O tema virou pauta na TV Serra Dourada, afiliada do SBT em Goiás.{' '}
          <a
            href="/rating"
            className="text-plat-300 underline decoration-gold-800 underline-offset-4 transition-colors hover:text-gold-200"
          >
            Entenda por que score e rating discordam
          </a>
          .
        </p>
      </div>

      {/* Pista de rolagem. Some quando a pessoa já rolou — indicar "role para
          baixo" para quem já rolou é ruído. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-7 hidden justify-center md:flex motion-reduce:hidden"
      >
        <span className="label-mono flex flex-col items-center gap-3 text-[0.62rem] text-plat-600">
          Role
          <span className="relative block h-10 w-px overflow-hidden bg-edge">
            <span
              className="absolute inset-x-0 top-0 h-4 bg-linear-to-b from-transparent to-gold-400"
              style={{ animation: 'hero-fade-up 1.8s ease-in-out infinite alternate' }}
            />
          </span>
        </span>
      </div>
    </section>
  )
}
