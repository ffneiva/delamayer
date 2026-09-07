import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { registrar, registrarConversaoWhatsApp } from '@/lib/analytics'
import { SERVICES } from '@/lib/business'
import {
  completo,
  diagnosticar,
  linkDiagnostico,
  PERGUNTAS,
  type RespostasParciais,
} from '@/lib/diagnostico'
import { cn } from '@/lib/utils'
import { ButtonLink } from './Button'

/**
 * O diagnóstico interativo.
 *
 * Cinco perguntas, uma leitura, e uma mensagem de WhatsApp com o caso já
 * descrito. A lógica inteira vive em lib/diagnostico.ts e é testada lá; este
 * arquivo cuida só de apresentação e navegação entre passos.
 *
 * Duas decisões de interface que valem o comentário:
 *
 * · **Uma pergunta por tela, e avanço automático ao responder.** Um formulário
 *   com as cinco perguntas visíveis parece mais rápido e converte menos: a
 *   pessoa vê o tamanho do compromisso antes de começar. Uma por vez esconde o
 *   fim e mantém o custo percebido de cada passo em um clique.
 *
 * · **Nada é enviado a lugar nenhum.** O resultado é calculado no navegador e
 *   vira texto de WhatsApp. Não há servidor, não há banco, não há e-mail de
 *   captura — e isso é dito na tela, porque num site sobre dívida a primeira
 *   pergunta silenciosa de quem responde é "onde isso vai parar".
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

export function DiagnosticoTool({ className }: { className?: string }) {
  const [passo, setPasso] = useState(0)
  const [direcao, setDirecao] = useState(1)
  const [respostas, setRespostas] = useState<RespostasParciais>({})

  const total = PERGUNTAS.length
  const terminou = passo >= total
  const leitura = useMemo(() => (completo(respostas) ? diagnosticar(respostas) : null), [respostas])

  const responder = (id: keyof RespostasParciais, valor: string) => {
    if (passo === 0) registrar('diagnostico_iniciado')

    const proximas = { ...respostas, [id]: valor } as RespostasParciais
    setRespostas(proximas)
    setDirecao(1)
    setPasso((p) => p + 1)

    if (passo === total - 1) registrar('diagnostico_concluido')
  }

  const voltar = () => {
    setDirecao(-1)
    setPasso((p) => Math.max(0, p - 1))
  }

  const recomecar = () => {
    setDirecao(-1)
    setRespostas({})
    setPasso(0)
  }

  const progresso = Math.min(1, passo / total)

  return (
    <div className={cn('card relative overflow-hidden p-6 md:p-9', className)}>
      {/* Barra de progresso determinada. Ela existe para responder "quanto
          falta" antes que a pessoa precise perguntar — a causa número um de
          abandono num fluxo de passos é não saber o tamanho dele. */}
      <div className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="label-mono">
            {terminou ? 'Leitura' : `Pergunta ${passo + 1} de ${total}`}
          </span>
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
                href={linkDiagnostico(respostas as Parameters<typeof linkDiagnostico>[0], leitura)}
                externo
                rotuloCursor="Falar"
                onClick={() => registrarConversaoWhatsApp('diagnostico')}
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
                {PERGUNTAS[passo].titulo}
              </legend>
              <p className="mt-3 text-sm text-plat-500">{PERGUNTAS[passo].motivo}</p>

              <div className="mt-7 grid gap-3">
                {PERGUNTAS[passo].opcoes.map((opcao) => {
                  const selecionada = respostas[PERGUNTAS[passo].id] === opcao.id
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => responder(PERGUNTAS[passo].id, opcao.id)}
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

      <p className="mt-8 border-t border-edge pt-5 text-xs text-plat-600">
        Nada do que você responde sai deste navegador.
      </p>
    </div>
  )
}
