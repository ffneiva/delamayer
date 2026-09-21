import { Cartoes, ChamadaFinal, LinkDoTexto, Resposta, TituloDeSecao } from '@/components/Guia'
import { PageHero } from '@/components/PageHero'
import { BUSINESS, perguntasDa } from '@/lib/business'
import { Faq } from '@/sections/Faq'

/**
 * /nome-sujo: "como saber se o nome está sujo".
 *
 * É, de longe, o grupo de buscas mais volumoso da pesquisa de palavras-chave:
 * dezenas de variações da mesma pergunta ("como saber se meu nome tá sujo",
 * "como ver se o nome está limpo", "como consultar nome sujo"), cada uma na
 * faixa de milhares de buscas por mês. Quem pergunta isso ainda não sabe o
 * tamanho do problema; a página responde com os lugares oficiais e gratuitos,
 * e oferece a consulta detalhada para quem prefere um lugar só.
 *
 * Nenhum desses serviços é da Delamayer, e a página diz isso com todas as
 * letras. Cobrar ou fingir exclusividade sobre consulta gratuita é justamente
 * o tipo de coisa que o site existe para não fazer.
 */
export function NomeSujo({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Consulta do CPF e do CNPJ"
        titulo="Seu nome está sujo?"
        complemento="Dá para ver de graça."
        onNavigate={onNavigate}
      >
        <p>
          Nome sujo é o jeito popular de dizer que existe uma dívida registrada contra o seu CPF num
          cadastro de inadimplentes. Só que não existe um cadastro só: são vários, cada um com a sua
          base, e uma dívida pode aparecer num e não aparecer no outro. A resposta certa vem de
          consultar todos, e todos são gratuitos.
        </p>
      </PageHero>

      <Resposta pergunta="Como saber se o nome está sujo, em resumo">
        <p>
          Consulte o CPF no <strong className="text-plat-50">Serasa</strong>, no{' '}
          <strong className="text-plat-50">SPC Brasil</strong> e na{' '}
          <strong className="text-plat-50">Boa Vista</strong>, que são os cadastros de
          inadimplentes, e na{' '}
          <strong className="text-plat-50">pesquisa nacional de protestos</strong> dos cartórios. As
          quatro consultas são gratuitas. Para ver o que os bancos enxergam, consulte também o{' '}
          <strong className="text-plat-50">Registrato do Banco Central</strong>, com a sua conta
          gov.br. Se aparecer alguma dívida em qualquer um deles, o seu nome está negativado ali.
        </p>
      </Resposta>

      {/* ── Onde consultar ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <TituloDeSecao
            etiqueta="Onde consultar, de graça"
            titulo="Cinco consultas oficiais, e o que cada uma mostra"
          >
            <p>
              Nenhuma delas é da {BUSINESS.shortName}. São os próprios cadastros, e consultar o seu
              CPF em cada um não custa nada.
            </p>
          </TituloDeSecao>
          <Cartoes
            itens={[
              {
                titulo: 'Serasa',
                texto:
                  'O cadastro mais consultado pelo comércio. Mostra as dívidas negativadas pelas empresas que informam ao Serasa e a sua pontuação de score.',
                detalhe: 'No site ou no aplicativo do Serasa, com cadastro pelo CPF.',
              },
              {
                titulo: 'SPC Brasil',
                texto:
                  'O cadastro ligado às lojas e ao comércio das CDLs. Uma dívida de loja pode estar registrada só aqui e não aparecer no Serasa.',
                detalhe: 'No site ou no aplicativo do SPC Brasil, com cadastro pelo CPF.',
              },
              {
                titulo: 'Boa Vista',
                texto:
                  'O terceiro cadastro de inadimplentes, antigo SCPC. Também tem negativações que nem sempre estão nos outros dois.',
                detalhe: 'No site ou no aplicativo da Boa Vista, com cadastro pelo CPF.',
              },
              {
                titulo: 'Protesto em cartório',
                texto:
                  'Boleto, cheque ou nota promissória protestados ficam registrados no cartório, e qualquer banco enxerga. É um registro separado dos cadastros acima.',
                detalhe:
                  'Na pesquisa nacional de protestos dos cartórios, pelo CPF ou CNPJ, sem cadastro.',
              },
              {
                titulo: 'Registrato do Banco Central',
                largo: true,
                texto: (
                  <>
                    Não é cadastro de inadimplentes, mas é o que os bancos mais leem: todas as suas
                    operações de crédito, e o que está em dia, em atraso ou lançado como prejuízo.{' '}
                    <LinkDoTexto href="/bacen">Como ler o Registrato</LinkDoTexto>.
                  </>
                ),
                detalhe: 'No site do Banco Central, com a conta gov.br de nível prata ou ouro.',
              },
            ]}
          />
        </div>
      </section>

      {/* ── Prazo e o que o banco olha ───────────────────────────────────── */}
      <section className="border-y border-edge bg-vault py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-20">
          <TituloDeSecao etiqueta="Prazo" titulo="Quanto tempo o nome fica sujo">
            <p>
              No máximo cinco anos em cada registro, contados do vencimento da dívida. É o que dizem
              o artigo 43 do Código de Defesa do Consumidor e a Súmula 323 do STJ. Passado esse
              prazo, o registro tem que sair do cadastro, mesmo que a dívida não tenha sido paga.
            </p>
            <p>
              Se a dívida for paga antes, o credor tem cinco dias úteis para pedir a retirada
              (Súmula 548 do STJ). Os outros caminhos estão em{' '}
              <LinkDoTexto href="/limpar-nome">como limpar o nome</LinkDoTexto>.
            </p>
          </TituloDeSecao>

          <TituloDeSecao
            etiqueta="Nome limpo e crédito negado"
            titulo="Quando a consulta diz que está tudo limpo"
          >
            <p>
              Nome limpo nos cadastros não é garantia de crédito aprovado. O banco consulta também o
              SCR do Banco Central, onde aparecem atrasos e prejuízos com bancos que não chegam ao
              Serasa, e o seu <LinkDoTexto href="/rating">rating de crédito bancário</LinkDoTexto>,
              que é interno de cada instituição.
            </p>
            <p>
              Se a consulta veio limpa e o crédito foi negado mesmo assim, o motivo quase sempre
              está num desses dois lugares.
            </p>
          </TituloDeSecao>
        </div>
      </section>

      {/* ── CNPJ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-x">
          <TituloDeSecao etiqueta="Empresa" titulo="E o CNPJ?">
            <p>
              A lógica é a mesma. Serasa, SPC e Boa Vista têm consulta de CNPJ, a pesquisa de
              protesto aceita CNPJ, e o Registrato também traz as operações de crédito da empresa.
              Na análise de crédito da empresa, o banco costuma consultar ainda o CPF dos sócios,
              então vale olhar os dois lados.
            </p>
          </TituloDeSecao>
        </div>
      </section>

      <Faq
        itens={perguntasDa('consulta')}
        etiqueta="Dúvidas"
        titulo="Sobre nome sujo,"
        complemento="na prática."
      />

      <ChamadaFinal
        titulo="Prefere tudo num lugar só?"
        texto="Mande o CPF ou o CNPJ pelo WhatsApp. A consulta detalhada sai no mesmo dia, com o que está registrado em cada cadastro."
        mensagem={`Olá! Vim pela página sobre nome sujo no site da ${BUSINESS.shortName} e quero a consulta detalhada do meu CPF.`}
        origem="nome-sujo"
        rotulo="Consultar o meu CPF"
      />
    </main>
  )
}
