import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { SkeletonCena } from './Skeleton'

const BrandScene = lazy(() => import('./BrandScene'))

/**
 * A cena WebGL: montada uma vez, PAUSADA quando sai da tela.
 *
 * O site usa o monograma em 3D em dois lugares — o herói e o fecho — e nenhum
 * dos dois pode ficar renderizando enquanto a pessoa lê o meio da página.
 *
 * ── O que não funcionou ─────────────────────────────────────────────────────
 *
 * A primeira versão desmontava a cena ao sair do campo de visão e a remontava
 * ao voltar. Economizava GPU, e custava caro em outro lugar: cada remontagem
 * cria um contexto WebGL novo, recozinha o cubemap do estúdio no
 * `PMREMGenerator` e reconstrói a geometria extrudada. Dava meio segundo de
 * buraco toda vez que se rolava de volta ao herói, e de novo ao chegar no
 * fecho — exatamente nos dois momentos em que a peça é o assunto.
 *
 * ── O que funciona ──────────────────────────────────────────────────────────
 *
 * Montar na primeira vez que a cena chega perto da tela e **nunca desmontar**.
 * O que é ligado e desligado é o laço de render: `frameloop="never"` faz o R3F
 * parar de desenhar por completo — zero trabalho de GPU, zero `useFrame` — sem
 * destruir nada. Voltar a `"always"` retoma no quadro seguinte, com o contexto,
 * o ambiente e a geometria ainda de pé.
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
  // Uma vez montada, fica. Ver o cabeçalho: remontar é o que causava o buraco.
  const [jaMontou, setJaMontou] = useState(false)
  const [temWebGL, setTemWebGL] = useState(false)

  // A checagem toca no DOM, então só pode acontecer depois da montagem.
  useEffect(() => setTemWebGL(suportaWebGL()), [])

  const permitido = !reduzido && temWebGL

  useEffect(() => {
    if (!permitido) return
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entrada]) => {
        setVisivel(entrada.isIntersecting)
        if (entrada.isIntersecting) setJaMontou(true)
      },
      // Uma tela inteira de antecedência. A montagem custa alguns quadros
      // (contexto, cubemap, extrusão) e é melhor gastá-los enquanto a cena
      // ainda está fora de vista do que na hora em que ela aparece.
      { rootMargin: '800px 0px' },
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
      {permitido && jaMontou ? (
        <Suspense fallback={<SkeletonCena className="h-full w-full" />}>
          <BrandScene
            escala={escala}
            giroPorScroll={giroPorScroll}
            compacto={!desktop}
            ativo={visivel}
          />
        </Suspense>
      ) : (
        <SkeletonCena className="h-full w-full" />
      )}
    </div>
  )
}
