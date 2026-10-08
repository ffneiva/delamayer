import { SCHEDULE } from './business.ts'

/**
 * "Aberto agora" calculado no fuso de Goiânia, não no do visitante.
 *
 * Quem abre o site de outro estado — ou de fora do país, o que acontece com
 * link compartilhado — precisa saber se o escritório está aberto LÁ. Um
 * `new Date()` puro responderia com o relógio de quem olha, e diria "aberto"
 * às 3 h da manhã de Goiânia.
 *
 * `Intl.DateTimeFormat` com `timeZone` resolve sem trazer biblioteca de datas:
 * ele já sabe que Goiás não tem mais horário de verão, e continuará sabendo se
 * a regra mudar.
 */
const FUSO = 'America/Sao_Paulo'

const FORMATO = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const DIAS: Record<string, number> = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sáb: 6,
  sab: 6,
}

export type Agora = { dia: number; minutos: number }

/** O instante atual, traduzido para o relógio de Goiânia. */
export function agoraEmGoiania(referencia: Date = new Date()): Agora {
  const partes = FORMATO.formatToParts(referencia)
  const pega = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''

  const abreviacao = pega('weekday').replace('.', '').toLowerCase()
  const dia = DIAS[abreviacao] ?? referencia.getDay()
  const minutos = Number(pega('hour')) * 60 + Number(pega('minute'))

  return { dia, minutos }
}

/**
 * "08:00" → "8h", "18:30" → "18h30".
 *
 * O `replace(':00', 'h')` ingênuo que estava aqui devolvia "08h" — com o zero
 * à esquerda, que ninguém escreve em português. Foi um teste que pegou, não o
 * olho: no selo do cabeçalho o texto é pequeno e a diferença passa batida.
 */
export function porExtenso(hhmm: string): string {
  const [h, m] = hhmm.split(':')
  const hora = String(Number(h))
  return m === '00' ? `${hora}h` : `${hora}h${m}`
}

function emMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export type Estado = {
  aberto: boolean
  /** Texto curto para o selo: "Aberto agora" / "Abre segunda, 8h". */
  rotulo: string
}

export function estadoAtual(referencia: Date = new Date()): Estado {
  const { dia, minutos } = agoraEmGoiania(referencia)
  const hoje = SCHEDULE[dia]

  if (hoje?.open && hoje.close) {
    const abre = emMinutos(hoje.open)
    const fecha = emMinutos(hoje.close)
    if (minutos >= abre && minutos < fecha) {
      return { aberto: true, rotulo: `Aberto agora · até ${porExtenso(hoje.close)}` }
    }
    if (minutos < abre) {
      return { aberto: false, rotulo: `Abre hoje às ${porExtenso(hoje.open)}` }
    }
  }

  // Procura o próximo dia com expediente, dando a volta na semana.
  for (let i = 1; i <= 7; i++) {
    const proximo = SCHEDULE[(dia + i) % 7]
    if (proximo?.open) {
      const quando = i === 1 ? 'amanhã' : proximo.short.toLowerCase()
      return { aberto: false, rotulo: `Abre ${quando} às ${porExtenso(proximo.open)}` }
    }
  }

  return { aberto: false, rotulo: 'Atendimento pelo WhatsApp' }
}

/**
 * Formato que o schema.org espera em `openingHours`.
 *
 * Os dias fechados simplesmente não entram na lista — o schema trata ausência
 * como "fechado", e emitir uma entrada com `opens: null` é erro de validação.
 */
export function openingHoursSpec() {
  const MAPA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return SCHEDULE.flatMap((dia, indice) =>
    dia.open && dia.close
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: MAPA[indice],
            opens: dia.open,
            closes: dia.close,
          },
        ]
      : [],
  )
}
