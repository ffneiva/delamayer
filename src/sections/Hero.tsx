import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { Cena3D } from '@/components/Cena3D'
import { Magnetic } from '@/components/Magnetic'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { scrollToSection } from '@/hooks/useSmoothScroll'
import { BUSINESS } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { cn } from '@/lib/utils'

/**
 * A primeira dobra.
 *
 * A cena 3D existe nas duas larguras, e o layout muda com ela:
 *
 * · **Desktop.** A peça ocupa a metade direita, ao lado do texto. É a
 *   composição clássica de anúncio: argumento à esquerda, produto à direita.
 *
 * · **Celular.** Não há metade direita para ocupar, então a peça vira um bloco
 *   EM FLUXO, entre o título e o parágrafo — o único lugar da dobra em que ela
 *   aparece inteira sem empurrar o botão para baixo da linha d'água.
 *
 *   Duas tentativas anteriores falharam, e vale registrar por quê: deixá-la
 *   atrás do texto com um véu por cima fazia ouro brigar com branco justo em
 *   cima dos botões; e ancorá-la com `absolute bottom-0` a jogava para fora da
 *   tela, porque a seção cresce além de 100svh quando o conteúdo não cabe — e
 *   aí o "bottom" da seção deixa de ser o bottom da dobra.
 *
 * O texto NUNCA depende de nada disso. Ele é HTML no bundle principal, e a
 * animação de entrada só esconde alguma coisa quando a classe `hero-armed`
 * está presente — ver o comentário em index.css. Se a cena não carregar, se o
 * WebGL não existir, se o aparelho pedir movimento reduzido, o que fica na tela
 * é exatamente a mesma dobra, sem o enfeite.
 */
const LINHAS = ['Do CPF negativado', 'ao financiamento', 'aprovado.']

export function Hero({ ready }: { ready: boolean }) {
  const reduzido = useReducedMotion()

  return (
    <section
      id="inicio"
      className={cn(
        // Coluna no celular (texto, depois a peça); linha centralizada no
        // desktop, onde a peça é posicionada de forma absoluta.
        'relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-20 lg:flex-row lg:items-center',
        // `hero-armed` é o interruptor de segurança: sem ele, nada é escondido.
        !reduzido && 'hero-armed',
        ready && 'hero-ready',
      )}
    >
      <div className="container-x z-10">
        <p data-hero-fade className="label-mono mb-7 flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold-700" />
          {BUSINESS.address.city} · {BUSINESS.address.state}
        </p>

        <h1 className="max-w-[16ch] font-display text-[clamp(2.35rem,8.2vw,6.2rem)] leading-[0.98] font-semibold">
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

        {/* Celular: bloco em fluxo, entre o fio e o parágrafo. Desktop: metade
            direita, altura inteira, fora do fluxo — o `lg:absolute` se ancora na
            seção, e não neste contêiner, porque ele é `static` de propósito. */}
        <Cena3D
          className="pointer-events-none my-8 h-[26svh] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:my-0 lg:h-auto lg:w-[52%]"
          giroPorScroll={0.55}
        />

        <p data-hero-fade className="max-w-lg text-[1.02rem] leading-relaxed text-plat-300 lg:mt-8">
          Três frentes: <strong className="font-normal text-plat-100">limpa nome</strong>, que sai
          por ação judicial com pedido de liminar;{' '}
          <strong className="font-normal text-plat-100">
            destravamento do rating de crédito bancário
          </strong>
          ; e <strong className="font-normal text-plat-100">exclusão de Bacen</strong>, o registro
          que o Serasa não mostra e o banco lê.
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
        {/* O destino é a seção do vídeo, logo abaixo — não a página /rating.
            Por ser rolagem dentro da mesma página, o controle certo é um botão:
            um link que não leva a lugar nenhum mente para o leitor de tela e
            para quem abre em nova aba. */}
        <p data-hero-fade className="mt-9 max-w-md text-sm text-plat-500">
          O tema virou pauta na TV Serra Dourada, afiliada do SBT em Goiás.{' '}
          <button
            type="button"
            onClick={() => scrollToSection('midia')}
            data-cursor="Ver"
            className="text-left text-plat-300 underline decoration-gold-800 underline-offset-4 transition-colors hover:text-gold-200"
          >
            Assista à matéria
          </button>
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
