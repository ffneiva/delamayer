import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { PageHero } from '@/components/PageHero'
import { RatingDial } from '@/components/RatingDial'
import { Reveal } from '@/components/Reveal'
import { TabelaComparativa } from '@/components/TabelaComparativa'
import { BUSINESS, FAQ, RATING_ESCALA } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { Faq } from '@/sections/Faq'
import { Midia } from '@/sections/Midia'

/**
 * /rating — a página de conteúdo do site.
 *
 * Ela existe por dois motivos que se somam. O de busca: "por que meu crédito
 * foi negado com score alto" é uma pergunta que as pessoas digitam, e nenhum
 * concorrente local a responde — todos respondem "limpamos seu nome". O de
 * venda: quem entende a diferença entre score e rating entende por que uma
 * assessoria faz sentido, e chega à conversa já convencido do problema.
 *
 * O texto é longo de propósito. É a única página do site em que isso é certo:
 * quem chega aqui veio buscar explicação, não oferta.
 */
const CAUSAS = [
  {
    titulo: 'Você é cliente novo naquele banco',
    texto:
      'Rating mede relacionamento, e relacionamento leva tempo. Um cliente sem histórico não é um cliente ruim — é um cliente desconhecido, e a análise trata os dois quase igual.',
  },
  {
    titulo: 'A conta existe, mas está parada',
    texto:
      'Salário que não cai ali, cartão que não roda, nenhuma aplicação. Do ponto de vista do banco, não há dado nenhum sobre o seu comportamento — e o vazio conta contra.',
  },
  {
    titulo: 'Uso do limite perto do teto, todo mês',
    texto:
      'Pagar em dia mantém o score. Mas viver no limite do cheque especial ou do cartão sinaliza aperto de caixa, e é isso que o rating mede: não se você paga, mas com quanta folga.',
  },
  {
    titulo: 'Operação antiga marcada no SCR',
    texto:
      'Uma dívida quitada que o credor não atualizou continua aparecendo no Sistema de Informações de Créditos do Banco Central. Ela não afeta o score do birô, mas o banco a enxerga na análise.',
  },
  {
    titulo: 'Consultas demais ao seu CPF',
    texto:
      'Pedir crédito em cinco lugares na mesma semana produz cinco consultas registradas. Para a análise, isso lê como procura urgente por dinheiro — e urgência é risco.',
  },
  {
    titulo: 'Renda que não se comprova no formato aceito',
    texto:
      'Autônomo com faturamento bom e sem holerite, MEI que não retira pró-labore, renda em conta de terceiro. O dinheiro existe; a comprovação, do jeito que o banco aceita, não.',
  },
]

export function Rating({ onNavigate }: { onNavigate: (path: string) => void }) {
  const perguntas = FAQ.filter((f) => f.tema === 'rating')

  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Score × Rating"
        titulo="Score alto, crédito negado."
        complemento="O que ninguém te explica."
        onNavigate={onNavigate}
      >
        <p>
          Existem dois indicadores medindo você, e eles não conversam. Um é público, vai de 0 a
          1.000 e você consulta de graça. O outro é interno do banco, vai de A a F e não aparece em
          lugar nenhum. Quando os dois discordam, quem decide é o segundo.
        </p>
      </PageHero>

      {/* ── A comparação ─────────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal>
            <TabelaComparativa />
          </Reveal>
        </div>
      </section>

      {/* ── A escala ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <Reveal>
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-plat-50">
                  A escala de A a F, e o que cada letra significa na prática
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-[0.98rem] leading-relaxed text-plat-400">
                  As letras não são padronizadas entre bancos — cada instituição define os próprios
                  cortes. O que se repete é a lógica: quanto mais alta a letra, menor o risco
                  percebido, melhor a taxa e maior o limite. E a passagem de uma letra para outra
                  costuma valer mais, em dinheiro, do que cem pontos de score.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.14}>
              <RatingDial />
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3">
              {RATING_ESCALA.map((faixa) => (
                <li key={faixa.letra} className="bg-obsidian p-6">
                  <p className="gold font-display text-3xl leading-none font-semibold">
                    {faixa.letra}
                  </p>
                  <p className="mt-3 text-sm text-plat-200">{faixa.rotulo}</p>
                  <p className="mt-1.5 text-sm text-plat-500">{faixa.nota}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── As causas ────────────────────────────────────────────────────── */}
      <section className="border-y border-edge bg-vault py-20 md:py-28">
        <div className="container-x">
          <Reveal>
            <p className="label-mono mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold-700" />
              Seis causas comuns
            </p>
            <h2 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-plat-50">
              Por que um rating fica baixo mesmo sem nenhuma dívida
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {CAUSAS.map((causa, i) => (
              <Reveal as="li" key={causa.titulo} delay={i * 0.06}>
                <p
                  data-numero
                  className="font-mono text-xs tracking-[0.16em] text-gold-600 tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-lg leading-snug text-plat-50">
                  {causa.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-plat-400">{causa.texto}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.4}>
            <p className="mt-12 max-w-3xl text-sm leading-relaxed text-plat-500">
              Nenhuma dessas causas se resolve pagando alguma coisa. Todas se resolvem mudando o que
              o banco enxerga — e é aí que a ordem das ações importa mais do que o valor delas.
            </p>
          </Reveal>
        </div>
      </section>

      <Midia />

      <Faq
        itens={perguntas}
        etiqueta="Dúvidas"
        titulo="Sobre rating,"
        complemento="especificamente."
      />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="pb-28 md:pb-36">
        <div className="container-x">
          <Reveal>
            <div className="card p-9 text-center md:p-14">
              <h2 className="mx-auto max-w-[22ch] font-display text-[clamp(1.7rem,4vw,2.7rem)] leading-tight text-plat-50">
                Descobrir qual é o seu caso leva uma conversa
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-plat-400">
                A leitura do Registrato e do seu histórico separa em minutos o que é negativação, o
                que é rating e o que é cadastro desatualizado.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <BotaoWhatsApp
                  href={linkWhatsApp(
                    `Olá! Li a página sobre score e rating no site da ${BUSINESS.shortName}. Meu crédito foi negado e quero entender o motivo.`,
                  )}
                  origem="rating"
                >
                  Falar sobre o meu caso
                </BotaoWhatsApp>

                <ButtonLink href="/diagnostico" variante="contorno" rotuloCursor="Abrir">
                  Fazer o diagnóstico antes
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
