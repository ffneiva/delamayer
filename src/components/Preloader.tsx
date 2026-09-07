import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { Mark } from './Mark'

/**
 * A cortina de abertura.
 *
 * Ela existe por um motivo específico deste projeto: a cena WebGL do herói
 * leva alguns décimos para compilar os shaders, e sem cobertura a pessoa vê um
 * buraco preto no lugar do monograma. A cortina transforma essa espera em
 * apresentação da marca.
 *
 * Três garantias que o código precisa dar — nesta ordem de importância:
 *
 * 1. **Ela sai sempre.** O `setTimeout` é a única condição de saída. Se
 *    dependesse de "cena pronta" ou de `load`, um erro no WebGL deixaria o
 *    visitante preso numa tela preta para sempre. É preferível revelar um
 *    herói incompleto a não revelar nada.
 *
 * 2. **Ela não aparece para quem pediu movimento reduzido.** Nesse caso o
 *    componente devolve `null` e chama `onDone` imediatamente.
 *
 * 3. **DURACAO_MS bate com o CSS.** As animações vivem em index.css
 *    (`.preloader-*`), e os 2,3 s aqui são o mesmo total de lá. Se um mudar
 *    sem o outro, ou a cortina some antes da animação terminar, ou fica na
 *    tela depois dela.
 */
const DURACAO_MS = 2300

export function Preloader({ onDone }: { onDone: () => void }) {
  const reduzido = useReducedMotion()
  const [saiu, setSaiu] = useState(false)

  useEffect(() => {
    if (reduzido) {
      onDone()
      setSaiu(true)
      return
    }

    // Trava a rolagem enquanto a cortina está na tela: rolar por trás dela
    // deixa o visitante no meio da página quando ela sobe.
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const t = window.setTimeout(() => {
      onDone()
      setSaiu(true)
      document.body.style.overflow = anterior
    }, DURACAO_MS)

    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = anterior
    }
  }, [onDone, reduzido])

  if (reduzido || saiu) return null

  return (
    <div
      // `role="status"` + texto invisível: quem usa leitor de tela ouve
      // "carregando" em vez de silêncio de dois segundos.
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[500] flex items-center justify-center"
    >
      <span className="sr-only">Carregando o site da Delamayer</span>

      {/* Duas metades que se abrem como um cofre. O clip-path na metade de
          cima e de baixo é o que produz a fenda no meio da tela. */}
      <div aria-hidden className="preloader-top absolute inset-x-0 top-0 h-1/2 bg-obsidian" />
      <div aria-hidden className="preloader-bottom absolute inset-x-0 bottom-0 h-1/2 bg-obsidian" />

      <div aria-hidden className="preloader-mark relative z-10">
        <Mark className="h-24 w-24 md:h-32 md:w-32" />

        {/* A diagonal do símbolo, percorrendo o caminho de um corte. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="preloader-cut absolute top-0 left-1/2 h-full w-[3px] bg-linear-to-b from-transparent via-gold-100 to-transparent" />
        </div>
      </div>
    </div>
  )
}
