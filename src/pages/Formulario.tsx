import { useRef, useState } from 'react'
import { PageHero } from '@/components/PageHero'
import {
  BOTAO_PRINCIPAL,
  CONTATO_VAZIO,
  type Contato,
  PrimeiroPasso,
} from '@/components/PrimeiroPasso'
import { Reveal } from '@/components/Reveal'
import { registrar, registrarConversaoWhatsApp } from '@/lib/analytics'
import { abrirLead, type Bilhete, completarLead } from '@/lib/api'
import { BUSINESS } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { anotar, idDoVisitante } from '@/lib/rastro'
import { cn } from '@/lib/utils'

/**
 * /formulario — a via curta.
 *
 * O diagnóstico em /diagnostico faz uma triagem de cinco perguntas e devolve
 * uma leitura. Esta página não devolve nada: ela coleta as quatro informações
 * que o atendimento já pede hoje, na primeira mensagem de WhatsApp, e abre a
 * conversa com elas prontas.
 *
 * As perguntas são exatamente as do roteiro que a Delamayer usa:
 *
 *     1) Nome Completo.  2) Limpo?  3) Negativado?  4) O que quer FINANCIAR?
 *
 * Mantê-las idênticas não é falta de imaginação: é o que faz o formulário e o
 * atendimento falarem a mesma língua. Quem recebe a mensagem não precisa
 * traduzir nada, e quem responde não é perguntado duas vezes da mesma coisa.
 *
 * ── Por que "limpo" e "negativado" são duas perguntas ───────────────────────
 *
 * Parecem a mesma pergunta e não são, e a diferença entre elas é metade do
 * trabalho de triagem: dá para estar sem restrição no Serasa e mesmo assim
 * travado por um registro no Banco Central. Quem responde "limpo" e leva um
 * "não" do banco é justamente o caso de rating.
 *
 * Tudo é salvo a cada passo, pelo mesmo motivo do diagnóstico: quem abandona
 * na terceira pergunta continua sendo alguém que a Delamayer pode retomar.
 *
 * ── O contato vem primeiro ──────────────────────────────────────────────────
 *
 * Nome, WhatsApp e e-mail abrem o formulário, e nome e WhatsApp são
 * obrigatórios (ver PrimeiroPasso). Pedido da Delamayer: com o contato no fim,
 * quem desistia no meio ia embora sem deixar como ser chamado de volta.
 */

type Escolha = 'sim' | 'nao' | 'nao-sei'

const SIM_NAO: { id: Escolha; label: string }[] = [
  { id: 'sim', label: 'Sim' },
  { id: 'nao', label: 'Não' },
  { id: 'nao-sei', label: 'Não sei dizer' },
]

const ALVOS = ['Imóvel', 'Carro', 'Moto', 'Capital de giro', 'Outro']

const BOTAO = BOTAO_PRINCIPAL

function Opcoes<T extends string>({
  opcoes,
  valor,
  aoEscolher,
}: {
  opcoes: { id: T; label: string }[]
  valor: T | null
  aoEscolher: (id: T) => void
}) {
  return (
    <div className="mt-6 grid gap-3">
      {opcoes.map((opcao) => (
        <button
          key={opcao.id}
          type="button"
          onClick={() => aoEscolher(opcao.id)}
          className={cn(
            'group flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left text-[0.97rem] transition-[border-color,background-color,color] duration-400',
            valor === opcao.id
              ? 'border-gold-600 bg-gold-900/25 text-gold-100'
              : 'border-edge text-plat-200 hover:border-gold-800 hover:bg-white/[0.02]',
          )}
        >
          {opcao.label}
          <span
            aria-hidden
            className="text-gold-600 transition-transform duration-400 ease-[var(--ease-vault)] group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      ))}
    </div>
  )
}

const RESUMO: Record<Escolha, string> = {
  sim: 'sim',
  nao: 'não',
  'nao-sei': 'não sei dizer',
}

export function Formulario({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [passo, setPasso] = useState(0)
  const [contato, setContato] = useState<Contato>(CONTATO_VAZIO)
  const nome = contato.nome
  const [limpo, setLimpo] = useState<Escolha | null>(null)
  const [negativado, setNegativado] = useState<Escolha | null>(null)
  const [financiar, setFinanciar] = useState<string | null>(null)

  const bilhete = useRef<Bilhete | null>(null)

  const guardar = (campos: Parameters<typeof completarLead>[1]) => {
    if (!bilhete.current) return
    void completarLead(bilhete.current, campos)
  }

  // O registro abre uma vez só: pelo botão "Começar" ou quando o primeiro
  // campo válido perde o foco, o que vier primeiro. Quem digita o nome e fecha a aba sem apertar
  // nada também fica registrado, que é o pedido: se a pessoa preencheu, o
  // contato dela tem que estar no painel.
  const abrindo = useRef<Promise<Bilhete | null> | null>(null)
  const garantirRegistro = () => {
    abrindo.current ??= abrirLead('formulario', idDoVisitante()).then((b) => {
      bilhete.current = b
      return b
    })
    return abrindo.current
  }
  const guardarAoSair = async (campos: Parameters<typeof completarLead>[1]) => {
    await garantirRegistro()
    guardar(campos)
  }

  const confirmarContato = async (c: Contato) => {
    registrar('formulario_iniciado')
    anotar('formulario', 'contato-informado')
    await garantirRegistro()
    guardar({ nome: c.nome, telefone: c.telefone, ...(c.email ? { email: c.email } : {}) })
    setPasso(1)
  }

  // O e-mail não entra: quem atende vai responder no próprio WhatsApp, e a
  // prévia da mensagem tem espaço curto. Ele fica no registro.
  const mensagem = [
    `Olá! Aqui é ${nome.trim()}. Vim pelo site da ${BUSINESS.shortName}.`,
    '',
    `Nome limpo: ${limpo ? RESUMO[limpo] : '—'}`,
    `Negativado: ${negativado ? RESUMO[negativado] : '—'}`,
    `Quero financiar: ${financiar ?? '—'}`,
    '',
    'Podemos conversar?',
  ].join('\n')

  const rotulos = ['Para começar', 'Pergunta 1 de 3', 'Pergunta 2 de 3', 'Pergunta 3 de 3']
  const progresso = Math.min(1, passo / 4)

  return (
    <main id="conteudo">
      <PageHero
        etiqueta="Atendimento"
        titulo="Quatro perguntas."
        complemento="E um consultor te chama."
        onNavigate={onNavigate}
      >
        <p>
          São as mesmas perguntas que o atendimento faria na primeira mensagem. Responder aqui só
          adianta a conversa.
        </p>
      </PageHero>

      <section className="pb-28 md:pb-36">
        <div className="container-x">
          <Reveal className="mx-auto max-w-xl">
            <div className="card p-6 md:p-9">
              <div className="mb-8">
                <p className="label-mono mb-3">{passo < 4 ? rotulos[passo] : 'Pronto'}</p>
                <div className="h-px w-full bg-edge">
                  <div
                    className="h-full origin-left bg-linear-to-r from-gold-600 to-gold-200 transition-transform duration-600 ease-[var(--ease-vault)]"
                    style={{ transform: `scaleX(${progresso})` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progresso * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progresso do formulário"
                  />
                </div>
              </div>

              {passo === 0 ? (
                <PrimeiroPasso
                  valor={contato}
                  aoMudar={setContato}
                  aoSair={(campos) => void guardarAoSair(campos)}
                  aoConfirmar={(c) => void confirmarContato(c)}
                  rastro="formulario-comecar"
                />
              ) : passo === 1 ? (
                <div>
                  <h2 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
                    Seu nome está limpo?
                  </h2>
                  <p className="mt-3 text-sm text-plat-500">
                    Limpo é não ter nenhuma restrição ativa em consulta.
                  </p>
                  <Opcoes
                    opcoes={SIM_NAO}
                    valor={limpo}
                    aoEscolher={(id) => {
                      setLimpo(id)
                      guardar({ limpo: id })
                      anotar('formulario', 'limpo', id)
                      setPasso(2)
                    }}
                  />
                </div>
              ) : passo === 2 ? (
                <div>
                  <h2 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
                    Você está negativado?
                  </h2>
                  <p className="mt-3 text-sm text-plat-500">
                    Negativação é o registro no Serasa, SPC, Quod ou Boa Vista.
                  </p>
                  <Opcoes
                    opcoes={SIM_NAO}
                    valor={negativado}
                    aoEscolher={(id) => {
                      setNegativado(id)
                      guardar({ negativado: id })
                      anotar('formulario', 'negativado', id)
                      setPasso(3)
                    }}
                  />
                </div>
              ) : passo === 3 ? (
                <div>
                  <h2 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
                    O que você quer financiar?
                  </h2>
                  <p className="mt-3 text-sm text-plat-500">
                    O objetivo muda a ordem do que se resolve primeiro.
                  </p>
                  <Opcoes
                    opcoes={ALVOS.map((a) => ({ id: a, label: a }))}
                    valor={financiar}
                    aoEscolher={(id) => {
                      setFinanciar(id)
                      guardar({ financiar: id, concluido: true })
                      anotar('formulario', 'financiar', id)
                      registrar('formulario_concluido')
                      setPasso(4)
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
                    Recebemos, {nome.trim().split(' ')[0]}.
                  </h2>
                  <p className="mt-5 text-[0.97rem] leading-relaxed text-plat-300">
                    Um consultor vai retornar. Se preferir adiantar, abra a conversa no WhatsApp
                    agora: as suas respostas já vão escritas na mensagem.
                  </p>

                  <a
                    href={linkWhatsApp(mensagem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-rastro="formulario-whatsapp"
                    data-cursor="Falar"
                    onClick={() => {
                      registrarConversaoWhatsApp('formulario')
                      guardar({ enviouWhatsapp: true })
                    }}
                    className={`${BOTAO} mt-7 inline-block text-center`}
                  >
                    Abrir no WhatsApp
                  </a>

                  <p className="mt-6 text-xs leading-relaxed text-plat-600">
                    Atendimento de segunda a sexta, das 8h às 18h. Mensagem fora do horário é
                    respondida no próximo dia útil.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
