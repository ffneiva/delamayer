/**
 * O rastro de navegação.
 *
 * Registra por onde a pessoa passou — entrada, troca de rota, seções vistas,
 * cliques, profundidade de rolagem e saída — para o painel mostrar quem
 * realmente se interessou e quem só abriu e fechou. Quem decide ligar para
 * alguém precisa dessa diferença.
 *
 * ── Três decisões que evitam que isso piore o site ──────────────────────────
 *
 * · **Quase nada vai embora na hora.** Os eventos entram numa fila e sobem em
 *   lote, no máximo a cada seis segundos. Uma requisição por clique competiria
 *   por rede justamente enquanto a pessoa navega. A exceção é o toque no
 *   WhatsApp, que sai na hora — é o momento em que a pessoa deixa o site, e o
 *   painel transforma esse toque num atendimento.
 *
 * · **O último lote sai por `sendBeacon`.** É a única forma de o navegador
 *   enviar algo enquanto a aba fecha: `fetch` é cancelado no descarregamento.
 *   E é o lote mais valioso, porque diz até onde a pessoa foi antes de sair.
 *
 * · **Falhar é silencioso e barato.** Sem API, sem rede, com bloqueador: a
 *   fila é descartada e a página nem fica sabendo.
 *
 * A identificação é um número aleatório guardado no navegador. Não é nome, não
 * é login e não atravessa aparelhos — serve só para costurar os passos de uma
 * mesma visita. Quando o formulário é preenchido, o registro do lead passa a
 * apontar para esse mesmo número, e aí o painel consegue mostrar o caminho que
 * levou até o contato.
 */

import { CHAVE_VISITANTE } from './storage.ts'

type Evento = {
  tipo: 'entrada' | 'rota' | 'secao' | 'clique' | 'rolagem' | 'formulario' | 'saida' | 'whatsapp'
  detalhe?: string
  rota?: string
  valor?: string
  em: string
}

const INTERVALO = 6000
const LOTE_MAXIMO = 40

let visitante: string | null = null
let fila: Evento[] = []
let relogio: number | null = null
let contextoEnviado = false

/** O identificador da visita, criado na primeira vez e reaproveitado depois. */
export function idDoVisitante(): string | null {
  if (visitante) return visitante
  if (typeof window === 'undefined') return null

  try {
    const guardado = localStorage.getItem(CHAVE_VISITANTE)
    if (guardado) {
      visitante = guardado
      return visitante
    }
    // `randomUUID` não existe em contexto inseguro nem em navegador antigo;
    // o sorteio manual cobre esses casos sem derrubar o resto.
    const novo =
      typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '')
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
    localStorage.setItem(CHAVE_VISITANTE, novo)
    visitante = novo
    return visitante
  } catch {
    // Navegação anônima com armazenamento bloqueado: a visita simplesmente
    // não é costurada, e nada mais acontece.
    return null
  }
}

function contexto(): Record<string, string> {
  if (contextoEnviado) return {}
  contextoEnviado = true
  return {
    referrer: document.referrer.slice(0, 300),
    entrada: `${location.pathname}${location.search}`.slice(0, 200),
    tela: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`,
    idioma: navigator.language,
  }
}

function despachar(ultimo = false) {
  const id = idDoVisitante()
  if (!id || fila.length === 0) return

  const lote = fila.slice(0, LOTE_MAXIMO)
  fila = fila.slice(LOTE_MAXIMO)

  const corpo = JSON.stringify({ visitante: id, eventos: lote, ...contexto() })

  if (ultimo && typeof navigator.sendBeacon === 'function') {
    // `text/plain` é o que o sendBeacon manda sem disparar pré-voo; a API
    // aceita o corpo cru justamente por causa disto.
    navigator.sendBeacon('/api/rastro', new Blob([corpo], { type: 'text/plain' }))
    return
  }

  fetch('/api/rastro', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: corpo,
    keepalive: true,
  }).catch(() => {
    /* rastro é acessório: perder um lote não é um erro que valha contar */
  })
}

function agendar() {
  if (relogio !== null) return
  relogio = window.setTimeout(() => {
    relogio = null
    despachar()
  }, INTERVALO)
}

/** Enfileira um passo. Barato o bastante para chamar de qualquer lugar. */
export function anotar(tipo: Evento['tipo'], detalhe?: string, valor?: string) {
  if (typeof window === 'undefined') return
  fila.push({
    tipo,
    detalhe: detalhe?.slice(0, 160),
    valor: valor?.slice(0, 80),
    rota: location.pathname,
    em: new Date().toISOString(),
  })
  // Um lote grande demais significa alguém muito ativo: vale mandar já.
  if (fila.length >= LOTE_MAXIMO) despachar()
  else agendar()
}

/**
 * O texto de um botão como uma pessoa o leria.
 *
 * O `textContent` pega tudo, inclusive o que é só enfeite: a seta de "Tenho →"
 * e o número de "01 Limpa nome" chegavam ao painel como "Tenho→" e
 * "01Limpa nome", o que atrapalha exatamente quem precisa ler a trilha rápido.
 */
function textoLimpo(texto: string | null | undefined): string {
  return (texto ?? '')
    .replace(/[→←↓↑✦·]/g, ' ')
    .replace(/^\s*\d{1,2}(?=\D)/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}

/** Liga a coleta automática. Chamado uma vez, no arranque da aplicação. */
export function iniciarRastro() {
  if (typeof window === 'undefined' || !idDoVisitante()) return

  anotar('entrada', document.title)

  // ── Cliques ──────────────────────────────────────────────────────────────
  // Um ouvinte só, na captura, em vez de um por elemento. O rótulo é o que
  // identifica o alvo para quem vai ler no painel: `data-rastro` quando
  // existe, senão o texto do próprio controle.
  document.addEventListener(
    'click',
    (evento) => {
      const alvo = (evento.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-rastro], a, button',
      )
      if (!alvo) return

      const rotulo =
        alvo.dataset.rastro ||
        alvo.getAttribute('aria-label') ||
        textoLimpo(alvo.textContent) ||
        alvo.tagName.toLowerCase()

      const destino = alvo.getAttribute('href') ?? undefined
      anotar('clique', rotulo, destino)

      // O toque no WhatsApp é o evento mais valioso do site, e é também o
      // momento em que a pessoa sai dele: no celular o app abre por cima e a
      // aba é congelada logo em seguida. Esperar o lote de seis segundos é
      // arriscar perder justamente este clique, então ele sai na hora.
      if (destino?.includes('wa.me')) {
        anotar('whatsapp', rotulo)
        despachar(true)
      }
    },
    { capture: true, passive: true },
  )

  // ── Profundidade de rolagem ──────────────────────────────────────────────
  // Só os marcos, e cada um uma vez. Registrar a rolagem contínua encheria o
  // banco de ruído para dizer a mesma coisa.
  const marcos = [25, 50, 75, 100]
  const vistos = new Set<number>()
  window.addEventListener(
    'scroll',
    () => {
      const altura = document.documentElement.scrollHeight - window.innerHeight
      if (altura <= 0) return
      const porcento = Math.round((window.scrollY / altura) * 100)
      for (const marco of marcos) {
        if (porcento >= marco && !vistos.has(marco)) {
          vistos.add(marco)
          anotar('rolagem', `${marco}%`)
        }
      }
    },
    { passive: true },
  )

  // ── Seções vistas ────────────────────────────────────────────────────────
  // Meia seção na tela por vez é o que conta como "viu". O observador é
  // religado a cada troca de rota, porque as seções são outras.
  let observador: IntersectionObserver | null = null
  const observarSecoes = () => {
    observador?.disconnect()
    const jaVistas = new Set<string>()
    observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const id = entrada.target.id
          if (entrada.isIntersecting && id && !jaVistas.has(id)) {
            jaVistas.add(id)
            anotar('secao', id)
          }
        }
      },
      { threshold: 0.5 },
    )
    for (const secao of document.querySelectorAll('section[id]')) observador.observe(secao)
  }
  observarSecoes()

  // ── Troca de rota ────────────────────────────────────────────────────────
  // O roteador é a History API, que não avisa ninguém no `pushState`. O jeito
  // de saber é envolver o método — e o `setTimeout` dá ao React a chance de
  // pintar a tela nova antes de procurarmos as seções dela.
  const empurrar = history.pushState.bind(history)
  history.pushState = ((...args: Parameters<typeof history.pushState>) => {
    empurrar(...args)
    anotar('rota', location.pathname)
    setTimeout(observarSecoes, 120)
  }) as typeof history.pushState

  window.addEventListener('popstate', () => {
    anotar('rota', location.pathname)
    setTimeout(observarSecoes, 120)
  })

  // ── Saída ────────────────────────────────────────────────────────────────
  // `pagehide` cobre o que o `beforeunload` não cobre no celular, onde a aba
  // costuma ser congelada em vez de descarregada.
  const sair = () => {
    anotar('saida', `${Math.round(performance.now() / 1000)}s`)
    despachar(true)
  }
  window.addEventListener('pagehide', sair)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') despachar(true)
  })
}
