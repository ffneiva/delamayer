import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { BUSINESS } from '@/lib/business'

/**
 * Política de privacidade.
 *
 * Escrita em português comum, e não em juridiquês copiado de gerador. Num site
 * que pergunta sobre a dívida de quem o acessa, esta página é lida por gente
 * de verdade — e a maior parte do que ela tem a dizer é surpreendentemente
 * curta, porque o site quase não coleta nada.
 *
 * O conteúdo aqui descreve o comportamento real do código. Se o diagnóstico um
 * dia passar a enviar dados a um servidor, esta página precisa mudar no mesmo
 * commit.
 */
const SECOES = [
  {
    titulo: 'O que este site coleta',
    corpo: [
      'Quase nada. Não há formulário de cadastro, não há login e não existe banco de dados: o site é um conjunto de arquivos estáticos servidos por uma CDN.',
      'O diagnóstico interativo é o único ponto em que você digita alguma coisa — e as respostas nunca saem do seu navegador. Elas são usadas para montar um texto e, se você clicar no botão, esse texto vira uma mensagem de WhatsApp que você mesmo envia. Fechar a aba apaga tudo.',
    ],
  },
  {
    titulo: 'Medição de audiência',
    corpo: [
      'Se estiver configurada, a tag do Google Analytics registra páginas visitadas, origem do acesso e cliques nos botões de WhatsApp, com o endereço IP anonimizado. Serve para saber quais páginas funcionam e de onde vêm as pessoas.',
      'Métricas de desempenho (tempo de carregamento, estabilidade visual) também podem ser enviadas — são números sobre o site, não sobre você.',
    ],
  },
  {
    titulo: 'Serviços de terceiros',
    corpo: [
      'O mapa do Google e o vídeo do YouTube só são carregados depois que você clica para abri-los. Até esse clique, nenhuma requisição sai daqui para eles — foi uma escolha de projeto, não uma exigência legal.',
      'Ao clicar em qualquer botão de WhatsApp, você sai deste site e passa a ser regido pela política de privacidade da Meta.',
      'Monitoramento de erros (Sentry), quando ativo, registra falhas de JavaScript com informações técnicas do navegador. Gravação de tela está desativada de propósito.',
    ],
  },
  {
    titulo: 'Dados do atendimento',
    corpo: [
      `Os dados que você compartilha durante o atendimento — CPF, documentos, informações sobre dívidas — são tratados fora deste site, no WhatsApp e nos sistemas da ${BUSINESS.name}, e usados exclusivamente para prestar o serviço que você contratou.`,
      'Consultas ao seu CPF em birôs de crédito e ao Registrato do Banco Central só são feitas com a sua autorização expressa.',
    ],
  },
  {
    titulo: 'Seus direitos (LGPD)',
    corpo: [
      'A Lei nº 13.709/2018 garante que você possa confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou desatualizados, pedir anonimização ou eliminação, revogar consentimento e ser informado sobre compartilhamentos.',
      `Para exercer qualquer um desses direitos, escreva para o WhatsApp ${BUSINESS.phoneDisplay}. O pedido é respondido no prazo legal.`,
    ],
  },
  {
    titulo: 'Cookies',
    corpo: [
      'Este site não usa cookies próprios. Os únicos que podem existir vêm da tag do Google, quando configurada, e do YouTube, depois que você clica para assistir ao vídeo.',
      'Você pode bloquear cookies nas configurações do navegador sem que nada do site deixe de funcionar.',
    ],
  },
]

export function Privacy({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo">
      <PageHero etiqueta="Privacidade" titulo="Política de privacidade" onNavigate={onNavigate}>
        <p>
          Última atualização: setembro de 2026. Escrita em português comum, porque quem precisa ler
          isto merece entender de primeira.
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
                Responsável pelo tratamento: {BUSINESS.name} — {BUSINESS.address.venue},{' '}
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
