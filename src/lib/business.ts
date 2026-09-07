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
  promessa: 'Do CPF travado à chave do apartamento',
  description:
    'Assessoria de crédito em Goiânia. Diagnóstico completo do seu CPF, ' +
    'regularização direta com o credor e leitura do rating bancário — o índice ' +
    'que o banco usa e que não aparece no score. Consulta na hora pelo WhatsApp.',

  url: 'https://delamayer.com.br',

  phoneDisplay: '(62) 99500-6161',
  /** E.164 sem símbolos — formato exigido pelo wa.me */
  whatsapp: '5562995006161',

  address: {
    venue: 'Stay Coworking',
    street: 'Rua 22, nº 431 — Qd. H10, Lt. 24',
    district: 'Setor Oeste',
    city: 'Goiânia',
    state: 'GO',
    zip: '74120-130',
    country: 'BR',
  },
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
  { days: 'Segunda a sexta', hours: '8h — 18h' },
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
    legenda: 'seguidos de alta — é recorde da série histórica',
    fonte: 'Serasa Experian · junho de 2026',
  },
  {
    id: 'faixa',
    valor: '35,7%',
    legenda: 'estão entre 41 e 60 anos — a idade de comprar o primeiro imóvel',
    fonte: 'Serasa Experian · junho de 2026',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Serviços
// ─────────────────────────────────────────────────────────────────────────────

export type Service = {
  id: string
  name: string
  /** Frase curta que abre o card. */
  resumo: string
  description: string
  /** O que a pessoa recebe, em itens verificáveis. */
  entrega: string[]
  destaque?: boolean
  tag?: string
}

export const SERVICES: Service[] = [
  {
    id: 'diagnostico',
    name: 'Diagnóstico de crédito',
    resumo: 'A consulta que responde por que o crédito foi negado.',
    description:
      'A leitura do que as instituições enxergam quando digitam seu CPF: ' +
      'negativações, protestos, Cadastro Positivo e o que consta no Banco Central.',
    entrega: [
      'Mapa de todas as pendências, por credor',
      'O que está pesando de fato no seu score',
      'O que aparece no Banco Central e não aparece no Serasa',
      'Um plano em ordem de prioridade, não uma lista de dívidas',
    ],
    destaque: true,
    tag: 'Começa aqui',
  },
  {
    id: 'regularizacao',
    name: 'Regularização direta',
    resumo: 'Negociação com quem tem poder de dar baixa.',
    description:
      'Quem inclui a restrição é o credor — e só ele pode retirá-la. A gente ' +
      'negocia com ele e acompanha até a baixa constar nos órgãos.',
    entrega: [
      'Contato e negociação com o credor',
      'Condição de pagamento avaliada junto com você',
      'Acompanhamento até a baixa aparecer na consulta',
      'Conferência do prazo legal de atualização do cadastro',
    ],
    destaque: true,
    tag: 'Mais procurado',
  },
  {
    id: 'rating',
    name: 'Rating bancário',
    resumo: 'O índice que o banco usa e que ninguém te mostra.',
    description:
      'Score é público e vale para o mercado inteiro. Rating é interno, vai de A a F ' +
      'e cada banco calcula o seu. É por isso que dá para ter score bom e crédito negado.',
    entrega: [
      'Leitura do relacionamento com cada instituição',
      'O que move o rating para cima no seu caso',
      'Ordem em que mexer nas contas e nos limites',
      'O que evitar nos meses que antecedem um pedido de crédito',
    ],
    destaque: true,
    tag: 'O diferencial',
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
    id: 'consorcio',
    name: 'Consórcio e carta de crédito',
    resumo: 'O caminho sem juros para quem tem tempo.',
    description:
      'Para quem tem prazo, o consórcio troca juros por lance — e exige o mesmo ' +
      'cuidado com o cadastro na hora da contemplação.',
    entrega: [
      'Comparação entre consórcio e financiamento no seu caso',
      'O que a administradora analisa na contemplação',
      'Planejamento do lance',
    ],
  },
  {
    id: 'pj',
    name: 'CNPJ e MEI',
    resumo: 'Empresa com restrição não levanta capital de giro.',
    description:
      'A mesma leitura aplicada à empresa: restrição no CNPJ, protesto, rating no ' +
      'banco e o efeito do CPF do sócio na análise.',
    entrega: [
      'Diagnóstico do CNPJ e do CPF dos sócios',
      'Regularização de protesto e negativação',
      'Preparação para capital de giro',
    ],
  },
]

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
    titulo: 'Consulta',
    texto:
      'Você manda o CPF pelo WhatsApp e a consulta sai na hora — na conversa, ' +
      'não numa ficha para alguém retornar depois.',
    saida: 'A lista real do que consta no seu nome',
  },
  {
    numero: '02',
    titulo: 'Leitura',
    texto:
      'Negativação, rating do banco e cadastro desatualizado são três problemas ' +
      'diferentes, e cada um se resolve num lugar. Tratar tudo como "nome sujo" é ' +
      'o que faz a pessoa pagar a dívida errada primeiro.',
    saida: 'O motivo exato do "não" que você ouviu',
  },
  {
    numero: '03',
    titulo: 'Regularização',
    texto:
      'Negociação com quem tem poder de dar baixa, na ordem que destrava mais ' +
      'crédito por real pago. Você aprova cada condição antes do acordo.',
    saida: 'Acordos fechados e comprovantes na sua mão',
  },
  {
    numero: '04',
    titulo: 'Acompanhamento',
    texto:
      'Pagar não é o fim: a baixa precisa chegar aos órgãos e o rating leva alguns ' +
      'ciclos para responder. A gente acompanha até a consulta mostrar o combinado.',
    saida: 'A consulta limpa — conferida, não presumida',
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
      'Dívida que existe, existe. Negocia-se valor, prazo e a baixa — com o credor, ' +
      'que é quem pode. Quem promete apagar sem pagar está vendendo outra coisa.',
  },
  {
    titulo: 'Não damos prazo que não depende de nós',
    texto:
      'Depois do acordo, quem comunica os órgãos é o credor, no prazo dele. Dá para ' +
      'dizer o prazo típico; não dá para garantir "em 7 dias" e cumprir sempre.',
  },
  {
    titulo: 'Não cobramos pelo que é gratuito',
    texto:
      'O Registrato e a consulta ao Serasa são gratuitos, e você mesmo pode tirar. ' +
      'O trabalho é ler aquilo e virar ordem de ação — é isso que se cobra.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Score × Rating — a comparação que é o coração do site
// ─────────────────────────────────────────────────────────────────────────────

export type LinhaComparativa = { criterio: string; score: string; rating: string }

export const SCORE_VS_RATING: LinhaComparativa[] = [
  {
    criterio: 'Quem calcula',
    score: 'Birôs de crédito (Serasa, SPC, Quod, Boa Vista)',
    rating: 'Cada banco, com critério próprio',
  },
  { criterio: 'Escala', score: '0 a 1.000 pontos', rating: 'Letras, de A a F' },
  {
    criterio: 'Você consegue ver',
    score: 'Sim, de graça, a qualquer momento',
    rating: 'Não. É interno do banco',
  },
  { criterio: 'Vale para', score: 'O mercado inteiro', rating: 'Só aquela instituição' },
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

/** As seis letras do rating, do melhor risco ao pior. Alimenta o medidor 3D. */
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
    'com score alto — e onde procurar a trava.',
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
    id: 'apaga-divida',
    tema: 'geral',
    q: 'Vocês apagam a dívida do meu nome?',
    a: 'Não. Dívida legítima não se apaga — se negocia. O que a Delamayer faz é encontrar o credor certo, negociar valor e prazo que caibam no seu orçamento e acompanhar até a baixa da restrição constar nos órgãos de proteção ao crédito. Quem promete apagar sem pagar está prometendo o que a lei não permite.',
  },
  {
    id: 'score-vs-rating',
    tema: 'rating',
    q: 'Meu score subiu, mas o banco negou o crédito. Como isso é possível?',
    a: 'Porque são dois indicadores diferentes. O score é do birô de crédito e vale para o mercado inteiro; o rating é interno do banco, vai de A a F e mede o relacionamento que você tem com aquela instituição específica. Score alto com rating ruim é o caso mais comum de recusa inexplicada — e o mais frequente aqui no atendimento.',
  },
  {
    id: 'prazo',
    tema: 'geral',
    q: 'Quanto tempo leva para o meu nome ficar limpo?',
    a: 'Depende de quantas pendências existem, de quem é o credor e de quanto tempo ele leva para comunicar a baixa. Depois do pagamento, o credor tem prazo legal para atualizar os órgãos, e o registro no Banco Central acompanha os ciclos do SCR. No diagnóstico você recebe o prazo estimado do seu caso — nunca uma promessa de data fechada.',
  },
  {
    id: 'consulta-paga',
    tema: 'geral',
    q: 'A consulta é paga?',
    a: 'A consulta inicial é feita na conversa, sem custo. Você manda o CPF pelo WhatsApp e recebe a leitura do que está registrado. O que se contrata depois é o trabalho de negociação e acompanhamento, com valor combinado antes de qualquer coisa começar.',
  },
  {
    id: 'presencial',
    tema: 'geral',
    q: 'Preciso ir até o escritório?',
    a: 'Não. Todo o atendimento acontece por WhatsApp, do diagnóstico ao acompanhamento. O escritório fica no Stay Coworking, no Setor Oeste, e está aberto para quem prefere resolver pessoalmente.',
  },
  {
    id: 'financiar-negativado',
    tema: 'imovel',
    q: 'Consigo financiar um imóvel com o nome negativado?',
    a: 'Com restrição ativa, a análise de crédito do banco reprova na entrada. Regularizar é o primeiro passo — mas não é garantia automática de aprovação: o banco também olha renda comprovável, comprometimento e o rating interno. A preparação para financiamento existe justamente para você chegar ao banco com essas três coisas resolvidas.',
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
    a: 'Ficam entre você e a Delamayer, usados só para o atendimento que você contratou, conforme a LGPD. Este site não guarda o que você digita: o formulário de diagnóstico monta a mensagem no seu próprio navegador e abre o WhatsApp — nada é enviado para servidor nenhum.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Palavras-chave — usadas no llms.txt e nas metas
// ─────────────────────────────────────────────────────────────────────────────

export const KEYWORDS = [
  'regularização de nome Goiânia',
  'limpar nome Goiânia',
  'assessoria de crédito Goiânia',
  'rating bancário',
  'score de crédito',
  'consulta de CPF',
  'negativado Goiânia',
  'financiamento imobiliário com restrição',
  'Registrato Banco Central',
  'renegociação de dívidas',
] as const
