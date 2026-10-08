import { Cartoes, ChamadaFinal, LinkDoTexto, Resposta, TituloDeSecao } from '@/components/Guia'
import { PageHero } from '@/components/PageHero'
import { BUSINESS, perguntasDa } from '@/lib/business'
import { Faq } from '@/sections/Faq'

/**
 * /limpar-nome: "como limpar o nome", a busca que dá nome ao serviço.
 *
 * A página mostra os TRÊS caminhos que existem, inclusive os dois que não
 * passam pela Delamayer: pagar ou negociar, e esperar o prazo do registro.
 * Não é generosidade, é o que faz a página ser útil e, por isso, citável:
 * quem busca "como limpar o nome" quer entender as opções, e uma página que
 * só vende a própria acaba ignorada pelo buscador e pelos assistentes de IA,
 * que procuram a resposta completa.
 *
 * As súmulas citadas (323 e 548) e o artigo 43 do CDC são o que sustenta
 * os prazos; nenhum prazo aqui é da empresa.
 */
export function LimparNome({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Limpa nome"
        titulo="Limpar o nome"
        complemento="tem três caminhos."
        onNavigate={onNavigate}
      >
        <p>
          Tirar o nome do Serasa, do SPC e da Boa Vista não tem segredo: dá para pagar ou negociar a
          dívida, esperar o prazo máximo do registro ou discutir o registro na Justiça. Cada caminho
          resolve uma situação diferente. Esta página explica os três, inclusive os dois que não
          passam pela {BUSINESS.shortName}.
        </p>
      </PageHero>

      <Resposta pergunta="Como limpar o nome, em resumo">
        <p>
          Existem três formas de limpar o nome.{' '}
          <strong className="text-plat-50">Pagar ou negociar a dívida</strong>: depois do pagamento,
          o credor tem cinco dias úteis para pedir a retirada do registro.{' '}
          <strong className="text-plat-50">Esperar o prazo</strong>: nenhuma negativação pode durar
          mais de cinco anos, contados do vencimento.{' '}
          <strong className="text-plat-50">Entrar na Justiça</strong>: uma ação com pedido de
          liminar, com base nos artigos 42 e 43 do Código de Defesa do Consumidor, pode tirar o
          registro enquanto o processo corre. Nos três casos, o que sai é a negativação; só o
          pagamento encerra a dívida.
        </p>
      </Resposta>

      {/* ── Os três caminhos ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <TituloDeSecao
            etiqueta="Os caminhos"
            titulo="O que cada caminho resolve, e para quem ele serve"
          />
          <Cartoes
            itens={[
              {
                titulo: 'Pagar ou negociar a dívida',
                texto:
                  'Direto com o credor ou numa plataforma de negociação, como o Serasa Limpa Nome, que costuma oferecer desconto para pagamento à vista ou parcelado. Depois do pagamento, o credor tem cinco dias úteis para pedir a retirada do registro (Súmula 548 do STJ).',
                detalhe:
                  'Para quem consegue pagar, ou parcelar, e quer encerrar a dívida de vez. É o único caminho que acaba com o débito.',
              },
              {
                titulo: 'Esperar o prazo do registro',
                texto:
                  'Nenhuma negativação pode ficar mais de cinco anos no cadastro, contados do vencimento da dívida (artigo 43 do CDC e Súmula 323 do STJ). Passado o prazo, o registro tem que sair mesmo sem pagamento.',
                detalhe:
                  'Para quem está perto do prazo e não precisa de crédito agora. A dívida não some junto com o registro.',
              },
              {
                titulo: 'Discutir o registro na Justiça',
                marca: 'O que a Delamayer faz',
                texto:
                  'Abre-se uma ação com pedido de tutela antecipada, a liminar, com base nos artigos 42 e 43 do Código de Defesa do Consumidor. Se o juiz defere, a negativação sai enquanto o processo corre, e os débitos discutidos ficam arquivados e congelados.',
                detalhe:
                  'Para quem precisa do crédito agora e não consegue quitar tudo antes. Quem decide é o juiz, e a dívida continua existindo com o credor.',
              },
            ]}
          />
        </div>
      </section>

      {/* ── Sem pagar, de graça, score ───────────────────────────────────── */}
      <section className="border-y border-edge bg-vault py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-20">
          <TituloDeSecao etiqueta="A pergunta mais comum" titulo="Dá para limpar o nome sem pagar?">
            <p>
              O registro pode sair sem pagamento em duas situações: quando passam os cinco anos do
              vencimento, e quando o juiz concede a liminar numa ação judicial. Nas duas, o que sai
              é a negativação, não a dívida. Ela continua existindo com o credor.
            </p>
            <p>
              Também sai sem custo a negativação que nunca deveria ter existido: dívida que não é
              sua, que já foi paga ou que foi registrada com valor errado. Essa se contesta no
              próprio cadastro, com o comprovante.
            </p>
            <p>
              Qualquer oferta de fazer a dívida desaparecer está prometendo o que a lei não permite.
            </p>
          </TituloDeSecao>

          <TituloDeSecao etiqueta="Depois de limpar" titulo="Limpar o nome aumenta o score?">
            <p>
              Ajuda, mas não na hora e não sozinho. O score é calculado por Serasa e SPC a partir do
              histórico de pagamento, e sobe com o tempo, conforme as contas vão sendo pagas em dia.
              Ninguém consegue aumentá-lo por contrato.
            </p>
            <p>
              E para financiamento o que mais pesa nem é o score: é o{' '}
              <LinkDoTexto href="/rating">rating de crédito bancário</LinkDoTexto>, a nota interna
              de cada banco. Nome limpo tira o primeiro obstáculo; o rating decide o resto.
            </p>
            <p>
              Existe ainda um registro que o Serasa não mostra e que todo banco lê: o SCR, no{' '}
              <LinkDoTexto href="/bacen">Banco Central</LinkDoTexto>. Limpar o nome no Serasa não
              mexe nele.
            </p>
          </TituloDeSecao>
        </div>
      </section>

      {/* ── Antes de escolher ────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-x">
          <TituloDeSecao
            etiqueta="Antes de escolher"
            titulo="Saiba exatamente o que está registrado"
          >
            <p>
              A escolha do caminho depende do que está no seu nome: quantas negativações, em quais
              cadastros, de quando e de quem. Tudo isso se consulta de graça, e a página{' '}
              <LinkDoTexto href="/nome-sujo">como saber se o nome está sujo</LinkDoTexto> mostra
              onde, cadastro por cadastro.
            </p>
          </TituloDeSecao>
        </div>
      </section>

      <Faq
        itens={perguntasDa('limpar')}
        etiqueta="Dúvidas"
        titulo="Sobre limpar o nome,"
        complemento="sem rodeio."
      />

      <ChamadaFinal
        titulo="Qual caminho serve para o seu caso"
        texto="Mande o CPF pelo WhatsApp. A consulta detalhada mostra o que está registrado, onde e desde quando, e a conversa diz qual dos três caminhos faz sentido, mesmo quando a resposta é negociar ou esperar."
        mensagem={`Olá! Li a página sobre como limpar o nome no site da ${BUSINESS.shortName} e quero saber qual caminho serve para o meu caso.`}
        origem="limpar-nome"
        rotulo="Ver o meu caso"
      />
    </main>
  )
}
