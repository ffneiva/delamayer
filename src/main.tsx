import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import { iniciarAnalytics } from './lib/analytics'
import { iniciarObservabilidade, medirWebVitals } from './lib/observability'
import { iniciarPixel } from './lib/pixel'

// O JSON-LD não é montado aqui: um plugin do Vite (ver vite.config.ts) o gera a
// partir de src/lib/seo.ts e o grava direto no HTML durante o build, para que o
// dado estruturado chegue mesmo a crawlers que não executam JavaScript.

const raiz = document.getElementById('root')!
const app = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)

// No build, cada rota já chega com o conteúdo pré-renderizado (scripts/
// prerender.mjs): a hidratação reaproveita esse HTML em vez de redesenhar a
// página, o que manteria a cortina do preloader recomeçando no meio. No modo de
// desenvolvimento o `#root` vem vazio e a montagem é a de sempre.
if (raiz.hasChildNodes()) hydrateRoot(raiz, app)
else createRoot(raiz).render(app)

/**
 * Telemetria depois do primeiro render, e nunca antes.
 *
 * `requestIdleCallback` empurra a inicialização para o primeiro momento ocioso
 * do navegador — depois de o conteúdo ter pintado e a página estar
 * interativa. O `setTimeout` é o plano B para Safari, que só ganhou
 * `requestIdleCallback` recentemente.
 *
 * Sem as variáveis de ambiente correspondentes, as três chamadas abaixo não
 * baixam uma linha de código de terceiro (ver lib/analytics e
 * lib/observability).
 */
// O teste é `typeof …` e não `'requestIdleCallback' in window`: a lib do DOM já
// declara a propriedade, então o `in` estreita o ramo `else` para `never` e o
// TypeScript passa a recusar qualquer uso de `window` ali dentro.
const ociosa = (fn: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: 3000 })
  } else {
    window.setTimeout(fn, 1800)
  }
}

ociosa(() => {
  iniciarAnalytics()
  iniciarPixel()
  iniciarObservabilidade()
  medirWebVitals()
})
