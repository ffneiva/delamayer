import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { BUSINESS } from '@/lib/business'

/**
 * Política de privacidade.
 *
 * Escrita em português comum, e não em juridiquês copiado de gerador. Num site
 * que pergunta sobre a dívida de quem o acessa, esta página é lida por gente
 * de verdade.
 *
 * ── Esta página mudou porque o site mudou ───────────────────────────────────
 *
 * Até setembro de 2026 o site não guardava nada: o diagnóstico rodava no
 * navegador e virava mensagem de WhatsApp. Com a entrada do formulário e do
 * painel de atendimento, passou a haver coleta de verdade — nome, contato,
 * respostas, IP, localização aproximada e o caminho percorrido na página.
 *
 * A regra que essa mudança deixa para quem mexer aqui depois é simples e não
 * admite exceção: **o que está escrito nesta página é o que o código faz.**
 * Uma coleta nova sem a linha correspondente aqui não é um detalhe esquecido,
 * é uma declaração falsa a quem confiou o próprio nome.
 *
 * O prazo de 90 dias era, até aqui, o TTL das tabelas de rastro — o banco
 * apagava sozinho. A pedido do cliente, que quis poder escolher e mudar o
 * período, a limpeza passou a ser feita por ele, pelo painel. O texto abaixo
 * mudou junto, e é por isso que ele diz "por até 90 dias" e "removido
 * periodicamente", e não mais "automaticamente": prometer automático o que
 * depende de alguém lembrar seria a primeira frase falsa desta página.
 */
const SECOES = [
  {
    titulo: 'O que você informa',
    corpo: [
      'No formulário e no diagnóstico: seu nome, o telefone e o e-mail que você escrever, e as respostas que você escolher sobre a sua situação de crédito. Nada além disso é pedido, e nem CPF nem documento são solicitados nesta página.',
      'O registro é salvo a cada resposta, e não só no fim. Isso é deliberado e vale a explicação: se você parar no meio, a Delamayer ainda consegue retomar o contato em vez de perder a conversa. O aviso aparece na própria tela, antes da primeira resposta.',
      'A finalidade é uma só: entrar em contato e atender o seu caso. Estes dados não são vendidos, alugados nem cedidos a terceiros para publicidade.',
    ],
  },
  {
    titulo: 'O que é registrado sobre a sua navegação',
    corpo: [
      'O site registra por onde você passou: páginas e seções vistas, cliques, profundidade de rolagem, quanto tempo ficou, de onde veio, o idioma e o tamanho da tela do aparelho.',
      'Registra também o endereço IP e a localização aproximada que a rede de entrega informa (cidade, estado e país). Essa localização vem da própria infraestrutura do site, não do GPS do seu aparelho, e é aproximada por natureza.',
      'Se você tocar num botão do WhatsApp, esse toque fica registrado com o horário, a página e o caminho até ali. Quando você nos manda a mensagem, esse registro pode ser associado ao seu nome e telefone, para quem atende saber como você chegou.',
      'Para que serve: entender quais explicações funcionam e avaliar o interesse de quem preencheu o formulário antes de ligar. A base legal é o legítimo interesse (art. 7º, IX, da LGPD) para a análise de audiência, e o seu consentimento, dado ao enviar o formulário, para o que está ligado ao seu nome.',
      'Um número aleatório é guardado no seu navegador para costurar os passos de uma mesma visita. Ele não é o seu nome, não identifica você sozinho e não atravessa aparelhos. Limpar os dados do site apaga esse número.',
    ],
  },
  {
    titulo: 'Por quanto tempo isso fica guardado',
    corpo: [
      'O rastro de navegação (IP, localização, cliques e páginas) é guardado por até 90 dias depois do último acesso e removido periodicamente. Você pode pedir a remoção do seu antes disso, a qualquer momento.',
      'Os dados do formulário (nome, contato e respostas) ficam enquanto durar a relação de atendimento, porque são o registro do seu caso. Você pode pedir a exclusão a qualquer momento, e ela é feita.',
    ],
  },
  {
    titulo: 'Medição de audiência',
    corpo: [
      'Se estiver configurada, a tag do Google Analytics registra páginas visitadas, origem do acesso e cliques nos botões de WhatsApp, com o endereço IP anonimizado.',
      'Métricas de desempenho (tempo de carregamento, estabilidade visual) também podem ser enviadas: são números sobre o site, não sobre você.',
    ],
  },
  {
    titulo: 'Serviços de terceiros',
    corpo: [
      'O mapa do Google e o vídeo do YouTube só são carregados depois que você clica para abri-los. Até esse clique, nenhuma requisição sai daqui para eles. Foi uma escolha de projeto, não uma exigência legal.',
      'Ao clicar em qualquer botão de WhatsApp, você sai deste site e passa a ser regido pela política de privacidade da Meta.',
      'Monitoramento de erros (Sentry), quando ativo, registra falhas de JavaScript com informações técnicas do navegador. Gravação de tela está desativada de propósito.',
    ],
  },
  {
    titulo: 'Dados do atendimento',
    corpo: [
      `Os dados que você compartilha durante o atendimento (CPF, documentos, informações sobre dívidas) são tratados fora deste site, no WhatsApp e nos sistemas da ${BUSINESS.name}, e usados exclusivamente para prestar o serviço que você contratou.`,
      'Consultas ao seu CPF em birôs de crédito e ao Registrato do Banco Central só são feitas com a sua autorização expressa.',
    ],
  },
  {
    titulo: 'Seus direitos (LGPD)',
    corpo: [
      'A Lei nº 13.709/2018 garante que você possa confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou desatualizados, pedir anonimização ou eliminação, revogar consentimento e ser informado sobre compartilhamentos.',
      `Para exercer qualquer um desses direitos, escreva para o WhatsApp ${BUSINESS.phoneDisplay}. O pedido é respondido no prazo legal, e a exclusão apaga o registro de verdade, não apenas o esconde.`,
    ],
  },
  {
    titulo: 'Cookies',
    corpo: [
      'Este site não usa cookies próprios. O identificador da visita fica no armazenamento local do navegador, que não é enviado automaticamente a outros sites como um cookie seria. Os cookies que podem existir vêm da tag do Google, quando configurada, e do YouTube, depois que você clica para assistir ao vídeo.',
      'Você pode bloquear cookies nas configurações do navegador sem que nada do site deixe de funcionar.',
    ],
  },
]

export function Privacy({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero etiqueta="Privacidade" titulo="Política de privacidade" onNavigate={onNavigate}>
        <p>
          Última atualização: 19 de setembro de 2026. Escrita em português comum, porque quem
          precisa ler isto merece entender de primeira.
        </p>
      </PageHero>

      <section className="pb-28 md:pb-36">
        <div className="container-x">
          <div className="max-w-3xl">
            {SECOES.map((secao, i) => (
              <Reveal key={secao.titulo} delay={i * 0.05} className="border-t border-edge py-10">
                <h2 className="font-display text-xl text-plat-50 md:text-2xl">{secao.titulo}</h2>
                <div className="mt-5 space-y-4">
                  {secao.corpo.map((paragrafo) => (
                    <p
                      key={paragrafo.slice(0, 40)}
                      className="text-[0.97rem] leading-relaxed text-plat-400"
                    >
                      {paragrafo}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}

            <Reveal className="border-t border-edge pt-10">
              <p className="text-sm leading-relaxed text-plat-500">
                Responsável pelo tratamento: {BUSINESS.name}, {BUSINESS.address.venue},{' '}
                {BUSINESS.address.street}, {BUSINESS.address.district}, {BUSINESS.address.city}/
                {BUSINESS.address.state}, CEP {BUSINESS.address.zip}. Contato:{' '}
                {BUSINESS.phoneDisplay}.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
