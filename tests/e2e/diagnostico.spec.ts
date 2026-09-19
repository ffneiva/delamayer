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
 * O fluxo passou a ser **nome → cinco perguntas → contato → leitura**. O nome
 * abre porque é ele que transforma um abandono em alguém para chamar de volta;
 * o contato fecha porque pedi-lo antes de entregar qualquer coisa espanta
 * quem chegou. Por isso quase todo teste daqui começa preenchendo o nome.
 *
 * A API é interceptada: estes testes são sobre a interface, e não sobre a
 * gravação. Sem o bloqueio, cada execução deixaria lixo no banco de produção.
 */

/** Responde a primeira tela e entra na pergunta 1. */
async function comecar(page: import('@playwright/test').Page, nome = 'Fulano de Teste') {
  await page.getByLabel('Nome completo').fill(nome)
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

  test('pede o nome antes de qualquer pergunta', async ({ page }) => {
    await expect(page.getByText('Como é o seu nome completo?')).toBeVisible()
    await expect(page.getByText('Pergunta 1 de 5')).toBeHidden()

    // Nome curto demais não passa: um registro sem nome não serve para retomar.
    await page.getByLabel('Nome completo').fill('Jo')
    await page.getByRole('button', { name: 'Começar' }).click()
    await expect(page.getByText(/Escreva seu nome completo/)).toBeVisible()
  })

  test('avança sozinho a cada resposta e mostra o progresso', async ({ page }) => {
    await comecar(page)

    await page.getByRole('button', { name: 'Tenho', exact: true }).click()
    await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()

    await page.getByRole('button', { name: 'Está', exact: true }).click()
    await expect(page.getByText('Pergunta 3 de 5')).toBeVisible()

    // Três de sete passos (nome, cinco perguntas, contato).
    const barra = page.getByRole('progressbar')
    await expect(barra).toHaveAttribute('aria-valuenow', '43')
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

    await page.getByRole('button', { name: 'Pular e ver a leitura' }).click()

    await expect(page.getByText('Rating bancário').first()).toBeVisible()
    await expect(page.getByText('O score não é o que está te reprovando')).toBeVisible()
  })

  test('o contato pode ser pulado sem prender a leitura', async ({ page }) => {
    await comecar(page)
    for (const opcao of ['Tenho', 'Está', 'Levei', 'Abaixo de 400', 'Financiar um imóvel']) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }

    await expect(page.getByText('Onde a gente te encontra?')).toBeVisible()
    await page.getByRole('button', { name: 'Pular e ver a leitura' }).click()
    await expect(page.getByText('Leitura', { exact: true })).toBeVisible()
  })

  test('o telefone incompleto é recusado antes de seguir', async ({ page }) => {
    await comecar(page)
    for (const opcao of ['Tenho', 'Está', 'Levei', 'Abaixo de 400', 'Financiar um imóvel']) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }

    await page.getByLabel('Telefone com DDD').fill('9999')
    await page.getByRole('button', { name: 'Ver a minha leitura' }).click()
    await expect(page.getByText(/precisa ter DDD/)).toBeVisible()
  })

  test('o resultado gera um link de WhatsApp com o nome e o caso', async ({ page }) => {
    await comecar(page, 'Maria Aparecida')
    for (const opcao of ['Tenho', 'Está', 'Levei', 'Abaixo de 400', 'Financiar um imóvel']) {
      await page.getByRole('button', { name: opcao, exact: true }).click()
    }
    await page.getByRole('button', { name: 'Pular e ver a leitura' }).click()

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
    await page.getByRole('button', { name: 'Pular e ver a leitura' }).click()

    // `exact` importa aqui: sem ele o localizador é ambíguo — a palavra
    // "leitura" também aparece no título da página, quebrada em palavras pelo
    // <SplitHeading>, e o Playwright falha por strict mode em vez de por bug.
    await expect(page.getByText('Leitura', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Refazer' }).click()
    await expect(page.getByText('Como é o seu nome completo?')).toBeVisible()
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

  test('percorre as quatro perguntas e abre o WhatsApp com elas escritas', async ({ page }) => {
    await page.getByLabel('Nome completo').fill('José da Silva')
    await page.getByRole('button', { name: 'Começar' }).click()

    await expect(page.getByText('Seu nome está limpo?')).toBeVisible()
    await page.getByRole('button', { name: 'Sim', exact: true }).click()

    await expect(page.getByText('Você está negativado?')).toBeVisible()
    await page.getByRole('button', { name: 'Não', exact: true }).click()

    await expect(page.getByText('O que você quer financiar?')).toBeVisible()
    await page.getByRole('button', { name: 'Carro', exact: true }).click()

    await page.getByLabel('Telefone com DDD').fill('62999998888')
    await page.getByRole('button', { name: 'Concluir' }).click()

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
