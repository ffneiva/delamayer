import { useEffect, useRef, useState } from 'react'
import { BUSINESS } from '@/lib/business'
import { cn } from '@/lib/utils'

/**
 * O mapa, desenhado aqui — sem iframe, sem API key, sem cookie.
 *
 * A versão anterior era o `<iframe>` do Google atrás de um clique. Funcionava,
 * mas tinha dois problemas que se resolvem juntos: o mapa só aparecia depois de
 * a pessoa pedir (e quase ninguém pede), e o alfinete vermelho do Google não se
 * estiliza de jeito nenhum.
 *
 * Um mapa de tiles é, no fundo, uma grade de `<img>` posicionada. Sabendo a
 * projeção — Web Mercator, a mesma que todo mundo usa — dá para calcular qual
 * imagem vai em qual lugar em ~30 linhas. O que se ganha:
 *
 * · **Carrega de imediato**, sem clique e sem 900 kB de JavaScript do Google.
 * · **O alfinete é nosso** — ouro, com o mesmo anel pulsante do resto do site.
 * · **Nenhum cookie de terceiro.** São requisições de imagem, e só.
 * · A paleta acompanha a marca, via filtro CSS, em vez de exigir um estilo
 *   customizado do Maps (que precisa de chave e de conta de faturamento).
 *
 * O tráfego é de uma página institucional pequena, dentro do que a política de
 * uso do OpenStreetMap permite. A atribuição é obrigatória e está no rodapé do
 * componente.
 */

const TILE = 256
const ZOOM = 16

/**
 * Web Mercator: converte grau para coordenada de tile (fracionária).
 *
 * A parte inteira diz qual imagem baixar; a fracionária, onde ela cai dentro do
 * quadro. É a fracionária que faz o endereço ficar exatamente no centro em vez
 * de "no tile certo, mais ou menos".
 */
function paraTile(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom
  const rad = (lat * Math.PI) / 180
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  }
}

/**
 * Os tiles do OSM são claros. Este filtro os traz para a paleta do site:
 * inverte (fundo escuro, ruas claras), tira a cor original, reaquece em direção
 * ao ouro e baixa o brilho para o mapa não competir com o conteúdo.
 */
const FILTRO =
  'grayscale(1) invert(0.93) sepia(0.62) saturate(1.5) hue-rotate(-6deg) brightness(0.66) contrast(1.08)'

export function Mapa({ className }: { className?: string }) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 })
  const [carregados, setCarregados] = useState(0)

  // A grade depende do tamanho em pixels, que só existe depois da montagem — e
  // muda no resize e na troca de orientação do celular.
  useEffect(() => {
    const el = caixaRef.current
    if (!el) return

    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setTamanho({ largura: Math.ceil(width), altura: Math.ceil(height) })
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  const { largura, altura } = tamanho
  const centro = paraTile(BUSINESS.geo.lat, BUSINESS.geo.lng, ZOOM)

  // Canto superior esquerdo do quadro, em pixels do mundo.
  const origemX = centro.x * TILE - largura / 2
  const origemY = centro.y * TILE - altura / 2

  const primeiroX = Math.floor(origemX / TILE)
  const primeiroY = Math.floor(origemY / TILE)
  const ultimoX = Math.floor((origemX + largura) / TILE)
  const ultimoY = Math.floor((origemY + altura) / TILE)

  const tiles: Array<{ chave: string; x: number; y: number; esq: number; topo: number }> = []
  if (largura > 0 && altura > 0) {
    const limite = 2 ** ZOOM
    for (let tx = primeiroX; tx <= ultimoX; tx++) {
      for (let ty = primeiroY; ty <= ultimoY; ty++) {
        // Fora dos polos não existe tile; pular evita um 404 por quadro.
        if (ty < 0 || ty >= limite) continue
        const envolto = ((tx % limite) + limite) % limite
        tiles.push({
          chave: `${tx}-${ty}`,
          x: envolto,
          y: ty,
          esq: tx * TILE - origemX,
          topo: ty * TILE - origemY,
        })
      }
    }
  }

  const pronto = tiles.length > 0 && carregados >= Math.min(tiles.length, 4)

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-edge', className)}>
      <div ref={caixaRef} className="absolute inset-0 bg-vault">
        {/* Grade de fundo enquanto os tiles não chegam. Ela tem a mesma
            densidade visual do mapa filtrado, então a troca não pisca. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.13] transition-opacity duration-700"
          style={{
            backgroundImage:
              'linear-gradient(#d4a855 1px, transparent 1px), linear-gradient(90deg, #d4a855 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            opacity: pronto ? 0 : 0.13,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-vault)]"
          style={{ filter: FILTRO, opacity: pronto ? 1 : 0 }}
        >
          {tiles.map((t) => (
            <img
              key={t.chave}
              src={`https://tile.openstreetmap.org/${ZOOM}/${t.x}/${t.y}.png`}
              alt=""
              width={TILE}
              height={TILE}
              loading="lazy"
              decoding="async"
              onLoad={() => setCarregados((n) => n + 1)}
              // `onError` conta igual: um tile que não veio não pode segurar a
              // revelação do mapa inteiro para sempre.
              onError={() => setCarregados((n) => n + 1)}
              className="absolute max-w-none select-none"
              style={{ left: t.esq, top: t.topo, width: TILE, height: TILE }}
            />
          ))}
        </div>

        {/* Vinheta: escurece as bordas para o mapa se dissolver no fundo do
            site em vez de terminar num retângulo duro. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(5,5,6,0.55) 100%)',
          }}
        />
      </div>

      {/* ── O alfinete ─────────────────────────────────────────────────────
          Fica no centro geométrico porque é assim que a grade foi calculada.
          A ponta do alfinete é que precisa cair no ponto, então ele é
          deslocado para cima pela própria altura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        style={{ opacity: pronto ? 1 : 0, transition: 'opacity 600ms var(--ease-vault) 300ms' }}
      >
        <svg width="34" height="46" viewBox="0 0 34 46" fill="none">
          <title>Localização da Delamayer</title>
          <defs>
            <linearGradient id="pino-ouro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F3DFAE" />
              <stop offset="45%" stopColor="#D9AE5B" />
              <stop offset="100%" stopColor="#B07C24" />
            </linearGradient>
          </defs>
          {/* Gota clássica: círculo em cima, ponta embaixo. */}
          <path
            d="M17 1C8.7 1 2 7.7 2 16c0 10.5 13.2 26.6 14.2 28 .4.5 1.2.5 1.6 0C18.8 42.6 32 26.5 32 16 32 7.7 25.3 1 17 1z"
            fill="url(#pino-ouro)"
            stroke="#5d3f13"
            strokeWidth="1.2"
          />
          <circle cx="17" cy="16" r="5.4" fill="#050506" />
        </svg>
      </div>

      {/* Anel pulsante no ponto exato, sob o alfinete. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/40 motion-reduce:hidden"
        style={{ animation: pronto ? 'pulse-ring 2.8s ease-out infinite' : undefined }}
      />

      {/* Atribuição — exigida pela licença dos dados do OpenStreetMap. */}
      <p className="absolute right-2 bottom-2 rounded bg-obsidian/70 px-2 py-1 text-[0.6rem] text-plat-500 backdrop-blur-sm">
        ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline decoration-plat-700 underline-offset-2 transition-colors hover:text-plat-300"
        >
          OpenStreetMap
        </a>
      </p>

      {/* A área clicável inteira leva à rota no Google Maps, que é o que a
          pessoa quer fazer com um mapa num site de empresa.

          O rótulo vai como texto DENTRO da âncora, e não como `aria-label` numa
          âncora vazia. Os dois expõem o mesmo nome acessível, mas um link sem
          conteúdo depende inteiramente do atributo: se ele for removido num
          refactor, sobra um link anônimo que o leitor de tela anuncia como
          "link" e nada mais. Com texto dentro, some o rótulo e some o link
          junto — a falha fica visível. */}
      <a
        href={BUSINESS.mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Traçar rota"
        className="absolute inset-0"
      >
        <span className="sr-only">Abrir rota até {BUSINESS.address.venue} no Google Maps</span>
      </a>
    </div>
  )
}
