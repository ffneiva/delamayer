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
    resumo: 'A retirada da negativação sai por decisão judicial.',
    description:
      'Não é negociação de dívida. Abre-se um processo com pedido de tutela ' +
      'antecipada, a liminar, que é o resultado antes da sentença. O pedido se ' +
      'apoia nos artigos 42 e 43 do Código de Defesa do Consumidor: deferido, os ' +
      'débitos discutidos ficam arquivados e congelados. Quem decide é o juiz.',
    entrega: [
      'Leitura do caso antes de qualquer processo existir',
      'Ação com pedido de liminar, fundamentada nos artigos 42 e 43 do CDC',
      'O número do processo e cada movimentação na sua mão',
      'Conferência da baixa na consulta depois da decisão',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via judicial',
  },
  {
    id: 'rating',
    name: 'Destravamento do rating de crédito bancário',
    curto: 'Rating de crédito bancário',
    resumo: 'O índice que o banco usa e que ninguém te mostra.',
    description:
      'O rating de crédito bancário é interno, vai de A a F e cada banco calcula o seu. ' +
      'É por isso que dá para ter score bom e crédito negado. Dos três serviços, é o único ' +
      'operacional: aqui não se abre processo, se trabalha o relacionamento com a instituição.',
    entrega: [
      'Leitura do relacionamento com cada instituição',
      'O que trava o seu rating de crédito bancário, banco a banco',
      'Ordem em que mexer nas contas e nos limites',
      'O que evitar nos meses que antecedem um pedido de crédito',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via operacional',
  },
  {
    id: 'bacen',
    name: 'Exclusão de Bacen',
    curto: 'Exclusão de Bacen',
    resumo: 'O registro que o Serasa não mostra e o banco lê.',
    description:
      'O Banco Central mantém o SCR, onde as instituições registram as operações de crédito ' +
      'e o que está em atraso. Esse registro não aparece na consulta do Serasa, mas é lido em ' +
      'toda análise. Como o limpa nome, corre por processo judicial, com pedido de liminar.',
    entrega: [
      'Leitura do Registrato, operação por operação',
      'Identificação do que está registrado sem lastro',
      'Ação com pedido de liminar, pela mesma via do limpa nome',
      'Conferência do Registrato depois da decisão',
    ],
    nucleo: true,
    destaque: true,
    tag: 'Via judicial',
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
    titulo: 'Consulta detalhada',
    texto:
      'Você manda o CPF ou o CNPJ pelo WhatsApp e a consulta detalhada sai na hora, ' +
      'na conversa, e não numa ficha para alguém retornar depois.',
    saida: 'Tudo o que consta no seu CPF e no seu CNPJ',
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
    numero: '04',
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
      'O Registrato e a consulta ao Serasa são gratuitos, e você mesmo pode tirar. ' +
      'O trabalho é ler aquilo e virar ordem de ação, e é isso que se cobra.',
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

/** `tema` decide em que página a pergunta aparece — e, portanto, em que
 *  página o FAQPage do JSON-LD pode declará-la. Marcar FAQ numa rota que não
 *  mostra aquela pergunta é violação explícita das diretrizes de dados
 *  estruturados, e custa a elegibilidade a resultado rico. */
export type FaqItem = { id: string; tema: 'geral' | 'rating' | 'imovel'; q: string; a: string }

export const FAQ: FaqItem[] = [
  {
    id: 'como-funciona',
    tema: 'geral',
    q: 'Como funciona a retirada do nome negativado?',
    a: 'Por ação judicial, não por negociação com o credor. Abre-se o processo com pedido de tutela antecipada, que é o nome técnico da liminar. Tutela antecipada significa receber o resultado antes da sentença: em vez de esperar o fim do processo para o efeito valer, pede-se que ele valha desde já. O pedido se apoia nos artigos 42 e 43 do Código de Defesa do Consumidor, e é com base neles que o juiz defere em favor do consumidor inadimplente, arquivando e congelando os débitos discutidos. Quem concede ou nega a liminar é o juiz. Vale o mesmo para a exclusão de Bacen. Já o destravamento do rating de crédito bancário é processo operacional, e não judicial.',
  },
  {
    id: 'apaga-divida',
    tema: 'geral',
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
    q: 'Quanto tempo leva para o meu nome ficar limpo?',
    a: 'Depende do caso e do Judiciário. O pedido de liminar é apreciado pelo juiz, e o tempo dessa apreciação não é nosso. Depois da decisão, a baixa ainda percorre os ciclos de atualização dos órgãos de proteção ao crédito e do Banco Central. No diagnóstico você recebe a estimativa do seu caso, nunca uma promessa de data fechada.',
  },
  {
    id: 'consulta-paga',
    tema: 'geral',
    q: 'A consulta é paga?',
    a: 'A consulta inicial é feita na conversa, sem custo. Você manda o CPF pelo WhatsApp e recebe a leitura do que está registrado. O que se contrata depois é a condução do caso, com valor combinado antes de qualquer coisa começar.',
  },
  {
    id: 'presencial',
    tema: 'geral',
    q: 'Preciso ir até o escritório?',
    a: 'Não. Todo o atendimento acontece por WhatsApp, do diagnóstico ao acompanhamento. O escritório fica no Stay Coworking, no Setor Oeste, e recebe quem prefere resolver pessoalmente, mas somente com hora marcada, combinada antes pelo WhatsApp.',
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
    a: 'Ficam entre você e a Delamayer, usados só para entrar em contato e atender o seu caso, conforme a LGPD. Nada é vendido nem cedido para publicidade. O que você responde no formulário é salvo a cada passo, para a conversa não se perder se você parar no meio, e o registro de navegação é apagado automaticamente em 90 dias. Você pode pedir a exclusão quando quiser, e ela é feita.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Palavras-chave — usadas no llms.txt e nas metas
// ─────────────────────────────────────────────────────────────────────────────

export const KEYWORDS = [
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
