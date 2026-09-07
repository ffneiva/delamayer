import { BUSINESS } from './business.ts'

/**
 * As rotas do site, com os metadados de cada uma.
 *
 * Este arquivo é importado dos DOIS lados: pelo React em tempo de execução e
 * pelo `vite.config.ts` em tempo de build, que usa a mesma lista para gerar um
 * HTML estático por rota. Por isso ele não toca em `window` nem importa nada
 * de DOM.
 *
 * Por que HTML por rota, e não só trocar o `document.title` no cliente: três
 * das páginas são destino de anúncio e de link colado no Instagram. O robô do
 * Google Ads avalia a página de destino, e o leitor de link do WhatsApp lê só
 * o HTML inicial — nenhum dos dois executa a aplicação antes de decidir o que
 * mostrar.
 */

export type Route = {
  path: string
  /** `<title>` da página. */
  title: string
  description: string
  /** Rótulo curto usado na navegação e na trilha de breadcrumb. */
  label: string
  /** Mantém a página fora do índice do Google (usado só pelo 404). */
  noindex?: boolean
  /**
   * As duas linhas grandes da imagem de compartilhamento.
   *
   * Sem elas a rota herda a imagem da home. Ter uma por rota importa mais do
   * que parece: um link colado no WhatsApp é lido pela imagem antes do texto, e
   * cinco páginas com a mesma arte fazem as cinco parecerem a mesma página.
   */
  ogLinhas?: readonly [string, string]
  /** A linha de apoio da imagem, abaixo do título. */
  ogNota?: string
}

export const ROUTES: Route[] = [
  {
    path: '/',
    label: 'Início',
    title: 'Delamayer · Regularização de nome e rating bancário em Goiânia',
    description:
      'Assessoria de crédito em Goiânia. Diagnóstico do seu CPF na hora, regularização direta com o credor e leitura do rating bancário — o índice que o banco usa e não aparece no score. Fale pelo WhatsApp.',
    ogLinhas: ['Do CPF travado', 'à chave do apartamento.'],
    ogNota: 'Diagnóstico · Regularização direta · Rating bancário',
  },
  {
    path: '/diagnostico',
    label: 'Diagnóstico',
    title: 'Diagnóstico de crédito grátis · Delamayer, Goiânia',
    description:
      'Responda cinco perguntas e descubra onde o seu crédito está travado: negativação, rating bancário ou cadastro desatualizado. O resultado vira uma mensagem pronta no WhatsApp da Delamayer.',
    ogLinhas: ['Cinco perguntas', 'e uma leitura honesta.'],
    ogNota: 'Roda no seu navegador · Sem cadastro · Sem servidor',
  },
  {
    path: '/rating',
    label: 'Score × Rating',
    title: 'Score alto e crédito negado? A diferença entre score e rating bancário',
    description:
      'Score é do birô e vale para o mercado inteiro; rating é interno do banco, vai de A a F e mede só o seu relacionamento com ele. Entenda por que os dois discordam — e o que fazer quando isso trava o seu crédito.',
    ogLinhas: ['Score alto,', 'crédito negado.'],
    ogNota: 'O índice que o banco usa e não aparece em consulta',
  },
  {
    path: '/imovel',
    label: 'Imóvel',
    title: 'Financiamento imobiliário com o nome negativado · Delamayer Goiânia',
    description:
      'Regularizar o CPF é o primeiro passo para financiar um imóvel — não o último. Veja o que o banco analisa além do nome limpo e como chegar à proposta com renda, entrada e rating já resolvidos.',
    ogLinhas: ['Nome limpo é o', 'primeiro passo.'],
    ogNota: 'O que o banco analisa além da restrição',
  },
  {
    path: '/politica-de-privacidade',
    label: 'Privacidade',
    title: 'Política de privacidade · Delamayer Soluções Financeiras',
    description:
      'Como a Delamayer trata dados neste site: o que é coletado, o que nunca sai do seu navegador, quais serviços de terceiros são acionados e como exercer seus direitos pela LGPD.',
  },
]

/**
 * Rota usada quando o endereço não existe.
 *
 * `noindex` é o ponto: sem ele, uma URL errada devolveria a home com status
 * 200 — o *soft 404* que o Google trata como sinal de site mal cuidado.
 */
export const NAO_ENCONTRADA: Route = {
  path: '/404',
  label: 'Não encontrada',
  title: 'Página não encontrada · Delamayer',
  description: 'Este endereço não existe no site da Delamayer Soluções Financeiras.',
  noindex: true,
}

/** Normaliza o pathname (ignora barra final e diferenças de caixa). */
function limpar(pathname: string): string {
  return pathname.replace(/\/+$/, '').toLowerCase() || '/'
}

/** Devolve a rota correspondente, ou a de 404 se o endereço não existir. */
export function routeFor(pathname: string): Route {
  return ROUTES.find((r) => r.path === limpar(pathname)) ?? NAO_ENCONTRADA
}

export function canonicalFor(route: Route): string {
  return route.path === '/' ? `${BUSINESS.url}/` : `${BUSINESS.url}${route.path}`
}

/**
 * Nome do arquivo da imagem de compartilhamento da rota.
 *
 * A home fica em `og.png` porque é o nome que qualquer um procura primeiro; as
 * demais viram `og-<rota>.png`. Rotas sem `ogLinhas` — hoje só a política de
 * privacidade, que ninguém compartilha — caem na arte da home em vez de exigir
 * uma peça que nunca seria vista.
 *
 * É a MESMA função usada pelo gerador de imagens (scripts/make-brand.mjs) e
 * pelo plugin que reescreve o `<head>` de cada rota no build. Dois lugares
 * derivando o nome por conta própria é como uma meta tag acaba apontando para
 * um arquivo que não existe.
 */
export function ogArquivoDe(route: Route): string {
  if (!route.ogLinhas || route.path === '/') return 'og.png'
  return `og-${route.path.replace(/^\//, '')}.png`
}

export function ogUrlDe(route: Route): string {
  return `${BUSINESS.url}/${ogArquivoDe(route)}`
}
