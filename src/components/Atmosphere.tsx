import { useReducedMotion } from '@/hooks/useMediaQuery'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * Duas camadas de ambiente que ficam por cima do site inteiro.
 *
 * Ambas são `pointer-events: none` e `aria-hidden`: existem só para o olho, e
 * não podem roubar um clique nem virar ruído no leitor de tela.
 */

/**
 * Grão de filme.
 *
 * O ruído é um SVG `feTurbulence` embutido como data URI, e não um PNG de
 * textura: são ~200 bytes contra ~40 kB, e o navegador o gera na resolução do
 * dispositivo, então nunca fica borrado numa tela retina.
 *
 * O deslocamento lento evita o padrão estático — grão parado lê como sujeira
 * na tela; grão que se move lê como filme.
 */
const RUIDO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function Grain() {
  const reduzido = useReducedMotion()

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[120] opacity-[0.045] mix-blend-overlay"
      style={{
        backgroundImage: RUIDO,
        // O deslocamento é de `background-position`, e NÃO da caixa.
        //
        // A versão anterior usava `inset: -8%` para poder transladar sem
        // revelar borda — e isso criava 126 px de rolagem lateral num celular
        // de 320 px. `overflow-x` no <body> não resolve: o bloco contendo de um
        // elemento `fixed` é a viewport, então o body não tem como clipá-lo.
        animation: reduzido ? undefined : 'grain-shift 7s steps(5) infinite',
      }}
    />
  )
}

/**
 * Barra de progresso da leitura, no topo.
 *
 * Escala em X a partir da esquerda, lendo uma variável CSS que o hook escreve
 * fora do ciclo de render do React (ver hooks/useScrollProgress). Um `scaleX`
 * roda no compositor; animar `width` forçaria layout a cada quadro de rolagem.
 */
export function ScrollProgress() {
  const ref = useScrollProgress<HTMLDivElement>()

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[2px] origin-left bg-linear-to-r from-gold-600 via-gold-200 to-gold-500"
      style={{ transform: 'scaleX(var(--progresso, 0))' }}
    />
  )
}

/**
 * Halo dourado fixo atrás do conteúdo.
 *
 * Dá profundidade ao preto absoluto sem introduzir uma imagem de fundo. Fica
 * atrás de tudo (`-z-10`) e não acompanha a rolagem: o efeito é o de uma luz
 * de estúdio na sala, não de um elemento da página.
 */
export function Halo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-[30%] left-1/2 h-[70vh] w-[110vw] -translate-x-1/2 opacity-60 blur-[120px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(176,124,36,0.16) 0%, rgba(176,124,36,0.05) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-[35%] left-[8%] h-[60vh] w-[70vw] opacity-40 blur-[130px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,168,85,0.12) 0%, transparent 68%)',
        }}
      />
    </div>
  )
}
