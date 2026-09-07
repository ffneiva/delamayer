import { BUSINESS } from './business.ts'

/**
 * O diagnóstico rápido — a única lógica de negócio do site.
 *
 * Cinco perguntas, uma leitura. Ele não consulta birô nenhum (nem poderia: não
 * há back-end, e consulta de CPF exige autorização do titular). O que ele faz
 * é aplicar, em cinco cliques, o mesmo raciocínio de triagem que a Delamayer
 * faz no início de todo atendimento — e mandar a pessoa para o WhatsApp com o
 * caso já descrito, em vez de um "oi" que custa dez mensagens para virar
 * contexto.
 *
 * Duas regras que o teste em tests/unit/diagnostico.test.ts protege:
 *
 *  1. **Toda combinação possível de respostas produz um resultado.** Sem
 *     `undefined`, sem caso não previsto. São 3×3×2×4×4 = 288 combinações; o
 *     teste percorre todas.
 *
 *  2. **O resultado nunca promete.** Nenhum texto daqui afirma prazo, valor ou
 *     garantia de aprovação — a triagem aponta caminho, quem confirma é a
 *     consulta. Este arquivo é o lugar onde a promessa enganosa entraria sem
 *     ninguém notar, então é aqui que ela é barrada.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Perguntas
// ─────────────────────────────────────────────────────────────────────────────

type OpcaoId = string

export type Pergunta = {
  id: 'divida' | 'negativado' | 'recusa' | 'score' | 'objetivo'
  titulo: string
  /** Explica por que a pergunta importa. Aparece abaixo do título. */
  motivo: string
  opcoes: { id: OpcaoId; label: string }[]
}

export const PERGUNTAS: Pergunta[] = [
  {
    id: 'divida',
    titulo: 'Você tem alguma conta em atraso hoje?',
    motivo: 'Atraso e negativação são coisas diferentes — dá para ter um sem o outro.',
    opcoes: [
      { id: 'sim', label: 'Tenho' },
      { id: 'nao', label: 'Não tenho' },
      { id: 'talvez', label: 'Não sei dizer' },
    ],
  },
  {
    id: 'negativado',
    titulo: 'Seu nome está negativado?',
    motivo: 'Negativação é o registro público no Serasa, SPC, Quod ou Boa Vista.',
    opcoes: [
      { id: 'sim', label: 'Está' },
      { id: 'nao', label: 'Não está' },
      { id: 'talvez', label: 'Não sei dizer' },
    ],
  },
  {
    id: 'recusa',
    titulo: 'Levou um "não" do banco nos últimos seis meses?',
    motivo: 'Cartão, empréstimo, financiamento, aumento de limite — qualquer um conta.',
    opcoes: [
      { id: 'sim', label: 'Levei' },
      { id: 'nao', label: 'Não levei' },
    ],
  },
  {
    id: 'score',
    titulo: 'Como está o seu score hoje?',
    motivo: 'A consulta é gratuita no app do Serasa. Se não souber, tudo bem.',
    opcoes: [
      { id: 'alto', label: 'Acima de 700' },
      { id: 'medio', label: 'Entre 400 e 700' },
      { id: 'baixo', label: 'Abaixo de 400' },
      { id: 'talvez', label: 'Não sei dizer' },
    ],
  },
  {
    id: 'objetivo',
    titulo: 'O que você quer destravar?',
    motivo: 'O objetivo muda a ordem do que se resolve primeiro.',
    opcoes: [
      { id: 'imovel', label: 'Financiar um imóvel' },
      { id: 'credito', label: 'Voltar a ter crédito' },
      { id: 'pj', label: 'Capital de giro para a empresa' },
      { id: 'consorcio', label: 'Entrar num consórcio' },
    ],
  },
]

export type Respostas = {
  divida: 'sim' | 'nao' | 'talvez'
  negativado: 'sim' | 'nao' | 'talvez'
  recusa: 'sim' | 'nao'
  score: 'alto' | 'medio' | 'baixo' | 'talvez'
  objetivo: 'imovel' | 'credito' | 'pj' | 'consorcio'
}

export type RespostasParciais = Partial<Respostas>

/** `true` quando as cinco perguntas foram respondidas. */
export function completo(r: RespostasParciais): r is Respostas {
  return PERGUNTAS.every((p) => r[p.id] !== undefined)
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

type CenarioId = 'negativacao' | 'rating' | 'cadastro' | 'preventivo' | 'indefinido'

export type Leitura = {
  id: CenarioId
  /** Rótulo curto do cenário, mostrado como etiqueta. */
  etiqueta: string
  titulo: string
  /** O raciocínio, em uma frase. Nunca uma promessa. */
  leitura: string
  /** O que a Delamayer faria primeiro neste caso. */
  primeiroPasso: string
  /** Ids de SERVICES (ver business.ts) relevantes, na ordem de prioridade. */
  servicos: string[]
}

/**
 * A triagem.
 *
 * A ordem dos testes é a ordem de prioridade clínica, e não muda: uma
 * negativação ativa domina qualquer outra leitura, porque nada mais se resolve
 * enquanto ela existe. Só depois vale a pena perguntar se o problema é rating.
 */
export function diagnosticar(r: Respostas): Leitura {
  const querImovel = r.objetivo === 'imovel'
  const ehPj = r.objetivo === 'pj'

  // 1. Restrição ativa (ou fortemente indicada). Domina tudo.
  if (r.negativado === 'sim' || (r.divida === 'sim' && r.recusa === 'sim')) {
    return {
      id: 'negativacao',
      etiqueta: 'Restrição ativa',
      titulo: 'Existe uma trava registrada no seu nome',
      leitura:
        'Enquanto houver restrição ativa, a análise do banco para na primeira consulta — ' +
        'renda e relacionamento nem chegam a ser avaliados. É o que precisa sair da frente primeiro.',
      primeiroPasso:
        'Levantar todas as pendências por credor e descobrir quais delas destravam mais crédito ' +
        'por real pago. Nem sempre é a maior, e quase nunca é a mais antiga.',
      servicos: ehPj
        ? ['pj', 'diagnostico', 'regularizacao']
        : querImovel
          ? ['diagnostico', 'regularizacao', 'imobiliario']
          : ['diagnostico', 'regularizacao', 'rating'],
    }
  }

  // 2. O caso assinatura: score bom, sem negativação — e mesmo assim negado.
  //    É aqui que o rating bancário aparece, e é o motivo de existir a página
  //    /rating. Note que `score: 'medio'` também entra: 400–700 é faixa em que
  //    o birô não reprova, mas o rating interno do banco pode reprovar.
  //    (chegar aqui já garante `negativado !== 'sim'` — o primeiro ramo tratou
  //    esse caso e saiu, então repetir a condição seria código morto.)
  if (r.recusa === 'sim' && (r.score === 'alto' || r.score === 'medio')) {
    return {
      id: 'rating',
      etiqueta: 'Rating bancário',
      titulo: 'O score não é o que está te reprovando',
      leitura:
        'Nome sem restrição, score que não reprova e crédito negado assim mesmo: o padrão aponta ' +
        'para o rating interno da instituição — a nota de A a F que cada banco calcula sobre o ' +
        'relacionamento que você tem com ele, e que não aparece em consulta nenhuma.',
      primeiroPasso:
        'Ler o que consta no Registrato do Banco Central e mapear como cada instituição enxerga ' +
        'você hoje. Em muitos casos a trava está numa operação encerrada que ninguém atualizou.',
      servicos: ehPj ? ['rating', 'pj', 'diagnostico'] : ['rating', 'diagnostico', 'imobiliario'],
    }
  }

  // 3. Sem dívida, sem negativação, mas houve recusa. Sobra cadastro/registro.
  if (r.recusa === 'sim' && r.divida === 'nao' && r.negativado === 'nao') {
    return {
      id: 'cadastro',
      etiqueta: 'Cadastro ou registro',
      titulo: 'Provavelmente é informação desatualizada',
      leitura:
        'Sem dívida em aberto e sem restrição, a recusa costuma vir de registro que ficou para ' +
        'trás: operação quitada que continua marcada no SCR do Banco Central, dado cadastral ' +
        'antigo ou renda não comprovável no formato que o banco aceita.',
      primeiroPasso:
        'Puxar o Registrato e comparar com o que você sabe ter quitado. A divergência aparece rápido ' +
        'e a correção é pedida ao próprio credor.',
      servicos: querImovel ? ['diagnostico', 'imobiliario', 'rating'] : ['diagnostico', 'rating'],
    }
  }

  // 4. Nada negado ainda — o cenário mais barato de resolver, e o mais raro de
  //    alguém procurar. Quem chega aqui está se preparando, não apagando fogo.
  if (r.recusa === 'nao' && r.negativado === 'nao') {
    return {
      id: 'preventivo',
      etiqueta: 'Preparação',
      titulo: 'Você está no melhor momento possível para agir',
      leitura:
        'Sem restrição e sem recusa recente, não há incêndio para apagar. O trabalho aqui é de ' +
        'preparo: chegar ao pedido de crédito com o cadastro, o rating e a comprovação de renda ' +
        'no melhor estado que eles podem estar.',
      primeiroPasso:
        querImovel || r.objetivo === 'consorcio'
          ? 'Simular capacidade real de pagamento e definir o que precisa acontecer nos meses que ' +
            'antecedem a proposta — inclusive o que NÃO fazer, como abrir consultas desnecessárias.'
          : 'Mapear o relacionamento com cada banco e a ordem em que mexer nos limites, para o rating ' +
            'subir antes do pedido, e não depois da recusa.',
      servicos:
        r.objetivo === 'consorcio'
          ? ['consorcio', 'diagnostico', 'rating']
          : querImovel
            ? ['imobiliario', 'diagnostico', 'rating']
            : ehPj
              ? ['pj', 'rating', 'diagnostico']
              : ['rating', 'diagnostico'],
    }
  }

  // 5. Resto: há "não sei" em ponto decisivo. A resposta honesta é dizer que
  //    só a consulta responde — e não fabricar um cenário para preencher a tela.
  return {
    id: 'indefinido',
    etiqueta: 'Precisa de consulta',
    titulo: 'Falta o dado que só a consulta mostra',
    leitura:
      'Com o que você respondeu, dá para dizer que existe alguma coisa travando — mas não qual. ' +
      'Chutar aqui seria o mesmo que os sites que prometem resultado antes de olhar o caso.',
    primeiroPasso:
      'A consulta sai na hora, pelo WhatsApp, e é ela que separa negativação de rating e de ' +
      'cadastro desatualizado. Sem custo e sem compromisso.',
    servicos: ehPj ? ['diagnostico', 'pj'] : ['diagnostico', 'regularizacao', 'rating'],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// A mensagem que chega no WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

const RESUMO: Record<keyof Respostas, Record<string, string>> = {
  divida: {
    sim: 'tenho conta em atraso',
    nao: 'sem conta em atraso',
    talvez: 'não sei se tenho atraso',
  },
  negativado: {
    sim: 'nome negativado',
    nao: 'nome sem restrição',
    talvez: 'não sei se estou negativado',
  },
  recusa: { sim: 'tive crédito negado nos últimos 6 meses', nao: 'sem recusa recente' },
  score: {
    alto: 'score acima de 700',
    medio: 'score entre 400 e 700',
    baixo: 'score abaixo de 400',
    talvez: 'não sei meu score',
  },
  objetivo: {
    imovel: 'quero financiar um imóvel',
    credito: 'quero voltar a ter crédito',
    pj: 'preciso de capital de giro para a empresa',
    consorcio: 'quero entrar num consórcio',
  },
}

/**
 * Monta o texto que vai no `wa.me`.
 *
 * A mensagem é escrita na primeira pessoa do visitante de propósito: quem
 * recebe precisa ler um relato, não um relatório de formulário. E ela cabe na
 * prévia do WhatsApp sem cortar — daí o limite de linhas.
 */
export function mensagemWhatsApp(r: Respostas, leitura: Leitura): string {
  const itens = (Object.keys(RESUMO) as (keyof Respostas)[])
    .map((chave) => RESUMO[chave][r[chave]])
    .filter(Boolean)

  return [
    `Olá! Fiz o diagnóstico no site da ${BUSINESS.shortName}.`,
    '',
    `Situação: ${itens.slice(0, 4).join(', ')}.`,
    `Objetivo: ${RESUMO.objetivo[r.objetivo]}.`,
    '',
    `O site apontou: ${leitura.titulo}.`,
    '',
    'Podemos fazer a consulta?',
  ].join('\n')
}

/** URL final do WhatsApp, com a mensagem já codificada. */
export function linkDiagnostico(r: Respostas, leitura: Leitura): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(mensagemWhatsApp(r, leitura))}`
}

/** Link genérico, para os CTAs que não vêm do diagnóstico. */
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(texto)}`
}
