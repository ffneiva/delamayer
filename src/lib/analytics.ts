/**
 * Google Analytics / Google Ads — carregado só se houver ID configurado.
 *
 * O ID entra por variável de ambiente (`VITE_GTAG_ID`) e não fica no código:
 * este repositório é público, e um ID de medição no fonte é o tipo de coisa
 * que outra pessoa cola no próprio site sem querer, poluindo o relatório de
 * quem paga o anúncio.
 *
 * Sem a variável definida, nada é carregado — o site funciona inteiro,
 * simplesmente sem medição. É o comportamento certo para desenvolvimento e
 * para qualquer pré-visualização de PR.
 */

const GTAG_ID = import.meta.env.VITE_GTAG_ID as string | undefined

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

let carregado = false

/**
 * Injeta o gtag.js.
 *
 * O bootstrap mora aqui, no bundle da aplicação, e não num `<script>` inline
 * colado no HTML como a documentação do Google sugere. A diferença aparece na
 * CSP: com o código no bundle, `script-src` não precisa de `'unsafe-inline'` —
 * e abrir `unsafe-inline` num site que abre WhatsApp com texto montado a partir
 * de entrada do usuário é exatamente o que não se deve fazer.
 */
export function iniciarAnalytics(): void {
  if (!GTAG_ID || carregado || typeof document === 'undefined') return
  carregado = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  const gtag: Gtag = (...args) => {
    window.dataLayer?.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GTAG_ID, {
    // O consentimento é implícito para medição própria, mas anonimizar o IP é
    // o mínimo que se faz num site que fala sobre a dívida de quem o acessa.
    anonymize_ip: true,
  })
}

/**
 * Eventos que valem alguma coisa.
 *
 * A lista é curta de propósito. Medir tudo produz um relatório onde nada se
 * destaca; aqui só entra ação que indica intenção real de contratar.
 */
export type Evento =
  | 'whatsapp_clique'
  | 'diagnostico_iniciado'
  | 'diagnostico_concluido'
  | 'instagram_clique'
  | 'rota_mudou'

export function registrar(evento: Evento, dados?: Record<string, unknown>): void {
  window.gtag?.('event', evento, dados)
}

/**
 * O clique no WhatsApp é a conversão do site.
 *
 * Não é "visualização de página": quem clica no anúncio sempre visita, e uma
 * conversão que dispara em 100% dos cliques não ensina nada ao algoritmo da
 * campanha. O que separa um visitante de um cliente é abrir a conversa.
 */
export function registrarConversaoWhatsApp(origem: string): void {
  registrar('whatsapp_clique', { origem })
}
