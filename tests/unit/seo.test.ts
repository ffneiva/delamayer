import { describe, expect, it } from 'vitest'
import { BUSINESS, FAQ, MIDIA, SERVICES } from '@/lib/business'
import { canonicalFor, NAO_ENCONTRADA, ogArquivoDe, ogUrlDe, ROUTES } from '@/lib/routes'
import { buildJsonLd, buildLlmsTxt } from '@/lib/seo'

/**
 * Dados estruturados e metadados.
 *
 * O erro que estes testes impedem é sempre o mesmo e sempre silencioso: o
 * JSON-LD diverge da página. Ninguém percebe, porque o dado estruturado é
 * invisível — até o Search Console reclamar semanas depois, ou pior, até a
 * página perder a elegibilidade a resultado rico sem aviso nenhum.
 */

type No = Record<string, unknown> & { '@type': string; '@id'?: string }

function grafo(caminho: string): No[] {
  return buildJsonLd(caminho)['@graph'] as No[]
}

function tipos(caminho: string): string[] {
  return grafo(caminho).map((no) => no['@type'])
}

describe('estrutura do @graph', () => {
  it('toda rota emite o negócio e o site', () => {
    for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
      expect(tipos(rota.path), rota.path).toContain('FinancialService')
      expect(tipos(rota.path), rota.path).toContain('WebSite')
    }
  })

  it('é serializável e não tem referência circular', () => {
    for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
      expect(() => JSON.stringify(buildJsonLd(rota.path))).not.toThrow()
    }
  })

  it('todo @id é único dentro do grafo da rota', () => {
    for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
      const ids = grafo(rota.path)
        .map((no) => no['@id'])
        .filter(Boolean)
      expect(new Set(ids).size, rota.path).toBe(ids.length)
    }
  })
})

describe('FAQPage só onde as perguntas aparecem', () => {
  it('a home declara o FAQ completo, que é o que ela renderiza', () => {
    const faq = grafo('/').find((no) => no['@type'] === 'FAQPage')
    expect(faq).toBeDefined()
    expect((faq!.mainEntity as unknown[]).length).toBe(FAQ.length)
  })

  it('/rating declara apenas as perguntas de tema "rating"', () => {
    const faq = grafo('/rating').find((no) => no['@type'] === 'FAQPage')
    const esperadas = FAQ.filter((f) => f.tema === 'rating')

    expect(faq).toBeDefined()
    expect(esperadas.length).toBeGreaterThan(0)
    expect((faq!.mainEntity as unknown[]).length).toBe(esperadas.length)
  })

  it('/imovel declara apenas as perguntas de tema "imovel"', () => {
    const faq = grafo('/imovel').find((no) => no['@type'] === 'FAQPage')
    const esperadas = FAQ.filter((f) => f.tema === 'imovel')

    expect(faq).toBeDefined()
    expect(esperadas.length).toBeGreaterThan(0)
    expect((faq!.mainEntity as unknown[]).length).toBe(esperadas.length)
  })

  it('rotas sem FAQ na tela não declaram FAQPage', () => {
    for (const caminho of ['/diagnostico', '/politica-de-privacidade', '/404']) {
      expect(tipos(caminho), caminho).not.toContain('FAQPage')
    }
  })
})

describe('a matéria em vídeo', () => {
  /**
   * `VideoObject` é o nó mais fácil de emitir errado: sem `uploadDate`,
   * `duration` e `thumbnailUrl` o Google descarta o bloco inteiro em silêncio —
   * não avisa, não valida, simplesmente ignora. O teste garante que os três
   * continuem lá depois de qualquer mexida no business.ts.
   */
  it('declara os campos sem os quais o Google descarta o nó', () => {
    const video = grafo('/').find((no) => no['@type'] === 'VideoObject')

    expect(video).toBeDefined()
    expect(video!.uploadDate).toBeTruthy()
    expect(video!.duration).toMatch(/^PT\d+M\d+S$/)
    expect((video!.thumbnailUrl as string[])[0]).toMatch(/^https:\/\//)
    expect(video!.name).toBe(MIDIA.tituloOriginal)
  })

  it('a data de publicação é uma data ISO válida', () => {
    expect(MIDIA.publicadoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(MIDIA.publicadoEm))).toBe(false)
  })

  /**
   * O <Midia> é renderizado na home e em /rating, e em lugar nenhum mais.
   * Declarar um vídeo numa página que não o mostra é a mesma violação de sempre.
   */
  it('só aparece nas rotas que mostram o player', () => {
    expect(tipos('/')).toContain('VideoObject')
    expect(tipos('/rating')).toContain('VideoObject')

    for (const caminho of ['/diagnostico', '/imovel', '/politica-de-privacidade', '/404']) {
      expect(tipos(caminho), caminho).not.toContain('VideoObject')
    }
  })
})

describe('imagem de compartilhamento', () => {
  it('cada rota com texto próprio tem a própria arte', () => {
    const comTexto = ROUTES.filter((r) => r.ogLinhas)
    const arquivos = comTexto.map(ogArquivoDe)

    expect(arquivos.length).toBeGreaterThan(1)
    expect(new Set(arquivos).size).toBe(arquivos.length)
  })

  it('a home fica em og.png, e as demais em og-<rota>.png', () => {
    expect(ogArquivoDe(ROUTES[0])).toBe('og.png')
    for (const rota of ROUTES.filter((r) => r.path !== '/' && r.ogLinhas)) {
      expect(ogArquivoDe(rota)).toBe(`og${rota.path}.png`.replace('/', '-'))
    }
  })

  it('rota sem texto próprio cai na arte da home', () => {
    const semTexto = ROUTES.filter((r) => !r.ogLinhas)
    for (const rota of semTexto) {
      expect(ogArquivoDe(rota)).toBe('og.png')
    }
  })

  it('a URL é absoluta e no domínio do site', () => {
    for (const rota of ROUTES) {
      expect(ogUrlDe(rota)).toMatch(new RegExp(`^${BUSINESS.url.replace('.', '\\.')}/og`))
    }
  })

  /**
   * A arte tem 1200×630 e o texto grande ocupa a metade direita. Duas linhas
   * longas demais transbordam a peça — e como o SVG não quebra linha sozinho, o
   * excesso simplesmente sai do quadro sem erro nenhum.
   */
  it('as linhas cabem na arte', () => {
    for (const rota of ROUTES) {
      for (const linha of rota.ogLinhas ?? []) {
        expect(linha.length, `${rota.path}: "${linha}"`).toBeLessThanOrEqual(28)
      }
      if (rota.ogNota) {
        expect(rota.ogNota.length, rota.path).toBeLessThanOrEqual(56)
      }
    }
  })
})

describe('trilha de navegação', () => {
  it('existe em toda rota filha e em nenhuma na home', () => {
    expect(tipos('/')).not.toContain('BreadcrumbList')

    for (const rota of ROUTES.filter((r) => r.path !== '/')) {
      expect(tipos(rota.path), rota.path).toContain('BreadcrumbList')
    }
  })

  it('aponta para a URL canônica da própria rota', () => {
    for (const rota of ROUTES.filter((r) => r.path !== '/')) {
      const trilha = grafo(rota.path).find((no) => no['@type'] === 'BreadcrumbList')
      const itens = trilha?.itemListElement as { item: string }[]

      expect(itens[0].item).toBe(`${BUSINESS.url}/`)
      expect(itens[1].item).toBe(canonicalFor(rota))
    }
  })
})

describe('o nó do negócio', () => {
  const negocio = grafo('/').find((no) => no['@type'] === 'FinancialService')!

  it('carrega endereço, geo e telefone coerentes com business.ts', () => {
    expect((negocio.address as Record<string, string>).postalCode).toBe(BUSINESS.address.zip)
    expect((negocio.geo as Record<string, number>).latitude).toBe(BUSINESS.geo.lat)
    expect(negocio.telephone).toBe(`+55${BUSINESS.whatsapp.slice(2)}`)
  })

  it('lista todos os serviços no catálogo de ofertas', () => {
    const catalogo = negocio.hasOfferCatalog as { itemListElement: unknown[] }
    expect(catalogo.itemListElement).toHaveLength(SERVICES.length)
  })

  /**
   * O catálogo NÃO declara preço — e isso é intencional, não esquecimento.
   * O valor depende do caso e é combinado na consulta; inventar um `price`
   * aqui seria a mesma invenção que o site inteiro se recusa a fazer, com o
   * agravante de virar rich snippet na busca.
   */
  it('não inventa preço para nenhum serviço', () => {
    const bruto = JSON.stringify(negocio.hasOfferCatalog)
    expect(bruto).not.toMatch(/"price"/)
    expect(bruto).not.toMatch(/priceCurrency/)
  })
})

describe('canônicas e metadados das rotas', () => {
  it('toda canônica é absoluta e no domínio do site', () => {
    for (const rota of ROUTES) {
      expect(canonicalFor(rota)).toMatch(new RegExp(`^${BUSINESS.url.replace('.', '\\.')}`))
    }
  })

  it('a home canônica termina em barra e as demais não', () => {
    expect(canonicalFor(ROUTES[0])).toBe(`${BUSINESS.url}/`)
    for (const rota of ROUTES.slice(1)) {
      expect(canonicalFor(rota).endsWith('/')).toBe(false)
    }
  })

  /**
   * Limites do Google: o título é cortado por volta de 60 caracteres e a
   * description por volta de 160. Passar um pouco não é erro — o corte é por
   * pixel, não por caractere —, mas passar muito significa que a parte que
   * convence nunca aparece no resultado da busca.
   */
  it('títulos e descriptions cabem no resultado da busca', () => {
    for (const rota of [...ROUTES, NAO_ENCONTRADA]) {
      expect(rota.title.length, `title de ${rota.path}`).toBeLessThanOrEqual(80)
      expect(rota.description.length, `description de ${rota.path}`).toBeLessThanOrEqual(250)
    }

    // O piso só vale para as páginas indexáveis: uma description curta demais
    // desperdiça o espaço do resultado. O 404 é `noindex` e não compete por
    // esse espaço — exigir 70 caracteres ali seria encher linguiça.
    for (const rota of ROUTES) {
      expect(rota.description.length, `description de ${rota.path}`).toBeGreaterThan(70)
    }
  })

  it('não há duas rotas com o mesmo título', () => {
    const titulos = ROUTES.map((r) => r.title)
    expect(new Set(titulos).size).toBe(titulos.length)
  })
})

describe('llms.txt', () => {
  const texto = buildLlmsTxt()

  it('abre com o nome do negócio como cabeçalho Markdown', () => {
    expect(texto.startsWith(`# ${BUSINESS.name}`)).toBe(true)
  })

  it('lista todos os serviços e todas as rotas', () => {
    for (const servico of SERVICES) {
      expect(texto).toContain(servico.name)
    }
    for (const rota of ROUTES) {
      expect(texto).toContain(canonicalFor(rota))
    }
  })

  /**
   * A seção "o que a empresa NÃO faz" é o motivo de este arquivo existir.
   * Um assistente que resume o site sem ela produziria exatamente a promessa
   * que a Delamayer se recusa a fazer — com a autoridade de estar citando a
   * fonte oficial.
   */
  it('inclui a seção de limites', () => {
    expect(texto).toContain('O que a empresa NÃO faz')
    expect(texto).toMatch(/não apaga dívida legítima/i)
  })

  it('traz o telefone e o conceito de score × rating', () => {
    expect(texto).toContain(BUSINESS.phoneDisplay)
    expect(texto).toContain('rating')
  })
})
