import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import { registrar, registrarConversaoWhatsApp } from '@/lib/analytics'
import { abrirLead, type Bilhete, completarLead } from '@/lib/api'
import { SERVICES } from '@/lib/business'
import {
  completo,
  diagnosticar,
  linkDiagnostico,
  PERGUNTAS,
  type RespostasParciais,
} from '@/lib/diagnostico'
import { anotar, idDoVisitante } from '@/lib/rastro'
import { cn } from '@/lib/utils'
import { ButtonLink } from './Button'

/**
 * O diagnóstico interativo.
 *
 * A ordem é deliberada e foi pedida assim: **nome primeiro, perguntas no meio,
 * contato no fim.** O nome abre porque é o que menos custa responder e é o que
 * transforma um registro anônimo em alguém para chamar de volta; o telefone e
 * o e-mail ficam para o fim porque pedi-los antes de entregar qualquer coisa é
 * a forma mais rápida de perder a pessoa na primeira tela.
 *
 * ── O registro nasce antes de terminar ──────────────────────────────────────
 *
 * Assim que o nome é informado, um registro é aberto no servidor e vai sendo
 * completado a cada resposta. O motivo é direto: muita gente responde o
 * diagnóstico e não chega a clicar no WhatsApp. Antes, essas pessoas
 * desapareciam. Agora cada passo já está guardado, e quem parou na terceira
 * pergunta continua sendo alguém que a Delamayer pode retomar.
 *
 * Isso é dito na tela, ao lado do campo de nome, e está descrito na política
 * de privacidade. O site não faz isso escondido.
 *
 * Nada disso pode travar o fluxo: as chamadas falham em silêncio (ver
 * lib/api.ts) e a interface segue como se o servidor não existisse.
 *
 * Duas decisões de interface que valem o comentário:
 *
 * · **Uma pergunta por tela, e avanço automático ao responder.** Um formulário
 *   com tudo visível parece mais rápido e converte menos: a pessoa vê o
 *   tamanho do compromisso antes de começar.
 *
 * · **A leitura aparece mesmo sem o contato.** O passo de telefone e e-mail
 *   pode ser pulado. Prender o resultado atrás do cadastro seria cobrar pelo
 *   que a página prometeu de graça.
 *
 * A animação de saída de cada passo é o motivo de o `motion` existir no
 * projeto: o passo anterior precisa continuar montado enquanto desliza para
 * fora, e o React já o removeu da árvore quando o índice muda.
 */

const VARIANTES = {
  entra: (direcao: number) => ({ opacity: 0, x: direcao * 40 }),
  centro: { opacity: 1, x: 0 },
  sai: (direcao: number) => ({ opacity: 0, x: direcao * -40 }),
}

const TRANSICAO = { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const }

/** Nome, as cinco perguntas, e o contato. */
const TOTAL = PERGUNTAS.length + 2
const PASSO_CONTATO = PERGUNTAS.length + 1

const CAMPO =
  'w-full rounded-xl border border-edge bg-obsidian px-5 py-4 text-[0.97rem] text-plat-100 ' +
  'placeholder:text-plat-600 transition-colors duration-300 outline-none ' +
  'focus:border-gold-700 focus:ring-1 focus:ring-gold-800'

export function DiagnosticoTool({ className }: { className?: string }) {
  const [passo, setPasso] = useState(0)
  const [direcao, setDirecao] = useState(1)
  const [respostas, setRespostas] = useState<RespostasParciais>({})
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  // O bilhete vive numa ref, e não em estado: ele não muda nada na tela, e
  // guardá-lo em estado provocaria um render a cada resposta sem necessidade.
  const bilhete = useRef<Bilhete | null>(null)

  const terminou = passo >= TOTAL
  const leitura = useMemo(() => (completo(respostas) ? diagnosticar(respostas) : null), [respostas])

  const guardar = (campos: Parameters<typeof completarLead>[1]) => {
    if (!bilhete.current) return
    void completarLead(bilhete.current, campos)
  }

  // O registro abre uma vez só: pelo botão "Continuar" ou quando o nome sai do
  // campo, o que vier primeiro. Quem digita o nome e fecha a aba sem apertar
  // nada também fica registrado, que é o pedido: se a pessoa preencheu, o
  // contato dela tem que estar no painel.
  const abrindo = useRef<Promise<Bilhete | null> | null>(null)
  const garantirRegistro = () => {
    abrindo.current ??= abrirLead('diagnostico', idDoVisitante()).then((b) => {
      bilhete.current = b
      return b
    })
    return abrindo.current
  }
  const guardarAoSair = async (campos: Parameters<typeof completarLead>[1]) => {
    await garantirRegistro()
    guardar(campos)
  }

  const avancar = () => {
    setDirecao(1)
    setPasso((p) => p + 1)
  }

  const confirmarNome = async () => {
    const limpo = nome.trim()
    if (limpo.length < 3) {
      setErro('Escreva seu nome completo para continuar.')
      return
    }
    setErro(null)
    registrar('diagnostico_iniciado')
    anotar('formulario', 'nome-informado')

    // Abre o registro e já o nomeia. Se a API não responder, `bilhete` fica
    // nulo e todo o resto simplesmente não guarda nada — sem travar ninguém.
    await garantirRegistro()
    guardar({ nome: limpo })
    avancar()
  }

  const responder = (id: keyof RespostasParciais, valor: string) => {
    const proximas = { ...respostas, [id]: valor } as RespostasParciais
    setRespostas(proximas)
    guardar({ respostas: proximas as Record<string, string> })
    anotar('formulario', `resposta:${id}`, valor)
    avancar()

    if (passo === PERGUNTAS.length) registrar('diagnostico_concluido')
  }

  const confirmarContato = () => {
    const tel = telefone.replace(/\D/g, '')
    if (tel.length > 0 && tel.length < 10) {
      setErro('O telefone precisa ter DDD e número.')
      return
    }
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) {
      setErro('Confira o e-mail.')
      return
    }
    setErro(null)
    anotar('formulario', 'contato-informado')
    guardar({
      ...(tel ? { telefone: tel } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(leitura ? { cenario: leitura.id } : {}),
      concluido: true,
    })
    avancar()
  }

  const pularContato = () => {
    anotar('formulario', 'contato-pulado')
    guardar({ ...(leitura ? { cenario: leitura.id } : {}), concluido: true })
    avancar()
  }

  const voltar = () => {
    setErro(null)
    setDirecao(-1)
    setPasso((p) => Math.max(0, p - 1))
  }

  const recomecar = () => {
    setDirecao(-1)
    setRespostas({})
    setPasso(0)
  }

  const progresso = Math.min(1, passo / TOTAL)
  const rotulo = terminou
    ? 'Leitura'
    : passo === 0
      ? 'Para começar'
      : passo === PASSO_CONTATO
        ? 'Quase lá'
        : `Pergunta ${passo} de ${PERGUNTAS.length}`

  return (
    <div className={cn('card relative overflow-hidden p-6 md:p-9', className)}>
      {/* Barra de progresso determinada. Ela existe para responder "quanto
          falta" antes que a pessoa precise perguntar: a causa número um de
          abandono num fluxo de passos é não saber o tamanho dele. */}
      <div className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="label-mono">{rotulo}</span>
          {passo > 0 && !terminou ? (
            <button
              type="button"
              onClick={voltar}
              className="text-xs text-plat-500 transition-colors hover:text-gold-200"
            >
              ← Voltar
            </button>
          ) : null}
        </div>

        <div className="h-px w-full bg-edge">
          <div
            className="h-full origin-left bg-linear-to-r from-gold-600 to-gold-200 transition-transform duration-600 ease-[var(--ease-vault)]"
            style={{ transform: `scaleX(${progresso})` }}
            role="progressbar"
            aria-valuenow={Math.round(progresso * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do diagnóstico"
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direcao} initial={false}>
        {terminou && leitura ? (
          <motion.div
            key="resultado"
            custom={direcao}
            variants={VARIANTES}
            initial="entra"
            animate="centro"
            exit="sai"
            transition={TRANSICAO}
          >
            <span className="inline-block rounded-full border border-gold-800/70 bg-gold-900/20 px-3 py-1 font-mono text-[0.6rem] tracking-[0.16em] text-gold-300 uppercase">
              {leitura.etiqueta}
            </span>

            <h3 className="mt-5 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight text-plat-50">
              {leitura.titulo}
            </h3>

            <p className="mt-5 text-[0.97rem] leading-relaxed text-plat-300">{leitura.leitura}</p>

            <div className="mt-7 border-l border-gold-800 pl-5">
              <p className="label-mono mb-2">O primeiro passo</p>
              <p className="text-[0.95rem] leading-relaxed text-plat-300">
                {leitura.primeiroPasso}
              </p>
            </div>

            <p className="label-mono mt-8 mb-3">Frentes que se aplicam ao seu caso</p>
            <ul className="flex flex-wrap gap-2">
              {leitura.servicos.map((id) => {
                const servico = SERVICES.find((s) => s.id === id)
                if (!servico) return null
                return (
                  <li
                    key={id}
                    className="rounded-full border border-edge px-3.5 py-1.5 text-sm text-plat-300"
                  >
                    {servico.name}
                  </li>
                )
              })}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink
                href={linkDiagnostico(
                  respostas as Parameters<typeof linkDiagnostico>[0],
                  leitura,
                  nome.trim(),
                )}
                externo
                rotuloCursor="Falar"
                data-rastro="diagnostico-whatsapp"
                onClick={() => {
                  registrarConversaoWhatsApp('diagnostico')
                  guardar({ enviouWhatsapp: true })
                }}
              >
                Levar isto para o WhatsApp
              </ButtonLink>

              <button
                type="button"
                onClick={recomecar}
                className="text-sm text-plat-500 transition-colors hover:text-gold-200"
              >
                Refazer
              </button>
            </div>

            <p className="mt-7 text-xs leading-relaxed text-plat-600">
              É uma triagem, não uma consulta. Quem confirma o quadro é a leitura do seu CPF.
            </p>
          </motion.div>
        ) : passo === 0 ? (
          <motion.div
            key="nome"
            custom={direcao}
            variants={VARIANTES}
            initial="entra"
            animate="centro"
            exit="sai"
            transition={TRANSICAO}
          >
            <h3 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
              Como é o seu nome completo?
            </h3>
            <p className="mt-3 text-sm text-plat-500">
              É por ele que a gente te chama na conversa.
            </p>

            <form
              className="mt-7"
              onSubmit={(e) => {
                e.preventDefault()
                void confirmarNome()
              }}
            >
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onBlur={() => {
                  if (nome.trim().length >= 3) void guardarAoSair({ nome: nome.trim() })
                }}
                placeholder="Seu nome completo"
                autoComplete="name"
                className={CAMPO}
                aria-label="Nome completo"
              />
              {erro ? <p className="mt-3 text-sm text-gold-300">{erro}</p> : null}

              <button
                type="submit"
                data-rastro="diagnostico-comecar"
                className="mt-5 w-full rounded-xl border border-gold-700 bg-gold-900/30 px-5 py-4 text-[0.97rem] text-gold-100 transition-colors duration-400 hover:border-gold-400 hover:bg-gold-800/40"
              >
                Começar
              </button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-plat-600">
              O que você responder fica guardado com a Delamayer para o atendimento.
            </p>
          </motion.div>
        ) : passo === PASSO_CONTATO ? (
          <motion.div
            key="contato"
            custom={direcao}
            variants={VARIANTES}
            initial="entra"
            animate="centro"
            exit="sai"
            transition={TRANSICAO}
          >
            <h3 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
              Onde a gente te encontra?
            </h3>
            <p className="mt-3 text-sm text-plat-500">
              Serve para retomar a conversa se ela se perder. Você pode pular.
            </p>

            <form
              className="mt-7 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                confirmarContato()
              }}
            >
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                onBlur={() => {
                  if (telefone.replace(/\D/g, '').length >= 10)
                    guardar({ telefone: telefone.replace(/\D/g, '') })
                }}
                placeholder="WhatsApp com DDD"
                autoComplete="tel"
                inputMode="tel"
                className={CAMPO}
                aria-label="Telefone com DDD"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim()))
                    guardar({ email: email.trim() })
                }}
                placeholder="E-mail"
                autoComplete="email"
                inputMode="email"
                className={CAMPO}
                aria-label="E-mail"
              />
              {erro ? <p className="text-sm text-gold-300">{erro}</p> : null}

              <button
                type="submit"
                data-rastro="diagnostico-ver-leitura"
                className="mt-2 w-full rounded-xl border border-gold-700 bg-gold-900/30 px-5 py-4 text-[0.97rem] text-gold-100 transition-colors duration-400 hover:border-gold-400 hover:bg-gold-800/40"
              >
                Ver a minha leitura
              </button>

              <button
                type="button"
                onClick={pularContato}
                className="text-sm text-plat-500 transition-colors hover:text-gold-200"
              >
                Pular e ver a leitura
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key={passo}
            custom={direcao}
            variants={VARIANTES}
            initial="entra"
            animate="centro"
            exit="sai"
            transition={TRANSICAO}
          >
            <fieldset>
              <legend className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
                {PERGUNTAS[passo - 1].titulo}
              </legend>
              <p className="mt-3 text-sm text-plat-500">{PERGUNTAS[passo - 1].motivo}</p>

              <div className="mt-7 grid gap-3">
                {PERGUNTAS[passo - 1].opcoes.map((opcao) => {
                  const selecionada = respostas[PERGUNTAS[passo - 1].id] === opcao.id
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => responder(PERGUNTAS[passo - 1].id, opcao.id)}
                      className={cn(
                        'group flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left text-[0.97rem] transition-[border-color,background-color,color] duration-400',
                        selecionada
                          ? 'border-gold-600 bg-gold-900/25 text-gold-100'
                          : 'border-edge text-plat-200 hover:border-gold-800 hover:bg-white/[0.02]',
                      )}
                    >
                      {opcao.label}
                      <span
                        aria-hidden
                        className="translate-x-0 text-gold-600 transition-transform duration-400 ease-[var(--ease-vault)] group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
