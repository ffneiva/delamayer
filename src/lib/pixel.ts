/**
 * Pixel da Meta (anúncios no Facebook e no Instagram).
 *
 * Mesmas duas regras do analytics.ts, pelos mesmos motivos:
 *
 * · **O ID entra por variável de ambiente** (`VITE_META_PIXEL_ID`), e não no
 *   código: este repositório é público, e um ID de pixel colado noutro site
 *   sujaria a medição de quem paga o anúncio. Sem a variável, nada é
 *   carregado e o site funciona inteiro.
 * · **O bootstrap mora no bundle**, e não num `<script>` inline no HTML como
 *   a documentação da Meta sugere. Assim `script-src` não precisa de
 *   `'unsafe-inline'`.
 *
 * Duas escolhas que valem o comentário:
 *
 * · **Carrega depois, no tempo ocioso** (ver main.tsx). O pixel não entra no
 *   caminho de renderização: a primeira tela não espera por ele.
 * · **Respeita "Não me rastreie"** do navegador. É raro estar ligado, e é
 *   coerente com um site que explica na política o que registra.
 *
 * O que vai para a Meta: páginas vistas e os dois eventos abaixo, com o IP e o
 * navegador que qualquer requisição carrega. Nome, telefone, e-mail e CPF não
 * vão: o casamento avançado de dados (Advanced Matching) está desligado.
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[][]
  push?: unknown
  loaded?: boolean
  version?: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

/** Eventos padrão da Meta que este site usa. */
export type EventoDoPixel = 'Contact' | 'Lead'

let carregado = false
/** A última página já contada, para a troca de rota não contar duas vezes. */
let ultimaPagina: string | null = null

function naoRastrear(): boolean {
  const n = navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string }
  return (
    n.doNotTrack === '1' ||
    n.msDoNotTrack === '1' ||
    (window as { doNotTrack?: string }).doNotTrack === '1'
  )
}

export function iniciarPixel(): void {
  if (!PIXEL_ID || carregado || typeof document === 'undefined' || naoRastrear()) return
  carregado = true

  // A fila é o que a Meta usa para não perder evento disparado antes de o
  // fbevents.js chegar: `fbq(...)` empilha, e a biblioteca consome ao carregar.
  const fbq: Fbq = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue?.push(args)
  }
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  window.fbq = fbq
  window._fbq ??= fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
  ultimaPagina = window.location.pathname
}

/** Conta uma página. Chamado na troca de rota (o site é uma SPA). */
export function pixelPagina(): void {
  if (!window.fbq || window.location.pathname === ultimaPagina) return
  ultimaPagina = window.location.pathname
  window.fbq('track', 'PageView')
}

export function pixelEvento(evento: EventoDoPixel, dados?: Record<string, unknown>): void {
  window.fbq?.('track', evento, dados)
}
