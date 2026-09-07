import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { SkeletonCena } from './Skeleton'

const BrandScene = lazy(() => import('./BrandScene'))

/**
 * A cena WebGL, montada só quando ela está de fato na tela.
 *
 * O site usa o monograma em 3D em dois lugares — o herói e o fecho —, e um
 * navegador tem um teto baixo de contextos WebGL simultâneos (na prática, ~16
 * por aba, e o mais antigo é derrubado quando estoura). Dois contextos vivos o
 * tempo todo não estouram nada, mas mantêm dois loops de render girando numa
 * página em que só um está visível.
 *
 * O `IntersectionObserver` resolve isso: a cena nasce quando entra no campo de
 * visão e é desmontada quando sai — o que também libera a GPU enquanto a pessoa
 * lê o meio da página.
 *
 * As três portas de entrada, na ordem em que são checadas:
 *
 *  1. **Tela grande.** Um objeto que segue o ponteiro não tem o que seguir num
 *     aparelho sem ponteiro, e o chunk do three.js passa de 700 kB.
 *  2. **Sem movimento reduzido.**
 *  3. **Visível.** Só então o `React.lazy` dispara o import.
 */
type Props = {
  className?: string
  /** Tamanho relativo da peça na cena. 1 é o do herói. */
  escala?: number
  /** Quanto a rolagem gira a peça, em radianos por tela rolada. */
  giroPorScroll?: number
}

export function Cena3D({ className, escala = 1, giroPorScroll = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const desktop = useIsDesktop()
  const reduzido = useReducedMotion()
  const [visivel, setVisivel] = useState(false)

  const permitido = desktop && !reduzido

  useEffect(() => {
    if (!permitido) return
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entrada]) => setVisivel(entrada.isIntersecting),
      // Margem generosa: a cena começa a carregar antes de aparecer, para o
      // primeiro quadro já estar pronto quando ela entra de verdade.
      { rootMargin: '250px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [permitido])

  return (
    <div ref={ref} aria-hidden className={cn('relative', className)}>
      {permitido && visivel ? (
        <Suspense fallback={<SkeletonCena className="h-full w-full" />}>
          <BrandScene escala={escala} giroPorScroll={giroPorScroll} />
        </Suspense>
      ) : (
        <SkeletonCena className="h-full w-full" />
      )}
    </div>
  )
}
