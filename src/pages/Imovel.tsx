import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { BUSINESS, FAQ } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { Faq } from '@/sections/Faq'

/**
 * /imovel — a ponte.
 *
 * Esta página é o que separa a Delamayer de uma assessoria de "limpa nome"
 * qualquer: quem atende também atua como corretor de imóveis, e o destino
 * final da maior parte dos casos é uma aprovação de financiamento. Regularizar
 * é meio; a chave do apartamento é o fim.
 *
 * O tom aqui é deliberadamente contido. É o assunto em que a promessa exagerada
 * causa mais estrago — "financio seu imóvel mesmo negativado" é a frase que
 * derruba a credibilidade de todo o resto do site.
 */
const ANALISE = [
  {
    titulo: 'Restrição ativa',
    texto:
      'Negativação, protesto ou pendência em aberto reprovam a análise antes de qualquer outra coisa ser olhada. É o único item da lista que é eliminatório sozinho.',
  },
  {
    titulo: 'Renda comprovável',
    texto:
      'O banco não financia sobre o quanto você ganha, e sim sobre o quanto você consegue comprovar no formato que ele aceita. Autônomo e MEI costumam perder aqui, não por falta de renda.',
  },
  {
    titulo: 'Comprometimento da renda',
    texto:
      'A parcela precisa caber num teto — em geral em torno de 30% da renda familiar. Outros financiamentos ativos entram nessa conta e reduzem o valor aprovado.',
  },
  {
    titulo: 'Rating interno',
    texto:
      'A mesma nota de A a F que decide cartão e empréstimo decide a taxa do financiamento. Meio ponto de juro num contrato de 30 anos é dezenas de milhares de reais.',
  },
  {
    titulo: 'Entrada e FGTS',
    texto:
      'Quanto maior a entrada, menor o risco percebido — e melhor a taxa. O FGTS pode compor a entrada, amortizar ou pagar parcelas, com regras próprias para cada uso.',
  },
  {
    titulo: 'O imóvel em si',
    texto:
      'A avaliação do banco, a documentação da construtora e a situação da matrícula reprovam propostas com o comprador aprovado. Vale conferir antes de assinar qualquer coisa.',
  },
]

export function Imovel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const perguntas = FAQ.filter((f) => f.tema === 'imovel')

  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Imóvel"
        titulo="Nome limpo é o primeiro passo."
        complemento="Não é o último."
        onNavigate={onNavigate}
      >
        <p>
          Regularizar o CPF tira o obstáculo eliminatório do caminho — e só isso. Depois dele vêm
          renda comprovável, comprometimento, rating e a documentação do imóvel. Chegar ao banco com
          os cinco resolvidos é a diferença entre uma proposta aprovada e uma recusa que fica
          registrada.
        </p>
      </PageHero>

      {/* ── O que o banco olha ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <Reveal>
            <p className="label-mono mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold-700" />
              Seis itens da análise
            </p>
            <h2 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-plat-50">
              O que o banco realmente avalia numa proposta de financiamento
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-edge bg-edge md:grid-cols-2 lg:grid-cols-3">
            {ANALISE.map((item, i) => (
              <Reveal as="li" key={item.titulo} delay={i * 0.06} className="bg-obsidian p-7">
                <p
                  data-numero
                  className="font-mono text-xs tracking-[0.16em] text-gold-600 tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-lg leading-snug text-plat-50">
                  {item.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-plat-400">{item.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── A ordem certa ────────────────────────────────────────────────── */}
      <section className="border-y border-edge bg-vault py-20 md:py-28">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <h2 className="font-display text-[clamp(1.7rem,3.8vw,2.6rem)] leading-tight text-plat-50">
                Por que a ordem importa mais do que a pressa
              </h2>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-plat-400">
                Uma proposta reprovada não é neutra. Ela consome uma consulta ao seu CPF, fica
                registrada na instituição e, dependendo do motivo, cria uma carência informal antes
                de valer a pena tentar de novo. Tentar cedo demais custa a tentativa boa.
              </p>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-plat-400">
                A preparação inverte a sequência: primeiro se resolve o que reprovaria, depois se
                escolhe o banco, e só então a proposta entra. É mais lento no começo e quase sempre
                mais rápido até a assinatura.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="card p-7 md:p-9">
                <p className="label-mono mb-6">Como a Delamayer entra nisso</p>
                <ul className="space-y-6">
                  {[
                    {
                      t: 'Diagnóstico e regularização',
                      d: 'Tira do caminho o item eliminatório e acompanha até a baixa constar.',
                    },
                    {
                      t: 'Leitura do rating',
                      d: 'Mostra em qual instituição a sua análise tende a ir melhor — e por quê.',
                    },
                    {
                      t: 'Simulação de capacidade',
                      d: 'Renda comprovável, uso de FGTS, entrada e a parcela que realmente cabe.',
                    },
                    {
                      t: 'Encaminhamento',
                      d: `Quem atende na ${BUSINESS.shortName} também atua como corretor de imóveis, então a conversa não termina na aprovação — segue até a escolha do imóvel.`,
                    },
                  ].map((passo, i) => (
                    <li key={passo.t} className="flex gap-5">
                      <span
                        data-numero
                        className="gold shrink-0 font-display text-2xl leading-none font-semibold"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="block text-plat-100">{passo.t}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-plat-400">
                          {passo.d}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Faq
        itens={perguntas}
        etiqueta="Dúvidas"
        titulo="Sobre financiamento,"
        complemento="direto."
      />

      <section className="pb-28 md:pb-36">
        <div className="container-x">
          <Reveal>
            <div className="card p-9 text-center md:p-14">
              <h2 className="mx-auto max-w-[24ch] font-display text-[clamp(1.7rem,4vw,2.7rem)] leading-tight text-plat-50">
                Quer saber a que distância você está da aprovação?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-plat-400">
                A conversa começa pela consulta do CPF e pela renda que dá para comprovar. Em uma
                conversa já dá para dizer o que falta — e quanto tempo, mais ou menos, isso leva.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <BotaoWhatsApp
                  href={linkWhatsApp(
                    `Olá! Vim pela página de imóvel do site da ${BUSINESS.shortName}. Quero entender o que falta para eu conseguir financiar.`,
                  )}
                  origem="imovel"
                >
                  Falar sobre financiamento
                </BotaoWhatsApp>

                <ButtonLink href="/diagnostico" variante="contorno" rotuloCursor="Abrir">
                  Fazer o diagnóstico
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
