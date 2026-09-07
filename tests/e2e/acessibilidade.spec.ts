import { expect, test } from '@playwright/test'

/**
 * Acessibilidade e conversão — as duas coisas que quebram sem ninguém notar.
 *
 * Não é uma auditoria completa (isso pede axe-core e um orçamento de tempo
 * maior). São as verificações que pegam as regressões mais prováveis num site
 * cheio de animação: um h1 que sumiu atrás de uma máscara, um botão sem nome
 * acessível, um CTA que perdeu o link.
 */

const ROTAS = ['/', '/diagnostico/', '/rating/', '/imovel/', '/politica-de-privacidade/']

test.describe('estrutura de cada página', () => {
  for (const rota of ROTAS) {
    test(`${rota} tem exatamente um h1 visível`, async ({ page }) => {
      await page.goto(rota)
      // Na home a cortina de abertura precisa sair antes de o h1 aparecer.
      if (rota === '/') await page.waitForTimeout(2600)

      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1)
      await expect(h1).toBeVisible()
      expect((await h1.textContent())?.trim().length).toBeGreaterThan(4)
    })

    test(`${rota} tem o atalho para o conteúdo e o idioma declarado`, async ({ page }) => {
      await page.goto(rota)

      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
      await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeAttached()
    })
  }
})

test.describe('caminhos até o WhatsApp', () => {
  test('a home oferece o CTA principal com link válido', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2600)

    const cta = page.getByRole('link', { name: /Consulta grátis no WhatsApp/ })
    await expect(cta).toBeVisible()

    const href = await cta.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/5562995006161\?text=/)
    // `target="_blank"` sem `rel="noopener"` é uma brecha de segurança clássica.
    await expect(cta).toHaveAttribute('rel', /noopener/)
  })

  test('todo link para o wa.me usa o número do business.ts', async ({ page }) => {
    for (const rota of ROTAS) {
      await page.goto(rota)
      const hrefs = await page
        .locator('a[href*="wa.me"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''))

      expect(hrefs.length, rota).toBeGreaterThan(0)
      for (const href of hrefs) {
        expect(href, `${rota}: ${href}`).toContain('wa.me/5562995006161')
      }
    }
  })
})

test.describe('nenhum botão fica sem nome acessível', () => {
  for (const rota of ROTAS) {
    test(`${rota}`, async ({ page }) => {
      await page.goto(rota)
      if (rota === '/') await page.waitForTimeout(2600)

      const semNome = await page.locator('button:visible').evaluateAll((els) =>
        els
          .filter((el) => {
            const texto = (el.textContent ?? '').trim()
            const rotulo = el.getAttribute('aria-label')
            return !texto && !rotulo
          })
          .map((el) => el.outerHTML.slice(0, 120)),
      )

      expect(semNome, `botões sem nome em ${rota}`).toEqual([])
    })
  }
})

test.describe('o menu', () => {
  test('abre, fecha com Escape e devolve a rolagem', async ({ page }) => {
    await page.goto('/rating/')

    const abrir = page.getByRole('button', { name: 'Abrir menu' })
    await abrir.click()

    await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Menu completo' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible()

    // A rolagem precisa voltar: o menu a trava enquanto está aberto, e esquecer
    // de destravar deixa a página inteira presa.
    const overflow = await page.evaluate(() => document.body.style.overflow)
    expect(overflow).not.toBe('hidden')
  })
})

test.describe('conteúdo de terceiro', () => {
  /**
   * O vídeo continua atrás de um clique; o mapa, não.
   *
   * O mapa deixou de ser um iframe do Google e passou a ser desenhado pelo
   * próprio site com tiles do OpenStreetMap (ver components/Mapa) — que são
   * requisições de imagem, sem script e sem cookie. Por isso ele pode carregar
   * de imediato sem trazer de volta o problema que o clique evitava.
   *
   * O que este teste protege é a fronteira: nenhum **iframe** de terceiro pode
   * ser montado sem alguém pedir.
   */
  test('nenhum iframe de terceiro é montado sem clique', async ({ page }) => {
    const iframes: string[] = []
    page.on('request', (req) => {
      const url = req.url()
      if (/maps\.google|youtube(-nocookie)?\.com\/embed|googletagmanager/.test(url)) {
        iframes.push(url)
      }
    })

    await page.goto('/')
    await page.waitForTimeout(2600)
    // Percorre a página inteira, disparando todos os IntersectionObserver.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)

    expect(iframes, 'iframe de terceiro carregado sem clique').toEqual([])
  })

  test('o mapa aparece sozinho, com o alfinete da marca', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2600)
    await page.getByRole('heading', { name: /Setor Oeste/ }).scrollIntoViewIfNeeded()

    // Os tiles vêm do OpenStreetMap, e a atribuição é exigida pela licença.
    await expect(page.getByRole('link', { name: 'OpenStreetMap' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Abrir rota até/ })).toBeVisible()
  })
})
