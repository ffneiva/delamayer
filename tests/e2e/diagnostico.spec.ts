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
 *
 * ── A ordem mudou, e os testes mudaram junto ────────────────────────────────
 *
 * O fluxo é **nome, WhatsApp e e-mail → cinco perguntas → leitura**. Pedido
 * da Delamayer (21/09/2026): com o contato no fim, quem desistia no meio ia
 * embora sem deixar como ser chamado. Nome e WhatsApp são obrigatórios; o
 * e-mail, não. Por isso quase todo teste daqui começa preenchendo os dois.
 *
 * A API é interceptada: estes testes são sobre a interface, e não sobre a
 * gravação. Sem o bloqueio, cada execução deixaria lixo no banco de produção.
 */

/** Responde a primeira tela e entra na pergunta 1. */
async function comecar(page: import('@playwright/test').Page, nome = 'Fulano de Teste') {
  await page.getByLabel('Nome completo').fill(nome)
  await page.getByLabel('WhatsApp com DDD').fill('62999998888')
  await page.getByRole('button', { name: 'Começar' }).click()
  await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
}

test.describe('/diagnostico', () => {
  test.beforeEach(async ({ page }) => {
    // Nada de gravar lead a cada rodada de teste. A interface tem que se
    // comportar igual com a API muda — que é, aliás, o que acontece quando um
    // bloqueador de anúncios come a requisição.
    await page.route('**/api/**', (rota) =>
      rota.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    )
    await page.goto('/diagnostico/')
  })

  test('pede nome e WhatsApp antes de qualquer pergunta, e não deixa passar sem eles', async ({
    page,
  }) => {
    await expect(page.getByText('Para começar, seus dados.')).toBeVisible()
    await expect(page.getByText('Pergunta 1 de 5')).toBeHidden()

    // Sem nada: os dois obrigatórios reclamam, e a pergunta 1 não aparece.
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText(/Escreva seu nome completo/)).toBeVisible()
    await expect(page.getByText(/Informe o WhatsApp com DDD/)).toBeVisible()
    await expect(page.getByText('Pergunta 1 de 5')).toBeHidden()

    // Nome certo, telefone incompleto: ainda não passa.
    await page.getByLabel('Nome completo').fill('Maria Aparecida')
    await page.getByLabel('WhatsApp com DDD').fill('9999')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText(/Informe o WhatsApp com DDD/)).toBeVisible()
    await expect(page.getByText('Pergunta 1 de 5')).toBeHidden()

    // O telefone ganha máscara enquanto se digita, e o e-mail é opcional.
    await page.getByLabel('WhatsApp com DDD').fill('62999998888')
    await expect(page.getByLabel('WhatsApp com DDD')).toHaveValue('(62) 99999-8888')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  })

  test('e-mail preenchido errado é recusado; em branco, não', async ({ page }) => {
    await page.getByLabel('Nome completo').fill('Maria Aparecida')
    await page.getByLabel('WhatsApp com DDD').fill('62999998888')
    await page.getByLabel('E-mail (opcional)').fill('maria@')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText('Confira o e-mail.')).toBeVisible()
    await page.getByLabel('E-mail (opcional)').fill('')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  })

  test('avança sozinho a cada resposta e mostra o progresso', async ({ page }) => {
    await comecar(page)

    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()

    await page.getByRole('button', { name: 'Está', exact: true }).click()
    await expect(page.getByText('Pergunta 3 de 5')).toBeVisible()

    // Três de seis passos (contato e cinco perguntas).
    const barra = page.getByRole('progressbar')
    await expect(barra).toHaveAttribute('aria-valuenow', '50')
  })

  test('o botão voltar preserva a resposta anterior', async ({ page }) => {
    await comecar(page)
    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await page.getByRole('button', { name: 'Está', exact: true }).click()

    await page.getByRole('button', { name: '← Voltar' }).click()
    await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()

    await page.getByRole('button', { name: '← Voltar' }).click()
    await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  })

  /**
   * O caminho que leva ao cenário "rating": sem dívida, sem negativação, score
   * alto e mesmo assim uma recusa. É o caso que dá nome ao diferencial da
   * empresa, e o que mais importa acertar.
   */
  test('score alto com recusa aponta para rating de crédito bancário', async ({ page }) => {
    await comecar(page)
    await page.getByRole('button', { name: 'Não tenho', exact: true }).click()
    await page.getByRole('button', { name: 'Não está', exact: true }).click()
    await page.getByRole('button', { name: 'Levei', exact: true }).click()
    await page.getByRole('button', { name: 'Acima de 700', exact: true }).click()
    await page.getByRole('button', { name: 'Voltar a ter crédito', exact: true }).click()

    await expect(page.getByText('Rating bancário').first()).toBeVisible()
    await expect(page.getByText('O score não é o que está te reprovando')).toBeVisible()
  })

  test('a última resposta leva direto à leitura', async ({ page }) => {
    await comecar(page)
    for (const opcao of ['Tenho', 'Está', 'Levei', 'Abaixo de 400', 'Financiar um imóvel']) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }
    await expect(page.getByText('Leitura', { exact: true })).toBeVisible()
    await expect(page.getByText('Onde a gente te encontra?')).toBeHidden()
  })

  test('o resultado gera um link de WhatsApp com o nome e o caso', async ({ page }) => {
    await comecar(page, 'Maria Aparecida')
    for (const opcao of ['Tenho', 'Está', 'Levei', 'Abaixo de 400', 'Financiar um imóvel']) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }

    const link = page.getByRole('link', { name: /Levar isto para o WhatsApp/ })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/5562995006161\?text=/)

    const mensagem = decodeURIComponent(href!.split('text=')[1])
    // O nome vai junto: quem atende precisa saber com quem está falando.
    expect(mensagem).toContain('Maria Aparecida')
    expect(mensagem).toContain('nome negativado')
    expect(mensagem).toContain('quero financiar um imóvel')
  })

  test('refazer volta à primeira tela', async ({ page }) => {
    await comecar(page)
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
    await expect(page.getByText('Para começar, seus dados.')).toBeVisible()
    // Refazer não obriga a digitar o contato de novo.
    await expect(page.getByLabel('Nome completo')).toHaveValue('Fulano de Teste')
  })

  /**
   * O aviso substituiu uma promessa que deixou de ser verdadeira.
   *
   * Até esta versão o site dizia "nada do que você responde sai deste
   * navegador", e o teste guardava essa frase. Agora as respostas SÃO
   * gravadas, a cada passo, e o que precisa estar na tela é o aviso disso —
   * antes da primeira resposta, e não numa nota de rodapé. Se alguém remover
   * o aviso, a coleta passa a acontecer escondida, e é isso que aqui quebra.
   */
  test('avisa que as respostas ficam guardadas, antes de perguntar qualquer coisa', async ({
    page,
  }) => {
    await expect(page.getByText(/fica guardado com a Delamayer/)).toBeVisible()
  })
})

test.describe('/formulario', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', (rota) =>
      rota.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    )
    await page.goto('/formulario/')
  })

  test('não começa sem nome e WhatsApp', async ({ page }) => {
    await page.getByLabel('Nome completo').fill('José da Silva')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText(/Informe o WhatsApp com DDD/)).toBeVisible()
    await expect(page.getByText('Seu nome está limpo?')).toBeHidden()
  })

  test('percorre as quatro perguntas e abre o WhatsApp com elas escritas', async ({ page }) => {
    await page.getByLabel('Nome completo').fill('José da Silva')
    await page.getByLabel('WhatsApp com DDD').fill('(62) 99999-8888')
    await page.getByLabel('E-mail (opcional)').fill('jose@exemplo.com')
    await page.getByRole('button', { name: 'Começar' }).click()

    await expect(page.getByText('Seu nome está limpo?')).toBeVisible()
    await page.getByRole('button', { name: 'Sim', exact: true }).click()

    await expect(page.getByText('Você está negativado?')).toBeVisible()
    await page.getByRole('button', { name: 'Não', exact: true }).click()

    await expect(page.getByText('O que você quer financiar?')).toBeVisible()
    await page.getByRole('button', { name: 'Carro', exact: true }).click()

    await expect(page.getByText(/Recebemos, José/)).toBeVisible()

    const link = page.getByRole('link', { name: 'Abrir no WhatsApp' })
    const mensagem = decodeURIComponent((await link.getAttribute('href'))!.split('text=')[1])
    expect(mensagem).toContain('José da Silva')
    expect(mensagem).toContain('Nome limpo: sim')
    expect(mensagem).toContain('Negativado: não')
    expect(mensagem).toContain('Quero financiar: Carro')
    // O e-mail não entra na prévia do WhatsApp, mesmo quando informado.
    expect(mensagem).not.toContain('@')
  })
})
