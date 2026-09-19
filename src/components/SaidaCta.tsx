import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { anotar } from '@/lib/rastro'

/**
 * O convite que aparece quando a pessoa está indo embora.
 *
 * ── Por que isto não é um pop-up qualquer ───────────────────────────────────
 *
 * O padrão tem má fama merecida: a maioria das implementações interrompe a
 * leitura, volta toda vez e não dá saída óbvia. As regras abaixo existem para
 * evitar exatamente isso, e cada uma custou uma decisão:
 *
 * · **Uma vez por pessoa, e ponto.** Aceitou ou fechou, não aparece mais —
 *   nem nesta visita, nem na próxima. A marca fica no navegador.
 *
 * · **Só depois de a pessoa ter lido alguma coisa.** Antes de 20 segundos ou
 *   de 25% de rolagem, quem move o mouse para fora não está desistindo do
 *   conteúdo: está com a página aberta por engano. Interromper essa pessoa é
 *   ruído puro.
 *
 * · **Nunca em quem já está no formulário.** Oferecer o formulário a quem já
 *   está preenchendo é o tipo de erro que faz o site parecer um robô.
 *
 * · **Desktop apenas, e pelo mouse.** No celular não existe "levar o cursor
 *   para a barra de endereço": os gatilhos equivalentes — rolagem brusca para
 *   cima, botão voltar — disparam em situações legítimas e transformariam o
 *   convite num incômodo. Quem prefere movimento reduzido também não vê.
 *
 * O que ele oferece é o caminho mais curto, e não uma promessa nova: as quatro
 * perguntas do atendimento. Quem aceita vai para /formulario.
 */

const CHAVE = 'dlm.saida'
const SEGUNDOS_MINIMOS = 20
const ROLAGEM_MINIMA = 0.25

function jaViu(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    // Sem armazenamento, o convite não aparece. É o lado seguro do erro:
    // melhor deixar de mostrar uma vez do que mostrar a cada navegação.
    return true
  }
}

function marcar() {
  try {
    localStorage.setItem(CHAVE, '1')
  } catch {
    /* idem */
  }
}

export function SaidaCta({ rota }: { rota: string }) {
  const [aberto, setAberto] = useState(false)
  const desktop = useIsDesktop()
  const reduzido = useReducedMotion()

  // Em quem já está preenchendo alguma coisa, o convite não existe.
  const emFormulario = rota === '/formulario' || rota === '/diagnostico'
  const elegivel = desktop && !reduzido && !emFormulario

  useEffect(() => {
    if (!elegivel || jaViu()) return

    const nasceu = Date.now()
    let rolou = false

    const aoRolar = () => {
      const altura = document.documentElement.scrollHeight - window.innerHeight
      if (altura > 0 && window.scrollY / altura >= ROLAGEM_MINIMA) rolou = true
    }

    const aoSair = (evento: MouseEvent) => {
      // `clientY <= 0` é o cursor cruzando a borda SUPERIOR, que é para onde
      // se vai fechar a aba ou trocar de endereço. Sair pelos lados ou por
      // baixo é outra coisa, e não significa nada.
      if (evento.clientY > 0) return
      if (Date.now() - nasceu < SEGUNDOS_MINIMOS * 1000 && !rolou) return

      marcar()
      setAberto(true)
      anotar('formulario', 'convite-de-saida')
      document.removeEventListener('mouseout', aoSair)
    }

    window.addEventListener('scroll', aoRolar, { passive: true })
    document.addEventListener('mouseout', aoSair)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      document.removeEventListener('mouseout', aoSair)
    }
  }, [elegivel])

  // Escape fecha, como em qualquer diálogo.
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-obsidian/80 px-5 backdrop-blur-sm"
          onClick={() => setAberto(false)}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="card relative w-full max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-saida"
          >
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-edge text-plat-400 transition-colors hover:border-gold-700 hover:text-gold-200"
            >
              <span aria-hidden className="relative block h-3 w-3">
                <span className="absolute top-1/2 left-0 h-px w-full origin-center rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full origin-center -rotate-45 bg-current" />
              </span>
            </button>

            <p className="label-mono mb-4">Antes de você ir</p>

            <h2
              id="titulo-saida"
              className="font-display text-[clamp(1.4rem,3vw,1.9rem)] leading-snug text-plat-50"
            >
              Quatro perguntas, e um consultor te chama.
            </h2>

            <p className="mt-4 text-[0.95rem] leading-relaxed text-plat-400">
              São as mesmas que o atendimento faria na primeira mensagem: seu nome, se o nome está
              limpo, se está negativado e o que você quer financiar. Leva menos de um minuto.
            </p>

            <a
              href="/formulario"
              data-rastro="saida-aceitou"
              data-cursor="Abrir"
              onClick={() => anotar('formulario', 'convite-de-saida-aceito')}
              className="mt-7 block w-full rounded-xl border border-gold-700 bg-gold-900/30 px-5 py-4 text-center text-[0.97rem] text-gold-100 transition-colors duration-400 hover:border-gold-400 hover:bg-gold-800/40"
            >
              Responder agora
            </a>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="mt-3 w-full text-sm text-plat-500 transition-colors hover:text-gold-200"
            >
              Agora não
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
