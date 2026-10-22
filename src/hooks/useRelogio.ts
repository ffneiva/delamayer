import { useSyncExternalStore } from 'react'
import { agoraEmGoiania, type Estado, estadoAtual } from '@/lib/hours'

/**
 * O que depende do relógio, com um valor neutro no HTML pré-renderizado.
 *
 * O build grava o conteúdo de cada rota no HTML (scripts/prerender.mjs), e esse
 * HTML fica servido até o próximo deploy: um "Aberto agora" calculado na hora
 * do build viraria informação errada para quem lê sem JavaScript. Pelo mesmo
 * motivo a hidratação precisa ver o mesmo valor neutro no primeiro render; o
 * `useSyncExternalStore` faz isso com o terceiro argumento e troca pelo valor
 * real logo em seguida, sem aviso de divergência.
 */
function aCadaMinuto(aviso: () => void) {
  const t = window.setInterval(aviso, 60_000)
  return () => window.clearInterval(t)
}

const ESTADO_NEUTRO: Estado = { aberto: false, rotulo: 'Atendimento pelo WhatsApp' }
const NEUTRO = ''

/** Aberto ou fechado agora, no fuso de Goiânia. */
export function useEstadoAtual(): Estado {
  // O snapshot é texto: um objeto novo a cada leitura faria o React renderizar sem parar.
  const chave = useSyncExternalStore(
    aCadaMinuto,
    () => JSON.stringify(estadoAtual()),
    () => NEUTRO,
  )
  return chave === NEUTRO ? ESTADO_NEUTRO : (JSON.parse(chave) as Estado)
}

/** Dia da semana em Goiânia (0 = domingo); -1 no HTML estático, onde nenhum dia é "hoje". */
export function useDiaDeHoje(): number {
  return useSyncExternalStore(
    aCadaMinuto,
    () => agoraEmGoiania().dia,
    () => -1,
  )
}

/** O ano corrente; `null` no HTML estático, para não congelar o ano do build. */
export function useAno(): number | null {
  return useSyncExternalStore(
    aCadaMinuto,
    () => new Date().getFullYear(),
    () => null,
  )
}
