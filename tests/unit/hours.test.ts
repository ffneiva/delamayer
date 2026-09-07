import { describe, expect, it } from 'vitest'
import { SCHEDULE } from '@/lib/business'
import { agoraEmGoiania, estadoAtual, openingHoursSpec } from '@/lib/hours'

/**
 * O horário é calculado no fuso de Goiânia, não no de quem visita.
 *
 * O bug que estes testes existem para impedir é sutil e caro: alguém abre o
 * site de Portugal às 14h de lá — 10h em Goiânia — e o selo diz "fechado",
 * porque o código usou o relógio do visitante. Ou pior, o contrário: alguém em
 * Goiânia vê "aberto agora" às 22h e manda mensagem esperando resposta.
 *
 * Todas as datas abaixo são construídas em UTC, e a conversão para o horário
 * local de Goiás (UTC−3, sem horário de verão desde 2019) é o que está sendo
 * verificado.
 */

/** Uma segunda-feira. 2026-09-07T13:00:00Z = 10h em Goiânia. */
const SEGUNDA_10H = new Date('2026-09-07T13:00:00Z')
/** Mesma segunda, 07:00 em Goiânia — antes de abrir. */
const SEGUNDA_7H = new Date('2026-09-07T10:00:00Z')
/** Mesma segunda, 21:00 em Goiânia — depois de fechar. */
const SEGUNDA_21H = new Date('2026-09-08T00:00:00Z')
/** Sábado 2026-09-05, 10h em Goiânia. */
const SABADO_10H = new Date('2026-09-05T13:00:00Z')
/** Domingo 2026-09-06, 10h em Goiânia. */
const DOMINGO_10H = new Date('2026-09-06T13:00:00Z')

describe('agoraEmGoiania', () => {
  it('converte UTC para o relógio local de Goiás', () => {
    expect(agoraEmGoiania(SEGUNDA_10H)).toEqual({ dia: 1, minutos: 10 * 60 })
    expect(agoraEmGoiania(SABADO_10H)).toEqual({ dia: 6, minutos: 10 * 60 })
    expect(agoraEmGoiania(DOMINGO_10H)).toEqual({ dia: 0, minutos: 10 * 60 })
  })

  it('vira o dia corretamente na virada de meia-noite local', () => {
    // 00:00Z de terça é 21:00 de segunda em Goiânia.
    const { dia, minutos } = agoraEmGoiania(SEGUNDA_21H)
    expect(dia).toBe(1)
    expect(minutos).toBe(21 * 60)
  })
})

describe('estadoAtual', () => {
  it('reconhece o expediente em curso', () => {
    const estado = estadoAtual(SEGUNDA_10H)
    expect(estado.aberto).toBe(true)
    expect(estado.rotulo).toMatch(/Aberto agora/)
  })

  it('avisa o horário de abertura quando ainda é cedo, no mesmo dia', () => {
    const estado = estadoAtual(SEGUNDA_7H)
    expect(estado.aberto).toBe(false)
    expect(estado.rotulo).toBe('Abre hoje às 8h')
  })

  it('aponta o próximo dia útil depois do fechamento', () => {
    const estado = estadoAtual(SEGUNDA_21H)
    expect(estado.aberto).toBe(false)
    expect(estado.rotulo).toBe('Abre amanhã às 8h')
  })

  it('atravessa o fim de semana até a segunda', () => {
    // Sábado e domingo são fechados; o próximo expediente é na segunda.
    for (const momento of [SABADO_10H, DOMINGO_10H]) {
      const estado = estadoAtual(momento)
      expect(estado.aberto).toBe(false)
      expect(estado.rotulo).toMatch(/Abre (amanhã|seg) às 8h/)
    }
  })

  it('nunca diz "aberto" num dia sem expediente', () => {
    // Varre as 24 horas de sábado e domingo, de hora em hora.
    for (const base of ['2026-09-05', '2026-09-06']) {
      for (let h = 0; h < 24; h++) {
        const momento = new Date(`${base}T${String(h).padStart(2, '0')}:30:00-03:00`)
        expect(estadoAtual(momento).aberto, `${base} ${h}h`).toBe(false)
      }
    }
  })

  it('abre e fecha exatamente nos minutos declarados', () => {
    const aberturaExata = new Date('2026-09-07T08:00:00-03:00')
    const umMinutoAntes = new Date('2026-09-07T07:59:00-03:00')
    const fechamentoExato = new Date('2026-09-07T18:00:00-03:00')
    const umMinutoAntesDeFechar = new Date('2026-09-07T17:59:00-03:00')

    expect(estadoAtual(aberturaExata).aberto).toBe(true)
    expect(estadoAtual(umMinutoAntes).aberto).toBe(false)
    // Às 18h em ponto já está fechado: o intervalo é [abre, fecha).
    expect(estadoAtual(fechamentoExato).aberto).toBe(false)
    expect(estadoAtual(umMinutoAntesDeFechar).aberto).toBe(true)
  })
})

describe('openingHoursSpec', () => {
  it('emite uma entrada por dia com expediente, e nenhuma para os fechados', () => {
    const spec = openingHoursSpec()
    const abertos = SCHEDULE.filter((d) => d.open && d.close)

    expect(spec).toHaveLength(abertos.length)
    for (const entrada of spec) {
      expect(entrada['@type']).toBe('OpeningHoursSpecification')
      expect(entrada.opens).toBeTruthy()
      expect(entrada.closes).toBeTruthy()
    }
  })

  it('usa os nomes de dia em inglês que o schema.org exige', () => {
    const nomes = openingHoursSpec().map((e) => e.dayOfWeek)
    expect(nomes).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
  })
})
