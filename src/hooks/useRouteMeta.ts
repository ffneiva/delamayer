import { useEffect } from 'react'
import { registrar } from '@/lib/analytics'
import { canonicalFor, type Route } from '@/lib/routes'

/**
 * Mantém `<head>` coerente durante a navegação no cliente.
 *
 * O HTML de cada rota já chega correto do servidor (ver perRouteHtmlPlugin em
 * vite.config.ts). Isto existe para o segundo caso: quem já está no site e
 * clica de uma página para outra sem recarregar. Sem isto, o título da aba e a
 * canonical continuariam sendo os da página anterior — e o histórico do
 * navegador ficaria cheio de entradas com o nome errado.
 */
export function useRouteMeta(route: Route) {
  useEffect(() => {
    document.title = route.title

    const set = (seletor: string, atributo: string, valor: string) => {
      const el = document.head.querySelector(seletor)
      if (el) el.setAttribute(atributo, valor)
    }

    set('meta[name="description"]', 'content', route.description)
    set('link[rel="canonical"]', 'href', canonicalFor(route))
    set('meta[property="og:title"]', 'content', route.title)
    set('meta[property="og:description"]', 'content', route.description)
    set('meta[property="og:url"]', 'content', canonicalFor(route))
    set(
      'meta[name="robots"]',
      'content',
      route.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    )

    registrar('rota_mudou', { rota: route.path })
  }, [route])
}
