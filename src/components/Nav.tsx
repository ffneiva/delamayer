import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { registrarConversaoWhatsApp } from '@/lib/analytics'
import { BUSINESS, SERVICOS_NUCLEO } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { estadoAtual } from '@/lib/hours'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { Magnetic } from './Magnetic'

/**
 * Cabeçalho e menu.
 *
 * Duas coisas justificam o `motion` aqui — e só aqui, no caso do menu:
 * a animação de **saída**. Quando o painel fecha, o nó precisa continuar na
 * árvore por 600 ms para animar; CSS puro não faz isso, porque o React já
 * removeu o elemento. `AnimatePresence` resolve exatamente esse caso.
 *
 * A entrada continua sendo CSS (`.menu-panel`, `.menu-item` em index.css):
 * é mais barata e não depende de a biblioteca ter carregado.
 */

/**
 * Os três serviços que a empresa executa, na barra do topo.
 *
 * Eles vêm antes de qualquer outra coisa no menu porque é essa a pergunta que
 * quem chega faz primeiro — "o que vocês fazem?" — e a resposta não pode
 * depender de rolar a página. O rótulo curto é o que cabe na barra; o nome
 * inteiro aparece no menu completo, logo abaixo dele.
 */
const NUCLEO = SERVICOS_NUCLEO.map((servico) => ({
  id: `servico-${servico.id}`,
  rotulo: servico.curto ?? servico.name,
  /** Só aparece quando difere do rótulo — repetir a mesma frase seria ruído. */
  detalhe: servico.curto && servico.curto !== servico.name ? servico.name : undefined,
}))

const SECOES = [
  ...NUCLEO,
  { id: 'metodo', rotulo: 'Como funciona', detalhe: undefined },
  { id: 'score-rating', rotulo: 'Score × Rating', detalhe: undefined },
  { id: 'diagnostico-cta', rotulo: 'Diagnóstico', detalhe: undefined },
  { id: 'transparencia', rotulo: 'O que não fazemos', detalhe: undefined },
  { id: 'contato', rotulo: 'Contato', detalhe: undefined },
]

type Props = {
  onSection: (id: string) => void
  onNavigate: (path: string) => void
  path: string
}

export function Nav({ onSection, onNavigate, path }: Props) {
  const [aberto, setAberto] = useState(false)
  const [encolhido, setEncolhido] = useState(false)
  const [escondido, setEscondido] = useState(false)
  const estado = estadoAtual()

  /**
   * O cabeçalho recua ao descer e volta ao subir.
   *
   * Numa página desta altura, uma barra fixa fica no caminho da leitura o tempo
   * todo. Recuando na descida ela devolve ~70 px de tela para o conteúdo; e
   * como subir é o gesto de quem está procurando alguma coisa, é exatamente aí
   * que a navegação precisa reaparecer.
   *
   * Duas guardas contra a barra piscando:
   *
   * · **Zona de segurança no topo.** Perto do topo ela nunca some — sumir na
   *   primeira rolada, quando o logotipo ainda está sendo visto, parece defeito.
   *
   * · **Acúmulo de direção, e não o último evento.** Reagir ao delta de um
   *   evento só falha com scroll suave: o Lenis chega ao destino com uma
   *   desaceleração que às vezes passa alguns pixels e volta, e esse último
   *   movimento negativo revelava a barra no fim de toda descida. Aqui a
   *   direção só troca depois de LIMIAR pixels acumulados no novo sentido, o
   *   que ignora o ricochete sem ignorar a intenção.
   */
  useEffect(() => {
    let anterior = window.scrollY
    let acumulado = 0
    const LIMIAR = 28

    const aoRolar = () => {
      const y = window.scrollY
      setEncolhido(y > 24)

      const movimento = y - anterior
      anterior = y

      // Trocou de sentido: zera o acumulador e recomeça a contar.
      if (Math.sign(movimento) !== Math.sign(acumulado)) acumulado = 0
      acumulado += movimento

      if (acumulado > LIMIAR) setEscondido(y > 260)
      else if (acumulado < -LIMIAR) setEscondido(false)
    }

    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Fechar com Escape e travar a rolagem enquanto o painel está aberto.
  useEffect(() => {
    if (!aberto) return

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', aoTeclar)

    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  const irParaSecao = (id: string) => {
    setAberto(false)
    onSection(id)
  }

  const irParaRota = (destino: string) => {
    setAberto(false)
    onNavigate(destino)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[200] transition-all duration-500 ease-[var(--ease-vault)]',
          encolhido
            ? 'border-b border-edge/80 bg-obsidian/80 py-3 backdrop-blur-xl'
            : 'border-b border-transparent py-5',
          // Com o menu aberto a barra fica, sempre: é dela que sai o botão de
          // fechar, e escondê-la deixaria o painel sem saída visível.
          escondido && !aberto && '-translate-y-full',
        )}
      >
        <div className="container-x flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              irParaRota('/')
            }}
            className="shrink-0"
            aria-label={`${BUSINESS.name} — início`}
          >
            <Logo className="text-[1.05rem] md:text-[1.15rem]" />
          </a>

          {/* A barra carrega os serviços, não as rotas. As páginas continuam
              acessíveis no menu completo e no rodapé — mas o espaço nobre vai
              para o que a empresa faz, que é o que o visitante veio saber.

              São âncoras de verdade (`/#id`) e não botões: assim funcionam com
              clique do meio, com "abrir em nova aba" e para o robô, que segue
              o href. O `preventDefault` só troca o salto seco pela rolagem. */}
          <nav aria-label="Serviços" className="hidden items-center gap-7 lg:flex">
            {NUCLEO.map((servico) => (
              <a
                key={servico.id}
                href={`/#${servico.id}`}
                title={servico.detalhe}
                onClick={(e) => {
                  e.preventDefault()
                  onSection(servico.id)
                }}
                className="group relative py-1 text-sm text-plat-300 transition-colors duration-300 hover:text-plat-50"
              >
                {servico.rotulo}
                {/* Sublinhado que cresce do centro. `scaleX` no compositor,
                    e não `width`, que forçaria layout no hover. */}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-center scale-x-0 bg-gold-400 transition-transform duration-500 ease-[var(--ease-vault)] group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Selo de aberto/fechado. Some no celular: ali o espaço vale mais
                para o botão de contato. */}
            <span className="hidden items-center gap-2 font-mono text-[0.68rem] tracking-wider text-plat-400 uppercase xl:flex">
              <span
                aria-hidden
                className={cn(
                  'relative flex h-1.5 w-1.5 rounded-full',
                  estado.aberto ? 'bg-gold-300' : 'bg-plat-600',
                )}
              >
                {estado.aberto && (
                  <span
                    className="absolute inset-0 rounded-full bg-gold-300 motion-reduce:hidden"
                    style={{ animation: 'pulse-ring 2.4s ease-out infinite' }}
                  />
                )}
              </span>
              {estado.rotulo}
            </span>

            <Magnetic forca={0.25}>
              <a
                href={linkWhatsApp(`Olá! Vim pelo site da ${BUSINESS.shortName}.`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrarConversaoWhatsApp('cabecalho')}
                data-cursor="Falar"
                className="hidden rounded-full border border-gold-700/70 bg-gold-900/25 px-5 py-2 text-sm text-gold-100 transition-colors duration-400 hover:border-gold-400 hover:bg-gold-800/40 sm:inline-flex"
              >
                Consulta grátis
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-principal"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              className="relative z-[220] flex h-11 w-11 items-center justify-center rounded-full border border-edge text-plat-100 transition-colors duration-300 hover:border-gold-700"
            >
              {/* Duas barras que viram um X. A de cima roda 45°, a de baixo
                  −45°, e as duas convergem para o centro. */}
              <span className="relative block h-3 w-5">
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 top-0 h-px bg-current transition-transform duration-400 ease-[var(--ease-vault)]',
                    aberto && 'translate-y-[6px] rotate-45',
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-400 ease-[var(--ease-vault)]',
                    aberto && '-translate-y-[6px] -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {aberto && (
          <motion.div
            id="menu-principal"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[210] bg-obsidian/97 backdrop-blur-2xl"
          >
            <div className="container-x flex h-full flex-col justify-center pt-24 pb-12">
              <nav aria-label="Menu completo">
                <ul>
                  {SECOES.map((secao, i) => (
                    <li key={secao.id} className="menu-item overflow-hidden">
                      <button
                        type="button"
                        onClick={() => irParaSecao(secao.id)}
                        data-cursor="Ir"
                        className="group flex w-full items-baseline gap-5 py-2 text-left md:gap-8"
                      >
                        <span className="font-mono text-[0.7rem] text-gold-700 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-[clamp(1.6rem,5.6vw,3.1rem)] leading-[1.05] font-semibold text-plat-300 transition-colors duration-400 group-hover:text-gold-100">
                            {secao.rotulo}
                          </span>
                          {secao.detalhe ? (
                            <span className="mt-1 block text-[0.8rem] text-plat-500">
                              {secao.detalhe}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* As páginas saíram da barra do topo e moram aqui — continuam a
                  um clique, e continuam sendo links que o robô segue. */}
              <nav aria-label="Páginas" className="mt-8 border-t border-edge pt-6">
                <ul className="flex flex-wrap gap-x-7 gap-y-3">
                  {ROUTES.filter((r) => r.path !== '/').map((rota) => (
                    <li key={rota.path}>
                      <a
                        href={rota.path}
                        onClick={(e) => {
                          e.preventDefault()
                          irParaRota(rota.path)
                        }}
                        className={cn(
                          'text-sm transition-colors duration-300',
                          path === rota.path
                            ? 'text-gold-200'
                            : 'text-plat-400 hover:text-gold-200',
                        )}
                      >
                        {rota.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-edge pt-8 text-sm">
                <a
                  href={linkWhatsApp(`Olá! Vim pelo site da ${BUSINESS.shortName}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registrarConversaoWhatsApp('menu')}
                  className="text-gold-200 hover:text-gold-100"
                >
                  WhatsApp {BUSINESS.phoneDisplay}
                </a>
                <a
                  href={BUSINESS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-plat-400 hover:text-plat-100"
                >
                  {BUSINESS.instagramHandle}
                </a>
                <span className="text-plat-500">
                  {BUSINESS.address.district}, {BUSINESS.address.city}/{BUSINESS.address.state}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
