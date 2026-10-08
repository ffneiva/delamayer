/** Junta classes ignorando falsy — versão mínima do clsx, sem dependência. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Limita um número a um intervalo. */
export function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor))
}
