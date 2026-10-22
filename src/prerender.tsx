import { renderToString } from 'react-dom/server'
import App from './App'

export { NAO_ENCONTRADA, ROUTES } from './lib/routes'

/**
 * Renderiza a aplicação inteira para a rota atual de `window.location`.
 *
 * Só o build usa isto (scripts/prerender.mjs). O resultado vai dentro do
 * `#root` de cada HTML estático, para robôs que não executam JavaScript lerem
 * o conteúdo real. No navegador, main.tsx hidrata esse mesmo markup.
 */
export function renderizar(): string {
  return renderToString(<App />)
}
