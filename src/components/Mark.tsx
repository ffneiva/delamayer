import { MARK_SIZE, MARK_STROKE, markCenterline, OURO } from '@/lib/mark'

/**
 * O monograma como SVG inline.
 *
 * Inline, e não `<img src="/logo.svg">`, por três motivos que só aparecem em
 * uso: o degradê acompanha o tamanho real do elemento (um PNG dourado fica
 * serrilhado em tela retina), a cor pode ser trocada por CSS quando a marca
 * aparece sobre fundo claro, e não existe uma segunda requisição para o
 * primeiro elemento que a pessoa vê.
 *
 * O desenho é **um traço só**, com `fill: none` e `stroke` — que é como a marca
 * foi construída (ver src/lib/mark.ts). Desenhá-la como contorno preenchido
 * exigiria duplicar cada aresta, e o arquivo ficaria dez vezes maior sem
 * nenhum ganho.
 *
 * O `id` do degradê precisa ser único por instância: dois SVGs com o mesmo id
 * na página fazem o segundo herdar o gradiente do primeiro — e como o monograma
 * aparece no cabeçalho, no rodapé e no herói ao mesmo tempo, isso não é
 * hipótese.
 */
let contador = 0

const PARADAS = [0, 35, 62, 100]

type Props = {
  className?: string
  /** Quando true, pinta com `currentColor` em vez do degradê de ouro. */
  monocromatico?: boolean
  /**
   * Espessura do traço. O padrão é o valor medido no arquivo original; abaixo
   * de ~24 px de renderização ele some, e aí vale engrossar (ver o favicon em
   * scripts/make-brand.mjs).
   */
  traco?: number
  title?: string
}

export function Mark({ className, monocromatico = false, traco = MARK_STROKE, title }: Props) {
  const id = `ouro-${(contador++).toString(36)}`

  return (
    <svg
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {!monocromatico && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {OURO.map((cor, i) => (
              <stop key={cor} offset={`${PARADAS[i]}%`} stopColor={cor} />
            ))}
          </linearGradient>
        </defs>
      )}
      <path
        d={markCenterline()}
        fill="none"
        stroke={monocromatico ? 'currentColor' : `url(#${id})`}
        strokeWidth={traco}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        // A ponta da diagonal é um ângulo agudo; sem folga no limite de
        // esquadria o navegador a corta em chanfro e o gesto de corte some.
        strokeMiterlimit={10}
      />
    </svg>
  )
}
