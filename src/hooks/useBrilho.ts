import { type PointerEvent as PointerEventReact, useCallback } from 'react'
import { useFinePointer } from './useMediaQuery'

/**
 * Um brilho que segue o cursor dentro do elemento.
 *
 * O efeito é conhecido — cartão que acende sob o ponteiro —, e o que muda entre
 * uma implementação boa e uma ruim é onde a posição é guardada. Aqui ela vai
 * para duas variáveis CSS escritas direto no nó (`--bx` e `--by`); o desenho
 * fica por conta de um `::after` em `@utility brilho` (ver index.css).
 *
 * Duas consequências disso:
 *
 * · **Zero re-render.** Guardar a posição em estado do React re-renderizaria o
 *   cartão a cada movimento do mouse — dezenas de vezes por segundo, com
 *   reconciliação inteira — para mudar duas coordenadas que só o CSS lê.
 * · **Um listener por cartão, delegado.** Os manipuladores voltam como props do
 *   React, que usa delegação de eventos: por trás existe um único listener na
 *   raiz, e não um por elemento.
 *
 * Em toque não há "passar por cima", então nada é registrado — o cartão
 * simplesmente não tem o efeito, o que é o comportamento certo e não uma
 * degradação.
 */
export function useBrilho() {
  const fino = useFinePointer()

  const aoMover = useCallback((evento: PointerEventReact<HTMLElement>) => {
    const el = evento.currentTarget
    const caixa = el.getBoundingClientRect()
    el.style.setProperty('--bx', `${evento.clientX - caixa.left}px`)
    el.style.setProperty('--by', `${evento.clientY - caixa.top}px`)
    el.style.setProperty('--bo', '1')
  }, [])

  const aoSair = useCallback((evento: PointerEventReact<HTMLElement>) => {
    evento.currentTarget.style.setProperty('--bo', '0')
  }, [])

  if (!fino) return {}

  return { onPointerMove: aoMover, onPointerLeave: aoSair }
}
