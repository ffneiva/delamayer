import { BUSINESS, type FAQ, KEYWORDS, MIDIA, perguntasDa, SERVICES } from './business.ts'
import { openingHoursSpec } from './hours.ts'
import { canonicalFor, ROUTES, routeFor } from './routes.ts'

/**
 * JSON-LD para o Google entender que isto é uma assessoria de crédito com
 * endereço físico em Goiânia.
 *
 * `FinancialService` é o tipo mais específico do schema.org para o ramo e
 * herda de LocalBusiness — é ele que alimenta o painel lateral da busca, o
 * "aberto agora" e o botão de rota. Serviço, FAQ e site entram como nós irmãos
 * no mesmo `@graph`, para o Google resolver as referências entre eles.
 *
 * Uma regra atravessa o arquivo: **um nó só é emitido na rota que mostra
 * aquele conteúdo**. Declarar FAQPage numa página sem FAQ é violação explícita
 * das diretrizes de dados estruturados, e o custo não é teórico — é a página
 * perder a elegibilidade a resultado rico.
 */

const ID_NEGOCIO = `${BUSINESS.url}/#negocio`
const ID_SITE = `${BUSINESS.url}/#site`

function faqNode(id: string, itens: typeof FAQ) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: itens.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/**
 * A matéria em TV aberta como `VideoObject`.
 *
 * Só é emitido nas rotas que de fato mostram o player — a home e /rating.
 * Declarar um vídeo numa página que não o contém é a mesma violação de sempre:
 * o dado estruturado tem que descrever o que está na tela.
 *
 * `uploadDate`, `duration` e `thumbnailUrl` não são opcionais na prática: sem
 * os três o Google descarta o nó em silêncio. Com eles, a página fica elegível
 * ao resultado com miniatura de vídeo ao lado.
 *
 * `contentUrl` aponta para a página do YouTube e `embedUrl` para o player sem
 * cookie — que é exatamente o que o site monta quando alguém clica em assistir.
 */
function videoNode(caminho: string) {
  return {
    '@type': 'VideoObject',
    '@id': `${BUSINESS.url}${caminho === '/' ? '' : caminho}#materia`,
    name: MIDIA.tituloOriginal,
    description: MIDIA.chamada,
    thumbnailUrl: [MIDIA.miniatura],
    uploadDate: MIDIA.publicadoEm,
    duration: MIDIA.duracao,
    contentUrl: MIDIA.url,
    embedUrl: `https://www.youtube-nocookie.com/embed/${MIDIA.youtubeId}`,
    inLanguage: 'pt-BR',
    isFamilyFriendly: true,
    publisher: { '@id': ID_NEGOCIO },
    about: { '@type': 'Thing', name: 'Rating de crédito bancário e score de crédito' },
  }
}

function trilha(caminho: string) {
  const rota = routeFor(caminho)
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalFor(rota)}#trilha`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${BUSINESS.url}/` },
      { '@type': 'ListItem', position: 2, name: rota.label, item: canonicalFor(rota) },
    ],
  }
}

function paginaNode(caminho: string, sobre?: string) {
  const rota = routeFor(caminho)
  return {
    '@type': 'WebPage',
    '@id': `${canonicalFor(rota)}#pagina`,
    url: canonicalFor(rota),
    name: rota.title,
    description: rota.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': ID_SITE },
    ...(sobre ? { about: { '@type': 'Thing', name: sobre } } : {}),
  }
}

/**
 * Nós extras de cada rota.
 *
 * A home carrega o perfil do negócio inteiro e as perguntas dela. As filhas
 * ganham trilha de navegação, um `WebPage` próprio e — em /rating e /imovel —
 * apenas as perguntas que aquela página de fato exibe.
 */
function nosDaRota(caminho: string) {
  const rota = routeFor(caminho)

  if (rota.path === '/') {
    return [faqNode(`${BUSINESS.url}/#faq`, perguntasDa('home')), videoNode('/')]
  }

  // As páginas-guia: cada uma declara as perguntas que mostra, e só elas.
  const GUIAS = {
    '/limpar-nome': ['limpar', 'Como limpar o nome no Serasa e no SPC'],
    '/nome-sujo': ['consulta', 'Consulta de CPF e CNPJ negativado'],
    '/bacen': ['bacen', 'SCR e Registrato do Banco Central'],
  } as const
  if (rota.path in GUIAS) {
    const [pagina, sobre] = GUIAS[rota.path as keyof typeof GUIAS]
    return [
      trilha(caminho),
      paginaNode(caminho, sobre),
      faqNode(`${canonicalFor(rota)}#faq`, perguntasDa(pagina)),
    ]
  }

  if (rota.path === '/rating') {
    const perguntas = perguntasDa('rating')
    return [
      trilha(caminho),
      paginaNode(caminho, 'Rating de crédito bancário e score de crédito'),
      faqNode(`${canonicalFor(rota)}#faq`, perguntas),
      videoNode(caminho),
    ]
  }

  if (rota.path === '/imovel') {
    const perguntas = perguntasDa('imovel')
    return [
      trilha(caminho),
      paginaNode(caminho, 'Financiamento imobiliário e análise de crédito'),
      faqNode(`${canonicalFor(rota)}#faq`, perguntas),
    ]
  }

  if (rota.path === '/diagnostico') {
    return [
      trilha(caminho),
      {
        ...paginaNode(caminho, 'Diagnóstico de crédito'),
        // Declara que daqui se inicia um atendimento, e por qual canal.
        potentialAction: {
          '@type': 'CommunicateAction',
          target: `https://wa.me/${BUSINESS.whatsapp}`,
          name: 'Fazer o diagnóstico pelo WhatsApp',
        },
      },
    ]
  }

  return [trilha(caminho), paginaNode(caminho)]
}

export function buildJsonLd(caminho = '/') {
  const negocio = {
    '@type': 'FinancialService',
    '@id': ID_NEGOCIO,
    name: BUSINESS.name,
    legalName: BUSINESS.razaoSocial,
    taxID: BUSINESS.cnpj,
    alternateName: [BUSINESS.shortName, BUSINESS.nomeAnterior],
    description: BUSINESS.description,
    slogan: BUSINESS.tagline,
    url: `${BUSINESS.url}/`,
    telephone: `+55${BUSINESS.whatsapp.slice(2)}`,
    image: `${BUSINESS.url}/og.png`,
    logo: `${BUSINESS.url}/icon-512.png`,
    priceRange: '$$',
    currenciesAccepted: 'BRL',
    areaServed: [
      { '@type': 'City', name: 'Goiânia' },
      { '@type': 'State', name: 'Goiás' },
    ],
    knowsLanguage: 'pt-BR',
    address: {
      '@type': 'PostalAddress',
      name: BUSINESS.address.venue,
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    hasMap: BUSINESS.mapsLink,
    openingHoursSpecification: openingHoursSpec(),
    sameAs: [BUSINESS.instagram],
    // O catálogo descreve o que se oferece, sem preço: os valores dependem do
    // caso e são combinados na consulta. Declarar `price` aqui seria inventar.
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços da Delamayer',
      itemListElement: SERVICES.map((servico) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${BUSINESS.url}/#servico-${servico.id}`,
          name: servico.name,
          description: servico.description,
          serviceType: servico.name,
          provider: { '@id': ID_NEGOCIO },
          areaServed: { '@type': 'City', name: 'Goiânia' },
        },
      })),
    },
  }

  const site = {
    '@type': 'WebSite',
    '@id': ID_SITE,
    url: `${BUSINESS.url}/`,
    name: BUSINESS.name,
    inLanguage: 'pt-BR',
    publisher: { '@id': ID_NEGOCIO },
    keywords: KEYWORDS.join(', '),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [negocio, site, ...nosDaRota(caminho)],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// llms.txt
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O arquivo que descreve o site para modelos de linguagem.
 *
 * A proposta do `llms.txt` é a mesma do `robots.txt`, mas para quem lê em vez
 * de rastrear: um resumo em Markdown, na raiz, com o que importa e onde está.
 * Vale a pena aqui por um motivo concreto — cada vez mais gente pergunta a um
 * assistente "onde limpo meu nome em Goiânia", e o que ele responde depende do
 * que consegue ler sem executar JavaScript.
 *
 * O conteúdo é gerado do mesmo `business.ts` que alimenta a página. Se o
 * telefone mudar, muda aqui junto.
 */
export function buildLlmsTxt(): string {
  const linhas: string[] = [
    `# ${BUSINESS.name}`,
    '',
    `> ${BUSINESS.description}`,
    '',
    `Assessoria de crédito com escritório em ${BUSINESS.address.district}, ${BUSINESS.address.city}/${BUSINESS.address.state}.`,
    `Razão social: ${BUSINESS.razaoSocial}, CNPJ ${BUSINESS.cnpj}.`,
    `Atendimento por WhatsApp: ${BUSINESS.phoneDisplay}. Site: ${BUSINESS.url}`,
    '',
    '## O que a empresa faz',
    '',
  ]

  for (const servico of SERVICES) {
    linhas.push(`- **${servico.name}**: ${servico.resumo} ${servico.description}`)
  }

  linhas.push(
    '',
    '## Como o limpa nome funciona aqui',
    '',
    'Por ação judicial, e não por negociação com o credor. Abre-se um processo com pedido de',
    'tutela antecipada, a liminar. Tutela antecipada é receber o resultado antes da sentença:',
    'em vez de esperar o fim do processo para o efeito valer, pede-se que ele valha desde já.',
    'O pedido se apoia nos artigos 42 e 43 do Código de Defesa do Consumidor, e é com base',
    'neles que o juiz defere em favor do consumidor inadimplente, arquivando e congelando os',
    'débitos discutidos. Quem concede ou nega a liminar é o juiz. A dívida em si não',
    'desaparece: o que se discute é o registro da negativação.',
    '',
    'Dos três serviços, dois correm por processo judicial (o limpa nome e a exclusão de Bacen)',
    'e um é operacional: o destravamento do rating de crédito bancário, em que não se abre',
    'processo, se trabalha o relacionamento com a instituição.',
    '',
    '## O que a empresa NÃO faz',
    '',
    '- Não apaga dívida legítima. O que se discute é o registro da negativação; o débito continua existindo e continua sendo tratado dentro do processo.',
    '- Não aumenta score do Serasa, porque não é possível: quem calcula são Serasa e SPC, e o que pesa ali é o histórico de pagamento: contas em dia, em atraso ou antecipadas. Score e rating de crédito bancário são coisas diferentes.',
    '- Não promete a decisão do juiz nem prazo fechado. A liminar é pedida, não comprada, e depois da decisão a baixa ainda percorre os ciclos de atualização dos órgãos e do Banco Central.',
    '- Não cobra pelo que é gratuito. Consultar o próprio CPF é grátis nos sites oficiais, e os prints servem para a análise; a consulta detalhada da Delamayer custa R$ 20, que pagam os relatórios dos birôs. O serviço é a leitura e a ação sobre eles.',
    '',
    '## Atendimento',
    '',
    `- Por WhatsApp, do diagnóstico ao acompanhamento: ${BUSINESS.phoneDisplay}.`,
    `- Escritório em ${BUSINESS.address.venue}, ${BUSINESS.address.street}, ${BUSINESS.address.district}, ${BUSINESS.address.city}/${BUSINESS.address.state}. ${BUSINESS.agendamento}.`,
    '',
    '## Páginas',
    '',
  )

  for (const rota of ROUTES) {
    linhas.push(`- [${rota.label}](${canonicalFor(rota)}): ${rota.description}`)
  }

  linhas.push(
    '',
    '## Conceito central',
    '',
    'Score e rating de crédito bancário são indicadores diferentes, com donos diferentes. O score',
    'é calculado por Serasa e SPC, vai de 0 a 1.000 e é o que as grandes varejistas olham. O',
    'rating de crédito bancário é interno de cada banco, usa escala de letras (A a F) e mede o',
    'relacionamento do cliente com aquela instituição específica. É possível ter 800 pontos de',
    'score e um F de rating no banco onde se pediu o financiamento, e é essa combinação que',
    'explica a maior parte das recusas consideradas inexplicáveis pelo cliente.',
    '',
    '## Perguntas e respostas',
    '',
    'As perguntas estão escritas como as pessoas as fazem no Google; cada grupo aponta para a',
    'página do site que a responde por inteiro.',
    '',
  )

  const GRUPOS: [string, Parameters<typeof perguntasDa>[0]][] = [
    ['/nome-sujo', 'consulta'],
    ['/limpar-nome', 'limpar'],
    ['/bacen', 'bacen'],
    ['/rating', 'rating'],
    ['/imovel', 'imovel'],
    ['/', 'home'],
  ]
  const ditas = new Set<string>()
  for (const [caminho, pagina] of GRUPOS) {
    const rota = routeFor(caminho)
    const perguntas = perguntasDa(pagina).filter((f) => !ditas.has(f.id))
    if (!perguntas.length) continue
    linhas.push(`### ${rota.label} (${canonicalFor(rota)})`, '')
    for (const f of perguntas) {
      ditas.add(f.id)
      linhas.push(`**${f.q}**`, f.a, '')
    }
  }

  return linhas.join('\n')
}
