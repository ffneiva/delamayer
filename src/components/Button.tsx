import type { ReactNode } from 'react'
import { registrarConversaoWhatsApp } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * O botão do site, em três pesos — sempre como link.
 *
 * `ouro` é o CTA principal e aparece uma vez por tela — se houver dois, nenhum
 * é principal. `contorno` é a ação secundária. `texto` é para links que
 * precisam de área de toque, não de peso visual.
 *
 * O brilho que atravessa o botão no hover é um pseudo-elemento animado por
 * `transform`, e não um `background-position`: fica no compositor e não força
 * o navegador a repintar a caixa a cada quadro.
 */
type Variante = 'ouro' | 'contorno' | 'texto'

type Base = {
  children: ReactNode
  variante?: Variante
  className?: string
  /** Marca o cursor personalizado com um rótulo (ver components/Cursor). */
  rotuloCursor?: string
}

const ESTILOS: Record<Variante, string> = {
  ouro: 'group relative overflow-hidden bg-linear-to-b from-gold-200 to-gold-500 text-obsidian font-semibold shadow-[0_10px_40px_-12px_rgba(212,168,85,0.55)] hover:shadow-[0_14px_50px_-10px_rgba(212,168,85,0.75)]',
  contorno:
    'border border-edge bg-white/[0.02] text-plat-100 hover:border-gold-700 hover:bg-gold-900/20',
  texto: 'text-plat-300 hover:text-gold-200',
}

const COMUM =
  'inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm tracking-wide transition-[color,background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-vault)] active:scale-[0.98] motion-reduce:transition-none'

function Conteudo({ children, variante }: { children: ReactNode; variante: Variante }) {
  return (
    <>
      {variante === 'ouro' && (
        // Faixa de luz que cruza da esquerda para a direita no hover.
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/55 to-transparent transition-transform duration-[900ms] ease-[var(--ease-vault)] group-hover:translate-x-full motion-reduce:hidden"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
    </>
  )
}

type LinkProps = Base & { href: string; externo?: boolean; onClick?: () => void }

export function ButtonLink({
  children,
  href,
  variante = 'ouro',
  className,
  externo,
  onClick,
  rotuloCursor,
}: LinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      data-cursor={rotuloCursor}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(COMUM, ESTILOS[variante], className)}
    >
      <Conteudo variante={variante}>{children}</Conteudo>
    </a>
  )
}

/**
 * Atalho para o CTA que importa.
 *
 * Ele existe para garantir que **todo** caminho até o WhatsApp registre a
 * conversão. Espalhar `<a href="wa.me/...">` pelo site funcionaria igual para
 * o visitante e deixaria a campanha cega em metade dos cliques.
 */
export function BotaoWhatsApp({
  children,
  href,
  origem,
  variante = 'ouro',
  className,
}: {
  children: ReactNode
  href: string
  /** De onde o clique saiu — vira dimensão do evento. */
  origem: string
  variante?: Variante
  className?: string
}) {
  return (
    <ButtonLink
      href={href}
      externo
      variante={variante}
      className={className}
      rotuloCursor="Falar"
      onClick={() => registrarConversaoWhatsApp(origem)}
    >
      {children}
    </ButtonLink>
  )
}
