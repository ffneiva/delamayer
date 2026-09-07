import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { SkeletonCena } from './Skeleton'

const BrandScene = lazy(() => import('./BrandScene'))

/**
 * A cena WebGL, montada só quando ela está de fato na tela.
 *
 * O site usa o monograma em 3D em dois lugares — o herói e o fecho —, e um
 * navegador tem um teto de contextos WebGL simultâneos (na prática, ~16 por
 * aba, e o mais antigo é derrubado quando estoura). Dois contextos vivos o
 * tempo todo não estouram nada, mas mantêm dois loops de render girando numa
 * página em que só um está visível.
 *
 * O `IntersectionObserver` resolve: a cena nasce quando entra no campo de visão
 * e é desmontada quando sai — o que também libera a GPU enquanto a pessoa lê o
 * meio da página.
 *
 * ── Por que ela roda no celular ─────────────────────────────────────────────
 *
 * A primeira versão exigia tela grande, e o resultado foi um site sem a peça
 * principal justamente onde chega a maior parte do tráfego. A objeção real
 * nunca foi a GPU — um monograma extrudado com environment map é barato —, e
 * sim três coisas específicas:
 *
 *  · **Peso.** Resolvido pelo `React.lazy` somado à espera pela visibilidade:
 *    o chunk do three.js só é buscado quando a cena vai aparecer, muito depois
 *    do primeiro paint.
 *  · **Bateria e fill rate.** Resolvidos pelo modo `compacto`, que corta
 *    resolução, antisserrilhado, partículas e o reflexo.
 *  · **Ausência de ponteiro.** Resolvida na própria cena: a deriva lenta e a
 *    rolagem dão movimento sem depender de mouse.
 */
type Props = {
  className?: string
  /** Tamanho relativo da peça na cena. 1 é o do herói no desktop. */
  escala?: number
  /** Quanto a rolagem gira a peça, em radianos por tela atravessada. */
  giroPorScroll?: number
}

/**
 * `true` quando o navegador consegue criar um contexto WebGL.
 *
 * A verificação existe porque a falha, sem ela, é péssima: o R3F lança dentro
 * do render e derruba a árvore inteira até o `<ErrorBoundary>` — trocando um
 * enfeite ausente por uma página de erro. Casos reais: navegador com aceleração
 * desligada, máquina virtual sem GPU, extensão de privacidade que bloqueia o
 * canvas.
 *
 * O resultado é memorizado num módulo: criar um canvas de teste por montagem
 * seria desperdício, e a resposta não muda durante a vida da aba.
 */
let suporte: boolean | null = null

function suportaWebGL(): boolean {
  if (suporte !== null) return suporte
  try {
    const canvas = document.createElement('canvas')
    suporte = Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    suporte = false
  }
  return suporte
}

export function Cena3D({ className, escala = 1, giroPorScroll = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const desktop = useIsDesktop()
  const reduzido = useReducedMotion()
  const [visivel, setVisivel] = useState(false)
  const [temWebGL, setTemWebGL] = useState(false)

  // A checagem toca no DOM, então só pode acontecer depois da montagem.
  useEffect(() => setTemWebGL(suportaWebGL()), [])

  const permitido = !reduzido && temWebGL

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
    /* Sem classe de posição aqui, e isso não é descuido: `relative` fixo na
       raiz vencia o `absolute` de quem chama — no Tailwind quem ganha é a ordem
       do CSS gerado, não a ordem no atributo, e `relative` vem depois de
       `absolute`. O efeito era a cena virar item do flex do herói e empurrar o
       texto para fora da tela. O <Canvas> do R3F já se posiciona sozinho. */
    <div ref={ref} aria-hidden className={cn(className)}>
      {permitido && visivel ? (
        <Suspense fallback={<SkeletonCena className="h-full w-full" />}>
          <BrandScene escala={escala} giroPorScroll={giroPorScroll} compacto={!desktop} />
        </Suspense>
      ) : (
        <SkeletonCena className="h-full w-full" />
      )}
    </div>
  )
}
