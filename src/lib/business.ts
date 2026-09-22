/**
 * Fonte única de verdade do conteúdo do site.
 *
 * Tudo que a Delamayer precisa mudar com frequência — telefone, horário,
 * serviço, número, texto — mora aqui. Deste arquivo saem a página, a mensagem
 * pronta do WhatsApp, o JSON-LD que o Google indexa e o `llms.txt`. Não existe
 * caminho em que o visitante leia um dado e o robô leia outro.
 *
 * Regra que atravessa o arquivo: **nada aqui é invenção de marketing.** Cada
 * número tem fonte declarada em `EVIDENCIAS`, cada afirmação sobre o serviço
 * descreve o que a empresa faz de fato. O setor de "limpa nome" é cheio de
 * promessa que o CDC chama de propaganda enganosa; o diferencial deste site é
 * justamente não fazer nenhuma.
 */

export const BUSINESS = {
  name: 'Delamayer Soluções Financeiras',
  shortName: 'Delamayer',
  tagline: 'Seu nome limpo, sua liberdade',
  /** A promessa em uma linha. É o que o site inteiro tenta provar. */
  promessa: 'Do CPF negativado ao financiamento aprovado',
  description:
    'Assessoria de crédito em Goiânia. Limpa nome por ação judicial com pedido de ' +
    'liminar, destravamento do rating de crédito bancário e exclusão de registro no ' +
    'Banco Central. Consulta do CPF na hora, pelo WhatsApp.',

  url: 'https://delamayer.com.br',

  /** Como consta no CNPJ e nos contratos. */
  razaoSocial: 'Delamayer Soluções Financeiras Ltda',
  cnpj: '54.438.914/0001-68',

  phoneDisplay: '(62) 99500-6161',
  /** E.164 sem símbolos — formato exigido pelo wa.me */
  whatsapp: '5562995006161',

  address: {
    venue: 'Stay Coworking',
    street: 'Rua 22, nº 431, Qd. H10, Lt. 24',
    district: 'Setor Oeste',
    city: 'Goiânia',
    state: 'GO',
    zip: '74120-130',
    country: 'BR',
    /** Como o atendimento explica o caminho: é o que a pessoa procura na rua. */
    referencia: 'No prédio amarelo ao lado do Celsinho Bar, perto da Praça do Sol',
  },
  /**
   * O escritório existe e o endereço é real — mas a operação é de WhatsApp e
   * audiência, não de balcão. Anunciar um endereço que recebe sem hora marcada
   * produz o pior resultado possível: a pessoa atravessa a cidade e não
   * encontra ninguém. O aviso acompanha o endereço em todo lugar onde ele
   * aparece — seção, rodapé e dados estruturados.
   */
  agendamento: 'Atendimento presencial somente com hora marcada',

  /** Geocodificado a partir do endereço do perfil no Google Business. */
  geo: { lat: -16.690429, lng: -49.267148 },
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=-16.690429,-49.267148',
  mapsEmbed: 'https://maps.google.com/maps?q=-16.690429,-49.267148&hl=pt-BR&z=17&output=embed',

  instagram: 'https://instagram.com/delamayersolucoes',
  instagramHandle: '@delamayersolucoes',

  /**
   * O perfil no Google ainda usa o nome antigo da operação (DELA+CRED). Fica
   * registrado aqui porque é por ele que boa parte das buscas locais chega.
   */
  nomeAnterior: 'DELA+CRED',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Atendimento
// ─────────────────────────────────────────────────────────────────────────────

export type DaySchedule = {
  label: string
  short: string
  open: string | null
  close: string | null
}

/**
 * Índice = dia da semana no padrão JS (0 = domingo).
 *
 * O horário de abertura (08:00) vem do perfil no Google Business. O de
 * fechamento é o padrão comercial do coworking — CONFERIR com o cliente antes
 * de anunciar em campanha paga.
 */
export const SCHEDULE: DaySchedule[] = [
  { label: 'Domingo', short: 'Dom', open: null, close: null },
  { label: 'Segunda-feira', short: 'Seg', open: '08:00', close: '18:00' },
  { label: 'Terça-feira', short: 'Ter', open: '08:00', close: '18:00' },
  { label: 'Quarta-feira', short: 'Qua', open: '08:00', close: '18:00' },
  { label: 'Quinta-feira', short: 'Qui', open: '08:00', close: '18:00' },
  { label: 'Sexta-feira', short: 'Sex', open: '08:00', close: '18:00' },
  { label: 'Sábado', short: 'Sáb', open: null, close: null },
]

export const SCHEDULE_SUMMARY = [
  { days: 'Segunda a sexta', hours: '8h às 18h' },
  { days: 'Sábado e domingo', hours: 'Fechado' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Evidências — todo número exibido no site aponta para uma destas entradas
// ─────────────────────────────────────────────────────────────────────────────

export type Evidencia = {
  id: string
  valor: string
  legenda: string
  fonte: string
  /** Quando existe, vira link na nota de rodapé da seção. */
  url?: string
}

/**
 * Números que aparecem na tela.
 *
 * Um site de crédito que exibe estatística sem fonte é indistinguível dos que
 * inventam. Cada card do painel lê daqui, e a seção imprime a atribuição
 * embaixo — não como letra miúda, como parte do argumento.
 */
export const EVIDENCIAS: Evidencia[] = [
  {
    id: 'negativados',
    valor: '83,7 mi',
    legenda: 'de brasileiros com o nome negativado',
    fonte: 'Serasa Experian · junho de 2026',
    url: 'https://www.serasa.com.br/limpa-nome-online/blog/mapa-da-inadimplencia-e-renogociacao-de-dividas-no-brasil/',
  },
  {
    id: 'adultos',
    valor: '50,9%',
    legenda: 'da população adulta do país',
    fonte: 'Serasa Experian · junho de 2026',
  },
  {
    id: 'meses',
    valor: '18 meses',
    legenda: 'seguidos de alta, recorde da série histórica',
    fonte: 'Serasa Experian · junho de 2026',
  },
  {
    id: 'faixa',
    valor: '35,7%',
    legenda: 'estão entre 41 e 60 anos, a idade de comprar o primeiro imóvel',
    fonte: 'Serasa Experian · junho de 2026',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Serviços
// ─────────────────────────────────────────────────────────────────────────────

export type Service = {
  id: string
  name: string
  /** Nome curto, para o menu e para os espaços em que o nome inteiro não cabe. */
  curto?: string
  /** Frase curta que abre o card. */
  resumo: string
  description: string
  /** O que a pessoa recebe, em itens verificáveis. */
  entrega: string[]
  /**
   * Os três serviços que a empresa de fato executa — limpa nome, rating e
   * Bacen. São eles que abrem a página e que ocupam o menu do topo: quem
   * chega precisa saber o que se faz aqui antes de rolar qualquer coisa.
   */
  nucleo?: boolean
  destaque?: boolean
  tag?: string
  /** A página que explica o assunto por inteiro, linkada do cartão. */
  guia?: { href: string; rotulo: string }
}

/**
 * ── A via é judicial, e isso muda tudo o que está escrito aqui ──────────────
 *
 * A retirada do nome negativado não acontece por negociação com o credor.
 * Acontece por ação judicial com pedido de **tutela antecipada** — a liminar.
 * Tutela antecipada é o resultado antes da sentença: em vez de esperar o fim
 * do processo para o efeito valer, pede-se que ele valha desde já.
 *
 * Dos três serviços, **dois correm por processo judicial** — o limpa nome e a
 * exclusão de Bacen — e **um é operacional**: o destravamento do rating de
 * crédito bancário. A distinção não é detalhe de bastidor: ela muda o que se
 * pode dizer sobre prazo e sobre quem decide, e por isso aparece no texto de
 * cada cartão em vez de ficar só aqui.
 *
 * Três consequências para o texto deste arquivo, e nenhuma é estilística:
 *
 * · **Quem decide é o juiz.** Nenhum texto pode afirmar que a restrição sai —
 *   só que é isso que se pede, e como se pede.
 * · **A dívida não desaparece.** O que se discute é o registro; o débito segue
 *   existindo e segue sendo discutido no processo.
 * · **O fundamento é o CDC.** O pedido se apoia nos artigos 42 e 43 do Código
 *   de Defesa do Consumidor, e é com base neles que o juiz defere em favor do
 *   consumidor inadimplente, arquivando e congelando os débitos discutidos.
 *   Citar o fundamento é o que separa explicar de prometer.
 */
export const SERVICES: Service[] = [
  {
    id: 'limpa-nome',
    name: 'Limpa nome',
    curto: 'Limpa nome',
    resumo: 'Não é quitação: é um pedido ao juiz.',
    description:
      'É realizado por ação judicial, com pedido de liminar fundamentado nos artigos ' +
      '42 e 43 do Código de Defesa do Consumidor. Após o deferimento, o juiz expede ' +
      'ordem aos órgãos de proteção ao crédito para baixarem, ou seja, arquivarem, os ' +
      'débitos apontados no CPF ou no CNPJ. A dívida não é quitada nem apagada, e quem ' +
      'decide é o juiz.',
    entrega: [
      'Leitura do caso antes de qualquer processo existir',
      'Ação com pedido de liminar, fundamentada nos artigos 42 e 43 do CDC',
      'O número do processo e cada movimentação na sua mão',
      'Conferência da baixa na consulta depois da decisão',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via judicial',
    guia: { href: '/limpar-nome', rotulo: 'Os três caminhos para limpar o nome' },
  },
  {
    id: 'rating',
    name: 'Destravamento do rating de crédito bancário',
    curto: 'Rating de crédito bancário',
    resumo: 'O índice que o banco usa e que ninguém te mostra.',
    description:
      'Diferente do limpa nome e do Bacen, o destravamento do rating é feito de forma ' +
      'operacional: o sistema financeiro e bancário é atualizado com o máximo de informações ' +
      'específicas do cliente. Assim se resgata, ou se constrói, um novo perfil financeiro, ' +
      'e as chances de aprovação de financiamentos aumentam significativamente. É o que falta ' +
      'a quem já limpou o nome, tem score alto e ainda assim tem o crédito negado.',
    entrega: [
      'Leitura do relacionamento com cada instituição',
      'O que trava o seu rating de crédito bancário, banco a banco',
      'Ordem em que mexer nas contas e nos limites',
      'O que evitar nos meses que antecedem um pedido de crédito',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via operacional',
    guia: { href: '/rating', rotulo: 'Score e rating: a diferença' },
  },
  {
    id: 'bacen',
    name: 'Exclusão de Bacen',
    curto: 'Exclusão de Bacen',
    resumo: 'O registro que o Serasa não mostra e o banco lê.',
    description:
      'Assim como o limpa nome, a exclusão de registros no Bacen, o Banco Central, é realizada ' +
      'por ação judicial, com pedido de liminar. O Bacen mantém o SCR, onde as instituições ' +
      'registram as operações de crédito e o que está em atraso: esse registro não aparece na ' +
      'consulta do Serasa, mas é lido em toda análise de crédito. Quem decide é o juiz.',
    entrega: [
      'Leitura do Registrato, operação por operação',
      'Identificação do que está registrado sem lastro',
      'Ação com pedido de liminar, pela mesma via do limpa nome',
      'Conferência do Registrato depois da decisão',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via judicial',
    guia: { href: '/bacen', rotulo: 'Como ler o seu Registrato' },
  },
  {
    id: 'diagnostico',
    name: 'Diagnóstico de crédito',
    resumo: 'A consulta que responde por que o crédito foi negado.',
    description:
      'A leitura do que as instituições enxergam quando digitam seu CPF: ' +
      'negativações, protestos, Cadastro Positivo e o que consta no Banco Central.',
    entrega: [
      'Mapa de todas as pendências, uma a uma',
      'O que está pesando de fato no seu score',
      'O que aparece no Banco Central e não aparece no Serasa',
      'Um plano em ordem de prioridade, não uma lista de dívidas',
    ],
    tag: 'Começa aqui',
  },
  {
    id: 'imobiliario',
    name: 'Preparação para financiamento',
    resumo: 'Chegar no banco com a análise já resolvida.',
    description:
      'Proposta reprovada queima tempo e deixa registro. Aqui a ordem se inverte: ' +
      'primeiro o CPF, a renda e a entrada; o pedido entra depois.',
    entrega: [
      'Simulação de capacidade real de pagamento',
      'Uso de FGTS e composição de renda',
      'Correção do que reprovaria a análise',
      'Encaminhamento com corretor credenciado',
    ],
    tag: 'Ponte para o imóvel',
  },
  {
    id: 'pj',
    name: 'CNPJ e MEI',
    resumo: 'Empresa com restrição não levanta capital de giro.',
    description:
      'A mesma leitura aplicada à empresa: restrição no CNPJ, protesto, rating de ' +
      'crédito bancário e o efeito do CPF do sócio na análise.',
    entrega: [
      'Diagnóstico do CNPJ e do CPF dos sócios',
      'Ação para retirada de protesto e negativação',
      'Preparação para capital de giro',
    ],
  },
]

/** Os três que abrem a página e ocupam o menu do topo. */
export const SERVICOS_NUCLEO = SERVICES.filter((s) => s.nucleo)

// ─────────────────────────────────────────────────────────────────────────────
// Método — as quatro etapas do atendimento
// ─────────────────────────────────────────────────────────────────────────────

export type Etapa = {
  numero: string
  titulo: string
  texto: string
  /** Uma coisa concreta que a pessoa recebe ao fim desta etapa. */
  saida: string
}

export const METODO: Etapa[] = [
  {
    numero: '01',
    titulo: 'Conversa e consulta',
    texto:
      'Pelo WhatsApp, algumas perguntas sobre o seu caso e só o número do CPF ou do CNPJ, ' +
      'sem foto de documento. A consulta detalhada puxa Serasa, SPC, Boa Vista e cartórios ' +
      'num relatório só e volta no mesmo dia.',
    saida: 'O que consta nos quatro cadastros, no mesmo dia',
  },
  {
    numero: '02',
    titulo: 'Análise da consulta',
    texto:
      'Funciona como num consultório: você chega com os sintomas, e o diagnóstico vem ' +
      'depois do exame. Negativação, rating de crédito bancário e registro no Banco ' +
      'Central são três problemas diferentes, e cada um tem caminho próprio. Tratar ' +
      'tudo como "nome sujo" é o que faz alguém tomar o remédio errado.',
    saida: 'Qual dos três caminhos é o do seu caso',
  },
  {
    numero: '03',
    titulo: 'Proposta e contrato',
    texto:
      'Valor é o último assunto, e só depois da análise: o tamanho do problema, a solução e ' +
      'o investimento, por escrito. Em geral, metade na assinatura e metade na entrega, ou à ' +
      'vista com desconto. Os documentos entram só agora, para o contrato, que você lê antes ' +
      'e assina pelo gov.br, de graça, ou no escritório com hora marcada.',
    saida: 'O contrato com prazo, valor e o que não está coberto',
  },
  {
    numero: '04',
    titulo: 'Ação judicial (liminar)',
    texto:
      'Não existe negociação aqui. Limpa nome e exclusão de Bacen correm por processo ' +
      'judicial, com pedido de tutela antecipada, a liminar, fundamentada nos artigos ' +
      '42 e 43 do Código de Defesa do Consumidor. Deferida, os débitos discutidos ficam ' +
      'arquivados e congelados. O destravamento do rating de crédito bancário é o único ' +
      'dos três que é operacional, e não judicial.',
    saida: 'O pedido protocolado, com número de processo',
  },
  {
    numero: '05',
    titulo: 'Acompanhamento',
    texto:
      'A decisão não é o fim: a determinação ainda precisa chegar aos órgãos, e o ' +
      'rating de crédito bancário leva alguns ciclos para responder. A gente confere ' +
      'na consulta em vez de presumir que já saiu.',
    saida: 'A consulta conferida, e não presumida',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// O que a Delamayer não faz
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A seção mais importante do site.
 *
 * O mercado de "limpa nome" é o mercado de promessa impossível: prazo fechado,
 * dívida apagada, "blindagem jurídica". Dizer na cara o que NÃO se faz é o
 * único argumento que os concorrentes não conseguem copiar sem se contradizer.
 */
export const NAO_FAZEMOS = [
  {
    titulo: 'Não apagamos dívida legítima',
    texto:
      'A ação trata do registro, não do débito. Dívida que existe continua existindo ' +
      'e continua sendo discutida no processo. Quem promete fazer dívida sumir está ' +
      'vendendo outra coisa.',
  },
  {
    titulo: 'Não aumentamos seu score do Serasa',
    texto:
      'Ninguém aumenta, porque não é possível contratar aumento de score. Quem calcula são ' +
      'Serasa e SPC, e o que pesa é o seu histórico de pagamento: em dia, em atraso ou ' +
      'antecipado. Quem cobra para "subir score" cobra pelo que não controla.',
  },
  {
    titulo: 'Não prometemos a decisão do juiz',
    texto:
      'A liminar é pedida, não comprada. Quem concede é o juiz, no tempo do Judiciário. ' +
      'Dá para explicar como o pedido é feito e o que costuma acontecer; não dá para ' +
      'prometer o resultado nem a data.',
  },
  {
    titulo: 'Não cobramos pelo que é gratuito',
    texto:
      'Consultar o próprio CPF é de graça nos sites oficiais, e a gente mostra onde. ' +
      'O que se cobra é o trabalho: ler aquilo e virar ordem de ação.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Score × Rating — a comparação que é o coração do site
// ─────────────────────────────────────────────────────────────────────────────

export type LinhaComparativa = { criterio: string; score: string; rating: string }

export const SCORE_VS_RATING: LinhaComparativa[] = [
  {
    criterio: 'Quem calcula',
    score: 'Serasa e SPC',
    rating: 'Cada banco, com critério próprio',
  },
  { criterio: 'Escala', score: '0 a 1.000 pontos', rating: 'Letras, de A a F' },
  {
    criterio: 'Você consegue ver',
    score: 'Sim, de graça, a qualquer momento',
    rating: 'Não. É interno do banco',
  },
  { criterio: 'Vale para', score: 'As grandes varejistas', rating: 'Só aquela instituição' },
  {
    criterio: 'O que mais pesa',
    score: 'Histórico de pagamento e consultas ao CPF',
    rating: 'O relacionamento que você tem com aquele banco',
  },
  {
    criterio: 'Quando muda',
    score: 'Mês a mês, e na hora quando você quita pelo Pix',
    rating: 'Em ciclos de revisão da instituição',
  },
]

/** As seis letras do rating de crédito bancário, do melhor ao pior risco. Alimenta o medidor. */
export const RATING_ESCALA = [
  { letra: 'A', rotulo: 'Risco mínimo', nota: 'Crédito aprovado com a melhor taxa da mesa' },
  { letra: 'B', rotulo: 'Risco baixo', nota: 'Aprovado, taxa boa, limite folgado' },
  { letra: 'C', rotulo: 'Risco moderado', nota: 'Aprovado com taxa média e limite curto' },
  { letra: 'D', rotulo: 'Risco elevado', nota: 'Análise caso a caso, quase sempre com garantia' },
  { letra: 'E', rotulo: 'Risco alto', nota: 'Recusa na maioria dos produtos' },
  { letra: 'F', rotulo: 'Risco máximo', nota: 'Relacionamento suspenso' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Na mídia
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A matéria em TV aberta.
 *
 * Os quatro últimos campos existem para o `VideoObject` do JSON-LD: sem
 * `uploadDate`, `duration` e `thumbnailUrl` o Google descarta o nó inteiro, e
 * com eles a página fica elegível a aparecer na busca com a miniatura do vídeo
 * ao lado — que num resultado de texto é a diferença mais barata de clique que
 * existe.
 *
 * Todos vieram do próprio YouTube (oEmbed e metadados da página), e não de
 * estimativa: a data é a de publicação, e a duração, os 195 segundos que o
 * player informa.
 */
export const MIDIA = {
  veiculo: 'TV Serra Dourada · SBT Goiás',
  titulo: 'A diferença entre o score e o rating de crédito bancário',
  tituloOriginal: 'SBT & Delamayer: A Diferença entre o SCORE e o RATING de Crédito Bancário',
  chamada:
    'A explicação que virou pauta de TV aberta: por que o crédito é negado mesmo ' +
    'com score alto, e onde procurar a trava.',
  url: 'https://www.youtube.com/watch?v=lF44FdFNcn4',
  youtubeId: 'lF44FdFNcn4',
  /** ISO 8601, como o schema.org espera. */
  publicadoEm: '2026-04-03',
  /** Duração em formato de período ISO 8601 — 195 segundos. */
  duracao: 'PT3M15S',
  miniatura: 'https://i.ytimg.com/vi/lF44FdFNcn4/maxresdefault.jpg',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Perguntas frequentes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * As páginas que mostram perguntas.
 *
 * `home`, `rating` e `imovel` já existiam. `consulta`, `limpar` e `bacen` são
 * as páginas de /nome-sujo, /limpar-nome e /bacen, que nasceram da pesquisa
 * de palavras-chave do Google (setembro de 2026): "como saber se o nome está
 * sujo", "como limpar o nome" e "como limpar o nome no Banco Central" são,
 * nessa ordem, as três perguntas mais buscadas do assunto, e nenhuma página
 * do site as respondia com as palavras de quem busca.
 */
type PaginaDePerguntas = 'home' | 'rating' | 'imovel' | 'consulta' | 'limpar' | 'bacen'

/**
 * `tema` decide em que página a pergunta aparece, e `tambem` a repete em
 * outras. É o que decide, também, em que página o FAQPage do JSON-LD pode
 * declará-la: marcar FAQ numa rota que não mostra aquela pergunta é violação
 * explícita das diretrizes de dados estruturados.
 *
 * `geral` aparece na home. As perguntas das páginas novas usam o texto exato
 * das buscas ("Como saber se meu nome está sujo?"), porque é essa frase que
 * o buscador e os assistentes de IA procuram casar com uma resposta.
 */
export type FaqItem = {
  id: string
  tema: 'geral' | 'rating' | 'imovel' | 'consulta' | 'limpar' | 'bacen'
  tambem?: PaginaDePerguntas[]
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    id: 'como-funciona',
    tema: 'geral',
    tambem: ['limpar'],
    q: 'Como funciona a retirada do nome negativado?',
    a: 'Por ação judicial, não por negociação com o credor. Abre-se o processo com pedido de tutela antecipada, que é o nome técnico da liminar. Tutela antecipada significa receber o resultado antes da sentença: em vez de esperar o fim do processo para o efeito valer, pede-se que ele valha desde já. O pedido se apoia nos artigos 42 e 43 do Código de Defesa do Consumidor, e é com base neles que o juiz defere em favor do consumidor inadimplente, arquivando e congelando os débitos discutidos. Quem concede ou nega a liminar é o juiz. Vale o mesmo para a exclusão de Bacen. Já o destravamento do rating de crédito bancário é processo operacional, e não judicial.',
  },
  {
    id: 'apaga-divida',
    tema: 'geral',
    tambem: ['limpar'],
    q: 'Vocês apagam a dívida do meu nome?',
    a: 'Não. O que se discute é o registro da negativação, não o débito em si: a dívida continua existindo e continua sendo tratada dentro do processo. O que se pede ao juiz é a tutela antecipada. Concedida, a restrição sai enquanto a ação ainda corre. Quem promete fazer dívida desaparecer está prometendo o que a lei não permite.',
  },
  {
    id: 'aumenta-score',
    tema: 'rating',
    q: 'Vocês aumentam o meu score do Serasa?',
    a: 'Não, e ninguém aumenta: não existe contratar aumento de score. Quem calcula são Serasa e SPC, e o que mais pesa ali é o seu histórico de pagamento: contas em dia, em atraso ou antecipadas. O que se resolve aqui é outra coisa: a restrição registrada no seu nome, o rating de crédito bancário e o registro no Banco Central. Aliás, score alto com crédito negado é justamente o caso mais comum no atendimento.',
  },
  {
    id: 'bacen',
    tema: 'geral',
    tambem: ['bacen'],
    q: 'O que é a exclusão de Bacen?',
    a: 'O Banco Central mantém o SCR, o Sistema de Informações de Crédito, onde as instituições registram as operações e o que está em atraso. Esse registro não aparece na consulta do Serasa, mas é lido por qualquer banco na análise, e explica boa parte das recusas de quem está com o nome limpo. Você mesmo pode ver o seu, de graça, no Registrato. A exclusão de Bacen trata desse registro e, como o limpa nome, corre pela via judicial, com pedido de liminar.',
  },
  {
    id: 'aumentar-score',
    tema: 'rating',
    q: 'Como eu faço para aumentar o meu score?',
    a: 'Pagando as contas em dia, e com tempo. O score responde ao seu histórico de pagamento: em dia, em atraso ou antecipado. Não existe atalho contratado, e quem vende "aumento de score" está cobrando por algo que não controla. Mas vale a parte que quase ninguém ouve: aprovação de financiamento não depende da sua pontuação no Serasa. O gerente olha primeiro se o nome está limpo, e depois o seu rating de crédito bancário, que é outro indicador e tem outro dono.',
  },
  {
    id: 'score-vs-rating',
    tema: 'rating',
    q: 'Meu score subiu, mas o banco negou o crédito. Como isso é possível?',
    a: 'Porque são dois indicadores diferentes, com donos diferentes. O score é calculado por Serasa e SPC e é o que as grandes varejistas olham; o rating de crédito bancário é interno do banco, vai de A a F e mede o relacionamento que você tem com aquela instituição específica. Dá para ter 800 pontos no Serasa e um F no banco onde você pediu o financiamento, e é o rating de crédito bancário que decide ali.',
  },
  {
    id: 'prazo',
    tema: 'geral',
    tambem: ['limpar'],
    q: 'Quanto tempo leva para o meu nome ficar limpo?',
    a: 'Depende do caso e do Judiciário. O pedido de liminar é apreciado pelo juiz, e o tempo dessa apreciação não é nosso. Depois da decisão, a baixa ainda percorre os ciclos de atualização dos órgãos de proteção ao crédito e do Banco Central. O contrato traz o prazo estimado, que no limpa nome é de 15 a 60 dias úteis, e diz o que acontece se ele passar. A exclusão de Bacen é mais demorada, estimada entre três e seis meses. É estimativa, nunca promessa de data fechada.',
  },
  {
    id: 'presencial',
    tema: 'geral',
    q: 'Preciso ir até o escritório?',
    a: 'Não. Todo o atendimento acontece por WhatsApp, do diagnóstico ao acompanhamento, e o contrato pode ser assinado pelo gov.br. O escritório fica no Stay Coworking, no Setor Oeste, no prédio amarelo ao lado do Celsinho Bar, e recebe quem prefere assinar e conversar pessoalmente, mas somente com hora marcada, combinada antes pelo WhatsApp.',
  },
  {
    id: 'documentos',
    tema: 'geral',
    q: 'Preciso mandar foto de documento?',
    a: 'No começo, não. Para a consulta basta o número do CPF ou do CNPJ. Documento com foto e comprovante de endereço com CEP só entram na hora do contrato, e só se você decidir contratar.',
  },
  {
    id: 'pagamento',
    tema: 'geral',
    q: 'Como é o pagamento?',
    a: 'O valor sai depois da análise, por escrito, antes de você pagar qualquer coisa pelo serviço. Em geral é metade na assinatura do contrato e metade na entrega, ou à vista com desconto. O contrato registra o valor, as parcelas e o prazo.',
  },
  {
    id: 'financiar-negativado',
    tema: 'imovel',
    q: 'Consigo financiar um imóvel com o nome negativado?',
    a: 'Com restrição ativa, a análise de crédito do banco reprova na entrada. Tirar a restrição do caminho é o primeiro passo, mas não é aprovação automática: o banco também olha renda comprovável, comprometimento e o rating de crédito bancário. A preparação para financiamento existe justamente para você chegar ao banco com essas três coisas resolvidas.',
  },
  {
    id: 'cnpj',
    tema: 'geral',
    q: 'Atendem CNPJ e MEI?',
    a: 'Sim. Empresa com restrição não levanta capital de giro, e a análise costuma puxar também o CPF dos sócios. O diagnóstico cobre os dois lados.',
  },
  {
    id: 'dados',
    tema: 'geral',
    q: 'O que acontece com os meus dados?',
    a: 'Ficam entre você e a Delamayer, usados só para entrar em contato e atender o seu caso, conforme a LGPD. Nada é vendido nem cedido para publicidade. O que você preenche no formulário é salvo campo a campo, para a conversa não se perder se você parar no meio, e o registro de navegação é guardado por até 90 dias. Você pode pedir a exclusão quando quiser, e ela é feita.',
  },

  // ── /nome-sujo ──────────────────────────────────────────────────────────
  {
    id: 'como-saber-nome-sujo',
    tema: 'consulta',
    q: 'Como saber se meu nome está sujo?',
    a: 'Consultando o CPF nos três cadastros de inadimplentes, que são o Serasa, o SPC Brasil e a Boa Vista, e na pesquisa nacional de protestos dos cartórios. As quatro consultas são gratuitas. Para ver o que os bancos enxergam, consulte também o Registrato do Banco Central, com a sua conta gov.br. Se preferir um lugar só, mande o CPF pelo WhatsApp da Delamayer: a consulta detalhada dos quatro sai no mesmo dia.',
  },
  {
    id: 'consulta-gratis',
    tema: 'consulta',
    q: 'Dá para consultar o CPF de graça?',
    a: 'Dá. Serasa, SPC Brasil, Boa Vista, a pesquisa de protesto e o Registrato do Banco Central deixam você consultar o próprio CPF sem pagar nada. Desconfie de quem cobra só para dizer se o seu nome está sujo.',
  },
  {
    id: 'quanto-tempo-sujo',
    tema: 'consulta',
    tambem: ['limpar'],
    q: 'Quanto tempo o nome fica sujo?',
    a: 'No máximo cinco anos em cada registro, contados do vencimento da dívida. É o que dizem o artigo 43 do Código de Defesa do Consumidor e a Súmula 323 do STJ. Passado o prazo, o registro tem que sair do cadastro mesmo sem pagamento. A dívida em si não some junto com ele.',
  },
  {
    id: 'limpo-e-negado',
    tema: 'consulta',
    tambem: ['bacen'],
    q: 'Meu nome está limpo no Serasa. Por que o banco negou o crédito?',
    a: 'Porque o banco não olha só o Serasa. Ele consulta o SCR do Banco Central, onde aparecem atrasos e prejuízos com bancos que não chegam ao Serasa, e o seu rating de crédito bancário, que é interno de cada instituição. Nome limpo é o primeiro filtro da análise, não o único.',
  },
  {
    id: 'consultar-cnpj',
    tema: 'consulta',
    q: 'Como saber se o CNPJ da empresa está sujo?',
    a: 'Pelos mesmos caminhos do CPF: Serasa, SPC e Boa Vista têm consulta de CNPJ, a pesquisa de protesto aceita CNPJ e o Registrato do Banco Central também traz as operações de crédito da empresa. Na análise do crédito da empresa, o banco costuma consultar também o CPF dos sócios, então vale olhar os dois.',
  },

  // ── /limpar-nome ────────────────────────────────────────────────────────
  {
    id: 'limpar-sem-pagar',
    tema: 'limpar',
    q: 'Dá para limpar o nome sem pagar a dívida?',
    a: 'O registro pode sair sem pagamento em dois casos: quando passam os cinco anos do vencimento, e quando o juiz concede a liminar numa ação judicial. Nos dois casos o que sai é a negativação, não a dívida, que continua existindo com o credor. Quem promete fazer a dívida desaparecer está prometendo o que a lei não permite.',
  },
  {
    id: 'limpar-de-graca',
    tema: 'limpar',
    q: 'Como limpar o nome de graça?',
    a: 'Sem custo nenhum, são dois caminhos: esperar o prazo máximo de cinco anos, depois do qual o registro sai sozinho, ou contestar no próprio cadastro uma negativação que não é sua ou de uma dívida já paga. Negociar tem o custo do acordo. A ação judicial com pedido de liminar tem o custo do serviço, combinado antes de começar.',
  },
  {
    id: 'depois-de-pagar',
    tema: 'limpar',
    q: 'Paguei a dívida. Em quanto tempo o meu nome fica limpo?',
    a: 'O credor tem cinco dias úteis, contados do pagamento, para pedir a retirada do registro. É o que diz a Súmula 548 do STJ. Se o prazo passar e o nome continuar sujo, guarde o comprovante e cobre o credor; se não resolver, o Procon e a Justiça são o caminho.',
  },
  {
    id: 'limpar-aumenta-score',
    tema: 'limpar',
    q: 'Limpar o nome aumenta o score?',
    a: 'Ajuda, mas não na hora e não sozinho. O score é calculado por Serasa e SPC a partir do seu histórico de pagamento, e sobe com o tempo, conforme as contas vão sendo pagas em dia. E para financiamento o que mais pesa nem é o score: é o rating de crédito bancário, que é interno de cada banco.',
  },

  // ── /bacen ──────────────────────────────────────────────────────────────
  {
    id: 'limpar-banco-central',
    tema: 'bacen',
    q: 'Como limpar o nome no Banco Central?',
    a: 'Primeiro, veja o que está lá: o Registrato mostra, de graça, tudo o que os bancos informaram sobre você no SCR. Se a informação estiver errada, quem corrige é o banco que a informou, e não o Banco Central. Se estiver certa e travando o seu crédito, o caminho é a exclusão de Bacen, pela via judicial, com pedido de liminar. Quem decide é o juiz.',
  },
  {
    id: 'consultar-registrato',
    tema: 'bacen',
    q: 'Como consultar o Registrato?',
    a: 'No site do Banco Central, entrando com a sua conta gov.br de nível prata ou ouro. O Relatório de Empréstimos e Financiamentos, que é o do SCR, sai na hora e sem custo. No mesmo lugar estão os relatórios de cheques sem fundos e de contas e relacionamentos.',
  },
  {
    id: 'prejuizo-registrato',
    tema: 'bacen',
    q: 'O que significa prejuízo no Registrato?',
    a: 'É a dívida que o banco lançou como perda depois de muito tempo em atraso. Ela continua aparecendo para qualquer banco que consulte o SCR, e é o registro que mais trava novas aprovações, mesmo com o nome limpo no Serasa.',
  },
  {
    id: 'bacen-e-serasa',
    tema: 'bacen',
    q: 'Limpar o nome no Serasa limpa também o Banco Central?',
    a: 'Não. São sistemas diferentes. O Serasa é um cadastro privado de inadimplentes; o SCR é do Banco Central e recebe as informações direto dos bancos. Resolver um não mexe no outro, e é por isso que os dois precisam ser olhados.',
  },
]

/**
 * As perguntas que uma página mostra, e que só ela declara no JSON-LD.
 *
 * A home mostra as de tema `geral`, `rating` e `imovel`: as mesmas que ela
 * sempre mostrou. As das páginas novas ficam nas páginas novas, onde o
 * assunto é o da busca que as trouxe.
 */
export function perguntasDa(pagina: PaginaDePerguntas): FaqItem[] {
  if (pagina === 'home') return FAQ.filter((f) => ['geral', 'rating', 'imovel'].includes(f.tema))
  // As da própria página primeiro: a primeira pergunta é a que a página
  // responde, e ela abre o acordeão.
  return [
    ...FAQ.filter((f) => f.tema === pagina),
    ...FAQ.filter((f) => f.tema !== pagina && f.tambem?.includes(pagina)),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Palavras-chave — usadas no llms.txt e nas metas
// ─────────────────────────────────────────────────────────────────────────────

export const KEYWORDS = [
  // As três perguntas mais buscadas do assunto (Google, set. 2026).
  'como limpar o nome',
  'como saber se o nome está sujo',
  'como limpar o nome no Banco Central',
  'limpar o nome sem pagar',
  'consulta CPF grátis',
  'limpa nome Goiânia',
  'retirar nome do Serasa por liminar',
  'ação judicial para limpar o nome',
  'exclusão de Bacen',
  'destravamento do rating de crédito bancário',
  'rating de crédito bancário',
  'score de crédito',
  'assessoria de crédito Goiânia',
  'consulta de CPF Goiânia',
  'negativado Goiânia',
  'financiamento imobiliário com restrição',
  'Registrato Banco Central',
] as const
