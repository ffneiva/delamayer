# AGENTS.md

Instruções para qualquer agente de IA — de qualquer modelo — que for trabalhar
neste repositório. Também servem para humanos; são as mesmas regras.

> Este arquivo é a fonte. `CLAUDE.md` apenas aponta para cá, para que não
> existam duas versões divergentes da mesma instrução.

---

## 1. O fluxo é Issue → branch → PR → merge

**Nenhuma mudança entra na `main` direto.** Vale para correção de uma linha,
ajuste de texto e atualização de dependência.

```
1. Abra uma Issue descrevendo a tarefa (use os templates em .github/ISSUE_TEMPLATE).
2. Crie um branch a partir da main:  fix/123-titulo-cortado
                                     feat/124-secao-consorcio
                                     content/125-horario-sabado
3. Faça o trabalho. Commits em Conventional Commits (ver seção 2).
4. Abra um PR mencionando a Issue no corpo:  "Closes #123"
5. O CI precisa estar verde. Depois, squash merge.
```

**Por que a Issue vem antes.** O commit registra o que mudou; a Issue registra
por que alguém achou que devia mudar — e é essa a informação que falta seis
meses depois. Sem ela, o `git log` vira uma lista de mudanças sem motivo.

**Sempre mencione a Issue no PR.** `Closes #123` fecha a Issue no merge e
costura os dois lados. Um PR sem Issue vinculada é um PR que ninguém consegue
auditar depois.

### Um PR, um assunto

Se a descrição do PR precisa de um "e também", são dois PRs. A revisão de um PR
que muda três coisas não revisa nenhuma delas.

---

## 2. Commits

[Conventional Commits](https://www.conventionalcommits.org/pt-br/), validados
pelo `commitlint` no gancho `commit-msg` (ver `lefthook.yml`).

```
tipo(escopo): descrição no imperativo, minúscula, sem ponto final
```

**Tipos:** `feat`, `fix`, `content`, `refactor`, `perf`, `style`, `test`,
`docs`, `build`, `ci`, `chore`, `revert`.

**Escopos** (definidos em `commitlint.config.js`): `hero`, `secoes`,
`diagnostico`, `seo`, `marca`, `3d`, `a11y`, `infra`, `ci`, `deps`, `docs`,
`testes`.

```
feat(diagnostico): terceira pergunta aceita "não sei"
fix(a11y): botão do menu ganha nome acessível
content(secoes): horário de sábado conforme o Google Business
perf(3d): poeira de ouro passa de 400 para 160 partículas
```

O corpo do commit é para o **porquê**, nunca para o **o quê** — o diff já diz o
quê.

---

## 3. Onde as coisas moram

```
src/lib/business.ts    ← TODO o conteúdo do site. Texto, preço, horário, FAQ.
src/lib/routes.ts      ← as rotas e seus metadados (title, description)
src/lib/seo.ts         ← JSON-LD e llms.txt, derivados de business.ts
src/lib/diagnostico.ts ← a única lógica de negócio. Testada exaustivamente.
src/lib/mark.ts        ← a geometria do monograma (favicon + SVG + 3D)
src/lib/hours.ts       ← "aberto agora" no fuso de Goiânia
src/components/        ← peças reutilizáveis
src/sections/          ← as seções da home, na ordem em que aparecem
src/pages/             ← as rotas que não são a home
scripts/               ← geração de assets (marca, fontes) e smoke test do dev
tests/unit/            ← Vitest, lógica pura
tests/e2e/             ← Playwright, contra o build de produção
```

**Regra dura:** texto que o visitante lê não fica em componente. Ele fica em
`business.ts`. É de lá que saem, ao mesmo tempo, a página, o JSON-LD que o
Google indexa e o `llms.txt` — e é isso que impede o site de dizer uma coisa na
tela e outra no dado estruturado.

---

## 4. Regras de conteúdo — as que não se negociam

Este é um site de assessoria de crédito. O setor é conhecido por promessa
enganosa, e o posicionamento inteiro da marca depende de não fazer nenhuma.

**Nunca escreva, em nenhum lugar do site:**

- garantia de resultado ("garantimos", "100% de aprovação")
- prazo fechado ("nome limpo em 7 dias", "em até 30 dias")
- promessa de apagar dívida sem pagamento
- "blindagem jurídica" ou equivalente
- estatística sem fonte declarada

O teste `tests/unit/diagnostico.test.ts` bloqueia esses termos na triagem, mas
ele não cobre o texto das seções. **A responsabilidade é de quem escreve.**

**Todo número exibido precisa de fonte.** As estatísticas vivem em
`EVIDENCIAS`, em `business.ts`, cada uma com `fonte` e, quando existe, `url`. A
seção imprime a atribuição na tela — não como letra miúda, como parte do
argumento.

**A seção "O que a gente não faz" não sai do site.** Ela é o diferencial que os
concorrentes não conseguem copiar sem se contradizer.

---

## 5. Movimento e acessibilidade

O site é cheio de animação. Três regras impedem que isso vire um problema:

**1. Estado escondido nunca sobrevive a uma falha.**
Toda animação de entrada parte de um estado invisível apenas quando uma classe
de "armado" está presente (`hero-armed`, por exemplo). Sem ela, o conteúdo
nasce visível. Se o GSAP não carregar, se o `IntersectionObserver` não existir,
se a cena WebGL explodir — o texto continua na tela.

**2. `prefers-reduced-motion` desliga tudo que não é essencial.**
Preloader, cursor personalizado, cena 3D, parallax, rolagem horizontal e
scroll suave: todos consultam a preferência antes de montar. Não é degradação,
é caminho alternativo completo.

**3. Anime `transform` e `opacity`, nada mais.**
Animar `width`, `height`, `top` ou `background-position` força layout ou paint
a cada quadro. Quando a altura precisa animar, use
`grid-template-rows: 0fr → 1fr` (ver `sections/Faq.tsx`).

**Acessibilidade mínima, verificada no CI:** um `<h1>` por página, todo botão
com nome acessível, `aria-expanded`/`aria-controls` em acordeão, foco visível,
região viva anunciando troca de rota.

---

## 6. Desempenho — o orçamento é real

O CI falha se o caminho crítico passar de **170 kB comprimidos**. Antes de
adicionar uma dependência:

- **Ícone:** desenhe o SVG. Uma biblioteca de ícones inteira por causa de um
  glifo é o caso mais comum de bundle inflado neste tipo de projeto.
- **Data/hora:** `Intl` resolve. Nada de `date-fns`, `dayjs` ou `moment`.
- **Animação:** CSS primeiro. GSAP só para o que depende da posição do scroll;
  `motion` só para animação de **saída** (que CSS não faz).
- **Qualquer outra:** justifique no PR, em quilobytes.

**O que é carregado sob demanda, e precisa continuar sendo:**
`three.js` (só desktop, sem movimento reduzido), `gsap` + `ScrollTrigger`,
`lenis`, `web-vitals`, `@sentry/react`, o iframe do mapa e o do vídeo.

---

## 7. Antes de abrir o PR

```bash
npm run lint        # Biome: lint + formatação
npx tsc -b          # tipos
npm run test        # Vitest
npm run knip        # dependências e exports órfãos
npm run check:dev   # o dev server sobe e resolve tudo
npm run build       # build de produção
npm run e2e         # Playwright (precisa do Chromium instalado)
```

O `lefthook` roda lint e tipos no `pre-commit` e os testes no `pre-push`. Para
instalar os ganchos: `npx lefthook install`.

---

## 8. Publicação

O site é um conjunto de arquivos estáticos servidos por uma CDN. **Custo
operacional próximo de zero** é uma restrição do projeto, não uma consequência —
nada que implique servidor, banco de dados ou mensalidade entra aqui.

O `.github/workflows/deploy.yml` publica a cada push na `main`. Ele não contém
nenhum valor: tudo vem de variáveis do repositório. **Nunca comite chave de
acesso, ARN, ID de conta ou nome de bucket** — este repositório é público, e
essas coisas moram fora dele.

## 9. Estilo de código

- **Português** em nomes de variáveis, funções e comentários. O cliente é
  brasileiro e o próximo a mexer nisto também será.
- **Comentário explica o porquê**, nunca o quê. Se o código precisa de
  comentário para dizer o que faz, reescreva o código.
- **Sem `any`.** O Biome recusa.
- **Sem `console.log`.** `console.warn` e `console.error` são permitidos.
- Formatação: aspas simples, sem ponto e vírgula, vírgula final, 100 colunas.
  O Biome cuida — não discuta com ele.
