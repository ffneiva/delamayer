import type { ReactNode } from 'react'
import { Reveal, SplitHeading } from './Reveal'

/**
 * Topo das páginas internas.
 *
 * Sem WebGL e sem preloader de propósito. /diagnostico, /rating e /imovel são
 * destino de anúncio e de link no Instagram: quem chega ali clicou num anúncio
 * específico e quer a coisa específica. Uma cortina de dois segundos e 700 kB
 * de three.js antes do conteúdo custariam o clique que já foi pago.
 *
 * A trilha de navegação no topo não é enfeite — é o que dá a quem caiu direto
 * na página alguma noção de onde está.
 */
type Props = {
  etiqueta: string
  titulo: string
  complemento?: string
  children?: ReactNode
  onNavigate: (path: string) => void
}

export function PageHero({ etiqueta, titulo, complemento, children, onNavigate }: Props) {
  return (
    <header className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
      <div className="container-x">
        <Reveal>
          <nav aria-label="Trilha de navegação" className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] text-plat-600 uppercase">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate('/')
                  }}
                  className="transition-colors hover:text-gold-300"
                >
                  Início
                </a>
              </li>
              <li aria-hidden>/</li>
              <li className="text-gold-500">{etiqueta}</li>
            </ol>
          </nav>
        </Reveal>

        <h1 className="max-w-[20ch] font-display text-[clamp(2.2rem,6.4vw,4.6rem)] leading-[1.02] font-semibold">
          <SplitHeading text={titulo} className="text-plat-50" />
          {complemento ? (
            <>
              {' '}
              <SplitHeading text={complemento} className="text-plat-600" stagger={0.05} />
            </>
          ) : null}
        </h1>

        {children ? (
          <Reveal delay={0.14}>
            <div className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-plat-400">
              {children}
            </div>
          </Reveal>
        ) : null}
      </div>
    </header>
  )
}
