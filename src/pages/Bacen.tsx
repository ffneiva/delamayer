import { Cartoes, ChamadaFinal, LinkDoTexto, Resposta, TituloDeSecao } from '@/components/Guia'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { BUSINESS, perguntasDa } from '@/lib/business'
import { Faq } from '@/sections/Faq'

/**
 * /bacen: "como limpar o nome no Banco Central".
 *
 * Na pesquisa de palavras-chave, é o grupo com menos concorrência e mais
 * ligado a um serviço da casa: "limpar o nome no bacen", "no banco central",
 * "no registrato", com concorrência baixa nos anúncios. É também onde mais
 * gente chega confusa, porque o Banco Central não "negativa" ninguém: ele
 * guarda o SCR, e é o SCR que o banco lê.
 *
 * A página ensina a ler o Registrato sozinho, antes de oferecer qualquer
 * coisa. Quem entendeu o próprio relatório chega à conversa sabendo o que
 * perguntar, e é por isso que a chamada final pede o relatório, e não o CPF.
 */

const PASSOS = [
  {
    t: 'Entre no Registrato',
    d: 'No site do Banco Central, com a sua conta gov.br de nível prata ou ouro. Não tem custo.',
  },
  {
    t: 'Peça o Relatório de Empréstimos e Financiamentos',
    d: 'É o relatório do SCR. Sai na hora, em PDF, com todas as operações de crédito no seu CPF.',
  },
  {
    t: 'Leia operação por operação',
    d: 'Cada linha traz o banco, o tipo de crédito e a situação das parcelas: a vencer, vencidas ou em prejuízo.',
  },
  {
    t: 'Veja também os outros relatórios',
    d: 'No mesmo lugar estão o de cheques sem fundos (CCF) e o de contas e relacionamentos com bancos.',
  },
]

export function Bacen({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Banco Central"
        titulo="O registro que o Serasa"
        complemento="não mostra."
        onNavigate={onNavigate}
      >
        <p>
          O Banco Central não negativa ninguém. Mas mantém o SCR, o Sistema de Informações de
          Créditos, onde os bancos informam cada empréstimo, financiamento e cartão, e o que está em
          atraso. Todo banco consulta o SCR antes de aprovar crédito. É por isso que dá para estar
          com o nome limpo no Serasa e ter o crédito negado.
        </p>
      </PageHero>

      <Resposta pergunta="Como limpar o nome no Banco Central, em resumo">
        <p>
          Primeiro, veja o que está lá: o <strong className="text-plat-50">Registrato</strong>, do
          próprio Banco Central, mostra de graça tudo o que os bancos informaram sobre você no SCR.
          Se a informação estiver <strong className="text-plat-50">errada</strong>, quem corrige é o
          banco que a informou, não o Banco Central. Se estiver{' '}
          <strong className="text-plat-50">certa</strong> e travando o seu crédito, o caminho é a
          exclusão de Bacen: uma ação judicial com pedido de liminar para que o registro deixe de
          constar enquanto o processo corre. Quem decide é o juiz.
        </p>
      </Resposta>

      {/* ── Como consultar ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <TituloDeSecao
            etiqueta="Registrato"
            titulo="Como consultar o seu registro no Banco Central"
          >
            <p>
              O Registrato é o sistema em que o Banco Central mostra a cada pessoa o que as
              instituições informaram sobre ela. É gratuito, é oficial, e é exatamente o que o
              gerente vê quando consulta o seu CPF no SCR.
            </p>
          </TituloDeSecao>

          <Reveal delay={0.1}>
            <ol className="card space-y-6 p-7 md:p-9">
              {PASSOS.map((passo, i) => (
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
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ── O que cada situação significa ────────────────────────────────── */}
      <section className="border-y border-edge bg-vault py-20 md:py-28">
        <div className="container-x">
          <TituloDeSecao
            etiqueta="Como ler"
            titulo="A vencer, vencido e prejuízo: o que cada situação diz ao banco"
          />
          <Cartoes
            itens={[
              {
                titulo: 'A vencer',
                texto:
                  'Parcelas que ainda não venceram. É o crédito em dia, e não pesa contra você.',
              },
              {
                titulo: 'Vencido',
                texto:
                  'Parcelas em atraso. Qualquer banco que consultar o SCR vê o atraso, mesmo que ele não tenha chegado ao Serasa.',
              },
              {
                titulo: 'Prejuízo',
                texto:
                  'A dívida que o banco lançou como perda depois de muito tempo em atraso. É o registro que mais trava crédito: diz a qualquer banco que outro banco desistiu de receber.',
              },
            ]}
          />
        </div>
      </section>

      {/* ── Como um registro sai ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <TituloDeSecao
            etiqueta="Correção e exclusão"
            titulo="Como um registro sai do Banco Central"
          />
          <Cartoes
            itens={[
              {
                titulo: 'Se a informação está errada',
                texto:
                  'Dívida que não é sua, já paga ou com valor errado. Quem informa o SCR é o banco, e é ele que corrige: peça a correção ao banco, depois à ouvidoria dele e, se não resolver, registre reclamação no Banco Central.',
              },
              {
                titulo: 'Se a dívida foi quitada',
                texto:
                  'Com o pagamento, o banco passa a informar a operação como liquidada nos envios seguintes ao SCR. Confira no Registrato algumas semanas depois.',
              },
              {
                titulo: 'Se o registro está certo e trava o crédito',
                marca: 'O que a Delamayer faz',
                texto:
                  'É a exclusão de Bacen. Como no limpa nome, abre-se uma ação com pedido de liminar para que o registro deixe de constar enquanto o processo corre. Quem decide é o juiz.',
              },
            ]}
          />
          <Reveal delay={0.2}>
            <p className="mt-10 max-w-3xl text-sm leading-relaxed text-plat-500">
              Limpar o nome no Serasa não mexe no SCR, e o contrário também vale: são sistemas
              diferentes. Para os cadastros de inadimplentes, veja{' '}
              <LinkDoTexto href="/limpar-nome">como limpar o nome</LinkDoTexto>; para entender a
              nota interna do banco, o{' '}
              <LinkDoTexto href="/rating">rating de crédito bancário</LinkDoTexto>.
            </p>
          </Reveal>
        </div>
      </section>

      <Faq
        itens={perguntasDa('bacen')}
        etiqueta="Dúvidas"
        titulo="Sobre o Banco Central,"
        complemento="em português."
      />

      <ChamadaFinal
        titulo="Mande o seu Registrato"
        texto="Baixe o Relatório de Empréstimos e Financiamentos no Registrato e mande pelo WhatsApp. A leitura sai operação por operação: o que está certo, o que está errado e o que trava o seu crédito."
        mensagem={`Olá! Li a página sobre o Banco Central no site da ${BUSINESS.shortName} e quero a leitura do meu Registrato.`}
        origem="bacen"
        rotulo="Mandar o Registrato"
      />
    </main>
  )
}
