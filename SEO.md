# SEO da Delamayer

Ranquear não depende só de palavra-chave. O Google e os buscadores de IA olham cinco frentes: técnica (o site abre rápido e é legível por robôs), conteúdo (responde de verdade o que a pessoa buscou), entidade (sabem exatamente quem é a empresa e confiam nisso), local (a empresa existe num lugar, com os mesmos dados em todo canto) e autoridade (outros sites e pessoas falam dela). O site cuida das três primeiras; as duas últimas dependem de ações fora dele, no checklist do fim.

Num site de assessoria de crédito vale uma regra a mais: o Google trata finanças como assunto "Your Money or Your Life" e cobra mais confiança. Por isso as regras de conteúdo do `AGENTS.md` (nada de garantia, prazo fechado ou número sem fonte) também são regras de SEO.

## O que está no site

**Conteúdo legível sem JavaScript (pré-render)**
- O build grava o conteúdo de cada rota no próprio HTML (`scripts/prerender.mjs`). Antes, o HTML servido tinha só o `<head>` e um parágrafo: o texto dependia de JavaScript, que o Bing executa só às vezes e os assistentes de IA (ChatGPT, Claude, Perplexity) não executam. Agora a home chega com cerca de 16 mil caracteres de texto e as guias com 7 a 9 mil.
- O navegador hidrata esse mesmo HTML (`main.tsx`), sem redesenhar a página. O que depende do relógio ("Aberto agora", o dia de hoje, o ano) sai neutro no HTML e é preenchido no navegador (`hooks/useRelogio.ts`), para o arquivo publicado nunca afirmar um horário velho.
- Efeito colateral bom: as páginas internas ficaram mais rápidas (no Lighthouse de celular, `/limpar-nome` foi de 76 para 93, com LCP de 5,1 s para 2,9 s).

**Páginas e metadados**
- Uma página por pergunta que as pessoas fazem: `/limpar-nome`, `/nome-sujo`, `/bacen`, `/rating`, `/imovel`, além de `/diagnostico` e `/formulario`.
- Título com até 60 caracteres e description com até 160 em todas as rotas (antes, as descriptions tinham de 180 a 222 e o Google cortava no meio da frase).
- `og:description` e `twitter:description` próprios de cada rota (antes, todas as rotas compartilhavam a description da home no WhatsApp).
- Imagem de compartilhamento própria por rota (`public/og-*.png`), canonical, robots com prévia grande.

**Entidade (dados estruturados JSON-LD, `src/lib/seo.ts`)**
- Um `@graph` por página com `@id` estáveis: o negócio (`/#negocio`, FinancialService com CNPJ, endereço, coordenadas, horário, mapa, Instagram e catálogo de serviços), o site (`/#site`), a página (`#pagina`), a trilha (`#trilha`), as perguntas (`#faq`) e a matéria da TV (`#materia`).

**Para buscadores de IA**
- `llms.txt`: o resumo do negócio e dos limites do serviço.
- `llms-full.txt`: o texto completo de todas as páginas, gerado pelo pré-render a cada build.

**Indexação**
- `sitemap.xml` com data de alteração vinda do git; `robots.txt` liberando todos os robôs e apontando para o sitemap e o `llms.txt`.
- IndexNow: chave em `public/84f9111e2757a4380411b4887e3100df.txt`; o script `_infra-sites/indexnow-delamayer.sh` (fora do repositório) avisa Bing, Yandex e outros depois de cada publicação.

**Validação automática**
- `scripts/validar-seo.mjs` roda no fim de todo `npm run build` e falha o build se uma página tiver mais ou menos de um `<h1>`, description fora de 50 a 160 caracteres, canonical ou og:image faltando, imagem sem `alt`, JSON-LD inválido ou com referência a um `@id` que não existe, ou travessão no texto.

## Como manter

```bash
npm run build                                   # build + pré-render + validação de SEO
# publicar (deploy.yml no push da main)
bash ../_infra-sites/indexnow-delamayer.sh      # depois do deploy, com o site no ar
```

Página nova: entra em `src/lib/routes.ts` (título até 60, description até 160), o conteúdo em `src/lib/business.ts` e, se tiver perguntas, o `FAQPage` em `src/lib/seo.ts`. O pré-render, o sitemap, o `llms.txt` e o `llms-full.txt` acompanham sozinhos.

## O que só vocês podem fazer

Lista viva: marque `[x]` quando fizer. Em ordem de impacto.

### Agora

- [ ] **Search Console: conferir a propriedade e enviar o sitemap.** O arquivo de verificação `google306e90c4318f5ca7.html` já está no ar. No Search Console: **Sitemaps** → `sitemap.xml` → **Enviar**. Depois, em **Inspeção de URL**, pedir indexação da home e das guias (`/limpar-nome`, `/nome-sujo`, `/bacen`, `/rating`, `/imovel`), que agora têm conteúdo no HTML.
- [ ] **Bing Webmaster Tools.** Entrar com a conta Google e **Importar do Google Search Console**. O Bing alimenta o ChatGPT e o Copilot; o IndexNow já avisa ele das mudanças.

### Esta semana

- [ ] **Perfil da Empresa no Google.** É o que mais pesa para "limpa nome Goiânia". Conferir nome exatamente "Delamayer Soluções Financeiras", telefone (62) 99500-6161, site https://delamayer.com.br, endereço do Stay Coworking (Setor Oeste), horário de segunda a sexta das 8h às 18h, categoria e serviços com os mesmos nomes do site. Se aparecer como "Delamayer" em um lugar e com o nome antigo em outro, o Google desconfia.
- [ ] **Mesmos dados em todo lugar (NAP).** Nome, telefone, endereço e site idênticos no Google, Instagram (@delamayersolucoes), Facebook, WhatsApp Business e diretórios (Apontador, Guia Mais, Cylex).

### Sempre

- [ ] **Avaliações no Google.** Pedir a cada cliente atendido uma avaliação com texto, e responder todas. Num assunto de dinheiro, avaliação é a prova de confiança que o Google e as pessoas mais olham.
- [ ] **Autoridade (backlinks).** A matéria da TV Serra Dourada é o melhor exemplo: pedir que a página da matéria tenha link para o site. Entrevistas, parcerias com corretores e imobiliárias de Goiânia e associações comerciais (CDL, ACIEG) contam do mesmo jeito.
- [ ] **Olhar o Search Console uma vez por mês.** O relatório **Desempenho** mostra as buscas que já trazem gente: cada pergunta frequente que aparece ali é candidata a virar seção ou página nova.

### Ideias de páginas novas (precisam de revisão de quem responde pelo conteúdo)

- Limpa nome para empresa (CNPJ negativado), separado do CPF.
- Protesto em cartório: o que é e como sair.
- Prescrição de dívida: o que acontece depois de cinco anos.

Ficaram só como ideia porque são temas jurídicos: o texto precisa ser revisado por quem responde pelos contratos antes de ir ao ar.

### Já feito

- [x] Pré-render do conteúdo de todas as rotas, hidratação sem divergência (22/10/2026).
- [x] Títulos e descriptions no tamanho do Google; descriptions de compartilhamento por rota (22/10/2026).
- [x] `llms-full.txt`, IndexNow e validação de SEO no build (22/10/2026).
