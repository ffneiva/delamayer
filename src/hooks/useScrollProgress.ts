import { useEffect, useRef } from 'react'

/**
 * Progresso da rolagem da página, escrito direto no DOM.
 *
 * Deliberadamente NÃO usa estado do React. O scroll dispara dezenas de vezes
 * por segundo; um `setState` a cada evento re-renderizaria a árvore inteira
 * para mudar a largura de uma barra de 2 px. Aqui o valor vai para uma
 * variável CSS num `requestAnimationFrame`, e o navegador resolve o resto no
 * compositor.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0

    const medir = () => {
      frame = 0
      const rolavel = document.documentElement.scrollHeight - window.innerHeight
      // Página que cabe na tela: barra zerada, e não NaN vindo de 0/0.
      const p = rolavel > 0 ? Math.min(1, Math.max(0, window.scrollY / rolavel)) : 0
      el.style.setProperty('--progresso', String(p))
    }

    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(medir)
    }

    medir()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  return ref
}
