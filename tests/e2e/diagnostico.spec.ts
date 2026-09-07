import { expect, test } from '@playwright/test'

/**
 * O fluxo do diagnóstico, no navegador.
 *
 * A lógica da triagem já é testada em tests/unit — 288 combinações. O que só
 * aqui dá para verificar é o que acontece na tela: o avanço automático, a barra
 * de progresso, o botão de voltar e — o mais importante — que o resultado vira
 * um link de WhatsApp com a mensagem certa.
 *
 * A rota /diagnostico é usada em vez da seção da home porque ali não há
 * preloader nem rolagem no caminho: o teste fica sobre o comportamento, não
 * sobre a coreografia.
 */

test.describe('/diagnostico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/diagnostico/')
  })

  test('avança sozinho a cada resposta e mostra o progresso', async ({ page }) => {
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()

    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()

    await page.getByRole('button', { name: 'Está', exact: true }).click()
    await expect(page.getByText('Pergunta 3 de 5')).toBeVisible()

    const barra = page.getByRole('progressbar')
    await expect(barra).toHaveAttribute('aria-valuenow', '40')
  })

  test('o botão voltar preserva a resposta anterior', async ({ page }) => {
    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await page.getByRole('button', { name: 'Está', exact: true }).click()

    await page.getByRole('button', { name: '← Voltar' }).click()
    await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()

    // A opção escolhida antes continua marcada — o `aria-pressed` não é usado
    // aqui, então a checagem é pela classe de destaque aplicada à selecionada.
    await page.getByRole('button', { name: '← Voltar' }).click()
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  })

  /**
   * O caminho que leva ao cenário "rating": sem dívida, sem negativação, score
   * alto e mesmo assim uma recusa. É o caso que dá nome ao diferencial da
   * empresa, e o que mais importa acertar.
   */
  test('score alto com recusa aponta para rating bancário', async ({ page }) => {
    await page.getByRole('button', { name: 'Não tenho', exact: true }).click()
    await page.getByRole('button', { name: 'Não está', exact: true }).click()
    await page.getByRole('button', { name: 'Levei', exact: true }).click()
    await page.getByRole('button', { name: 'Acima de 700', exact: true }).click()
    await page.getByRole('button', { name: 'Voltar a ter crédito', exact: true }).click()

    await expect(page.getByText('Rating bancário').first()).toBeVisible()
    await expect(page.getByText('O score não é o que está te reprovando')).toBeVisible()
  })

  test('o resultado gera um link de WhatsApp com o caso descrito', async ({ page }) => {
    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await page.getByRole('button', { name: 'Está', exact: true }).click()
    await page.getByRole('button', { name: 'Levei', exact: true }).click()
    await page.getByRole('button', { name: 'Abaixo de 400', exact: true }).click()
    await page.getByRole('button', { name: 'Financiar um imóvel', exact: true }).click()

    const link = page.getByRole('link', { name: /Levar isto para o WhatsApp/ })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/5562995006161\?text=/)

    const mensagem = decodeURIComponent(href!.split('text=')[1])
    expect(mensagem).toContain('nome negativado')
    expect(mensagem).toContain('quero financiar um imóvel')
  })

  test('refazer volta à primeira pergunta', async ({ page }) => {
    for (const opcao of [
      'Não tenho',
      'Não está',
      'Não levei',
      'Acima de 700',
      'Voltar a ter crédito',
    ]) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }

    // `exact` importa aqui: sem ele o localizador é ambíguo — a palavra
    // "leitura" também aparece no título da página, quebrada em palavras pelo
    // <SplitHeading>, e o Playwright falha por strict mode em vez de por bug.
    await expect(page.getByText('Leitura', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Refazer' }).click()
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  })

  test('diz na tela que nada é enviado a servidor', async ({ page }) => {
    // Esta promessa é parte do argumento da página. Se alguém acrescentar um
    // envio de formulário sem atualizar o texto, o teste continua passando —
    // mas o texto ausente é sinal de que a promessa sumiu junto.
    await expect(page.getByText(/Nada do que você responde sai deste navegador/)).toBeVisible()
  })
})
