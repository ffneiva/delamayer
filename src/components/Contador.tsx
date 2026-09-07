import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

/**
 * Um número que conta até o valor quando entra na tela.
 *
 * A seção de evidências existe para a pessoa se reconhecer no problema — "83,7
 * milhões de brasileiros" só funciona se o número for **notado**. Parado, ele é
 * mais um dado numa página cheia deles; contando, o olho para nele.
 *
 * ── O que o componente NÃO faz ──────────────────────────────────────────────
 *
 * Não recebe um número. Recebe o texto exato que a fonte publicou — "83,7 mi",
 * "50,9%", "18 meses" — e descobre sozinho o que ali é numérico. O motivo é a
 * regra de conteúdo do projeto: os valores vivem em `EVIDENCIAS`, em
 * business.ts, do jeito que a Serasa os divulgou. Transformá-los em
 * `{ valor: 83.7, sufixo: ' mi' }` para caber num componente seria deixar a
 * apresentação ditar como o dado é guardado — e a primeira vez que alguém
 * atualizasse a estatística, ela viraria dois campos para errar em vez de um
 * para copiar.
 *
 * Se o texto não começar com número, ele é exibido como veio. Nenhum dado se
 * perde por causa de um efeito.
 */

/** Separa "83,7 mi" em { numero: 83.7, casas: 1, sufixo: " mi" }. */
function separar(texto: string) {
  const achado = texto.match(/^(\d+(?:\.\d{3})*(?:,\d+)?)(.*)$/)
  if (!achado) return null

  const [, parteNumerica, sufixo] = achado
  // Formato brasileiro: ponto separa milhar, vírgula separa decimal.
  const numero = Number(parteNumerica.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(numero)) return null

  const casas = parteNumerica.includes(',') ? parteNumerica.split(',')[1].length : 0
  return { numero, casas, sufixo }
}

/** Sai rápido e chega devagar — a contagem "assenta" em vez de parar de repente. */
const DURACAO_MS = 1500

export function Contador({ texto, className }: { texto: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduzido = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const partes = separar(texto)
    if (!partes || reduzido || !('IntersectionObserver' in window)) return

    const formatador = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: partes.casas,
      maximumFractionDigits: partes.casas,
    })

    let frame = 0
    let inicio = 0
    // `true` quando a contagem pode começar. Vira `false` ao disparar e volta a
    // `true` quando o número sai da tela — é o que permite ver a animação de
    // novo ao voltar para a seção, em vez de encontrar o número já parado.
    let armado = true

    const passo = (agora: number) => {
      if (!inicio) inicio = agora
      const t = Math.min(1, (agora - inicio) / DURACAO_MS)
      // easeOutExpo: quase todo o percurso acontece no primeiro terço, o que
      // dá a impressão de um contador mecânico desacelerando.
      const suave = t === 1 ? 1 : 1 - 2 ** (-10 * t)
      el.textContent = formatador.format(partes.numero * suave) + partes.sufixo
      if (t < 1) frame = requestAnimationFrame(passo)
    }

    const io = new IntersectionObserver(
      (entradas) => {
        const dentro = entradas.some((e) => e.isIntersecting)

        if (dentro && armado) {
          armado = false
          inicio = 0
          if (frame) cancelAnimationFrame(frame)
          frame = requestAnimationFrame(passo)
          return
        }

        // Rearma só quando o número sai INTEIRO da tela. Rearmar a cada
        // pequena saída faria a contagem reiniciar a cada tremida de rolagem.
        if (!dentro) {
          armado = true
          if (frame) cancelAnimationFrame(frame)
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )

    io.observe(el)

    return () => {
      io.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [texto, reduzido])

  /**
   * O conteúdo inicial é o valor FINAL, e não zero.
   *
   * Se a animação não rodar — sem `IntersectionObserver`, com movimento
   * reduzido, com JavaScript quebrado no meio —, o que fica na tela é o número
   * certo. Começar em zero transformaria uma falha de enfeite numa estatística
   * errada, que num site sobre crédito é bem pior do que não ter animação.
   */
  return (
    <span ref={ref} data-numero className={cn(className)}>
      {texto}
    </span>
  )
}
