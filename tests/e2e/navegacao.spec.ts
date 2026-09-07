import { expect, test } from '@playwright/test'

/**
 * O que o robô e o leitor de link enxergam.
 *
 * Estes testes rodam contra o build servido pelo `vite preview`, então eles
 * verificam o HTML **inicial** de cada rota — o mesmo que o Googlebot e a
 * prévia do WhatsApp leem antes de executar qualquer JavaScript. É o único
 * lugar onde o `perRouteHtmlPlugin` do vite.config.ts pode ser conferido de
 * verdade.
 */

const ROTAS = [
  { caminho: '/', titulo: /Delamayer/, canonical: 'https://delamayer.com.br/' },
  {
    caminho: '/diagnostico/',
    titulo: /Diagnóstico/,
    canonical: 'https://delamayer.com.br/diagnostico',
  },
  { caminho: '/rating/', titulo: /rating banc/i, canonical: 'https://delamayer.com.br/rating' },
  { caminho: '/imovel/', titulo: /Financiamento/, canonical: 'https://delamayer.com.br/imovel' },
]

test.describe('HTML por rota', () => {
  for (const rota of ROTAS) {
    test(`${rota.caminho} tem título, description e canonical próprios`, async ({ page }) => {
      await page.goto(rota.caminho)

      await expect(page).toHaveTitle(rota.titulo)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute('href', rota.canonical)

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toBeTruthy()
      expect(description!.length).toBeGreaterThan(70)
    })
  }

  test('cada rota traz um JSON-LD válido e coerente', async ({ page }) => {
    for (const rota of ROTAS) {
      await page.goto(rota.caminho)

      const bruto = await page.locator('script[type="application/ld+json"]').textContent()
      expect(bruto, rota.caminho).toBeTruthy()

      const dados = JSON.parse(bruto!)
      expect(dados['@context']).toBe('https://schema.org')

      const tipos = dados['@graph'].map((no: { '@type': string }) => no['@type'])
      expect(tipos).toContain('FinancialService')

      // Só as rotas filhas carregam trilha de navegação.
      if (rota.caminho !== '/') expect(tipos, rota.caminho).toContain('BreadcrumbList')
    }
  })

  test('o 404 responde com status 404 e sai do índice', async ({ page }) => {
    // O `vite preview` devolve o index em rotas desconhecidas, então o teste do
    // status real acontece no smoke test do deploy, contra o CloudFront. Aqui
    // se confere o conteúdo do arquivo que a distribuição serve.
    const resposta = await page.goto('/404.html')
    expect(resposta?.status()).toBe(200)

    await expect(page).toHaveTitle(/não encontrada/i)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})

test.describe('imagem de compartilhamento', () => {
  /**
   * Duas coisas quebram aqui e nenhuma dá erro visível: a meta tag apontar para
   * um arquivo que o gerador não produziu, e as cinco rotas dividirem a mesma
   * arte porque o plugin do build parou de reescrever a tag. A primeira só
   * aparece quando alguém cola o link e vê um espaço em branco.
   */
  test('cada rota aponta para uma arte própria, e o arquivo existe', async ({ page, request }) => {
    const vistas = new Map<string, string>()

    for (const rota of ROTAS) {
      await page.goto(rota.caminho)

      const src = await page.locator('meta[property="og:image"]').getAttribute('content')
      const twitter = await page.locator('meta[name="twitter:image"]').getAttribute('content')
      expect(src, rota.caminho).toBeTruthy()
      // As duas redes precisam apontar para o mesmo lugar.
      expect(twitter, rota.caminho).toBe(src)

      const alt = await page.locator('meta[property="og:image:alt"]').getAttribute('content')
      expect(alt?.length, `alt de ${rota.caminho}`).toBeGreaterThan(8)

      // O arquivo tem que existir de verdade no build.
      const arquivo = new URL(src!).pathname
      const resposta = await request.get(arquivo)
      expect(resposta.status(), `${rota.caminho} -> ${arquivo}`).toBe(200)

      vistas.set(rota.caminho, arquivo)
    }

    // Quatro rotas, quatro artes distintas.
    expect(new Set(vistas.values()).size).toBe(ROTAS.length)
  })
})

test.describe('arquivos de SEO', () => {
  test('sitemap.xml lista as rotas indexáveis', async ({ request }) => {
    const resposta = await request.get('/sitemap.xml')
    expect(resposta.status()).toBe(200)

    const xml = await resposta.text()
    for (const rota of ROTAS) {
      expect(xml).toContain(rota.canonical)
    }
    // O 404 é noindex e não pode aparecer.
    expect(xml).not.toContain('/404')
  })

  test('llms.txt descreve o negócio e os limites do serviço', async ({ request }) => {
    const resposta = await request.get('/llms.txt')
    expect(resposta.status()).toBe(200)

    const texto = await resposta.text()
    expect(texto).toContain('# Delamayer Soluções Financeiras')
    expect(texto).toContain('O que a empresa NÃO faz')
  })

  test('robots.txt aponta para o sitemap', async ({ request }) => {
    const texto = await (await request.get('/robots.txt')).text()
    expect(texto).toContain('Sitemap: https://delamayer.com.br/sitemap.xml')
  })
})

test.describe('navegação no cliente', () => {
  test('trocar de rota atualiza o título sem recarregar', async ({ page }) => {
    await page.goto('/')

    // A cortina de abertura trava a rolagem por ~2,3 s; esperar por ela evita
    // um clique que o overlay engoliria.
    await page.waitForTimeout(2600)

    await page.getByRole('link', { name: 'Score × Rating', exact: true }).first().click()

    await expect(page).toHaveTitle(/rating banc/i)
    await expect(page).toHaveURL(/\/rating$/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://delamayer.com.br/rating',
    )
  })
})
