import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal, SplitHeading } from './Reveal'

/**
 * O cabeçalho padrão de seção: etiqueta monoespaçada, título e subtítulo.
 *
 * Existe para que as onze seções da home não divirjam em tamanho, peso e
 * espaçamento — divergência que ninguém percebe olhando uma seção por vez e
 * que fica evidente na rolagem contínua.
 */
type Props = {
  etiqueta?: string
  titulo: string
  /** Continuação do título, em prata mais apagada. Entra na mesma frase. */
  complemento?: string
  children?: ReactNode
  className?: string
  centralizado?: boolean
}

export function SectionHeading({
  etiqueta,
  titulo,
  complemento,
  children,
  className,
  centralizado = false,
}: Props) {
  return (
    <div className={cn(centralizado && 'mx-auto max-w-3xl text-center', className)}>
      {etiqueta && (
        <Reveal>
          <p className="label-mono mb-5 flex items-center gap-3">
            {!centralizado && <span aria-hidden className="h-px w-8 bg-gold-700" />}
            {etiqueta}
          </p>
        </Reveal>
      )}

      <h2 className="text-[clamp(2rem,5.4vw,3.9rem)]">
        <SplitHeading text={titulo} metal="prata" />
        {complemento ? (
          <>
            {' '}
            <SplitHeading text={complemento} metal="ouro" stagger={0.05} />
          </>
        ) : null}
      </h2>

      {children ? (
        <Reveal delay={0.12}>
          <div
            className={cn(
              'mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-plat-400',
              centralizado && 'mx-auto',
            )}
          >
            {children}
          </div>
        </Reveal>
      ) : null}
    </div>
  )
}
