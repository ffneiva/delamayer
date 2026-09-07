import { describe, expect, it } from 'vitest'
import { SERVICES } from '@/lib/business'
import {
  completo,
  diagnosticar,
  linkDiagnostico,
  mensagemWhatsApp,
  PERGUNTAS,
  type Respostas,
} from '@/lib/diagnostico'

/**
 * Testes da triagem do diagnóstico.
 *
 * O que se testa aqui não é "a função retorna um objeto". É que ela **nunca
 * promete** e **nunca deixa alguém sem resposta** — as duas formas de este
 * site se transformar no que ele critica.
 */

/** Todas as combinações possíveis de respostas. 3 × 3 × 2 × 4 × 4 = 288. */
function todasAsCombinacoes(): Respostas[] {
  const combinacoes: Respostas[] = []
  const [divida, negativado, recusa, score, objetivo] = PERGUNTAS.map((p) =>
    p.opcoes.map((o) => o.id),
  )

  for (const d of divida) {
    for (const n of negativado) {
      for (const r of recusa) {
        for (const s of score) {
          for (const o of objetivo) {
            combinacoes.push({
              divida: d,
              negativado: n,
              recusa: r,
              score: s,
              objetivo: o,
            } as Respostas)
          }
        }
      }
    }
  }
  return combinacoes
}

const TODAS = todasAsCombinacoes()

describe('cobertura da triagem', () => {
  it('gera as 288 combinações previstas', () => {
    expect(TODAS).toHaveLength(288)
  })

  it('devolve uma leitura completa para toda combinação', () => {
    for (const respostas of TODAS) {
      const leitura = diagnosticar(respostas)

      expect(leitura.id, JSON.stringify(respostas)).toBeTruthy()
      expect(leitura.etiqueta.length).toBeGreaterThan(0)
      expect(leitura.titulo.length).toBeGreaterThan(0)
      expect(leitura.leitura.length).toBeGreaterThan(40)
      expect(leitura.primeiroPasso.length).toBeGreaterThan(40)
      expect(leitura.servicos.length).toBeGreaterThan(0)
    }
  })

  it('só aponta para serviços que existem em business.ts', () => {
    const ids = new Set(SERVICES.map((s) => s.id))

    for (const respostas of TODAS) {
      for (const servico of diagnosticar(respostas).servicos) {
        expect(ids, `serviço inexistente: ${servico}`).toContain(servico)
      }
    }
  })

  it('nunca repete um serviço na mesma leitura', () => {
    for (const respostas of TODAS) {
      const servicos = diagnosticar(respostas).servicos
      expect(new Set(servicos).size).toBe(servicos.length)
    }
  })
})

/**
 * A guarda contra propaganda enganosa.
 *
 * Cada termo abaixo é uma promessa que o setor faz e que a Delamayer decidiu
 * não fazer (ver NAO_FAZEMOS em business.ts). Se alguém, um dia, "melhorar" o
 * texto da triagem e escrever "garantimos" ou "em até 30 dias", este teste
 * quebra antes do deploy.
 *
 * O objetivo não é censurar palavra — é obrigar quem escrever a passar por
 * aqui e decidir conscientemente, em vez de escorregar.
 */
const PROMESSAS_PROIBIDAS = [
  /\bgarant(imos|ido|ia|e)\b/i,
  /\b100%\s*(de\s*)?(aprova|sucesso|garant)/i,
  /\bem at[ée]\s+\d+\s*(dias|horas|semanas)/i,
  /\bapagamos\b/i,
  /\bnome limpo em\b/i,
  /\bcerteza de aprova/i,
  /\bsem pagar\b/i,
  /\bblindagem jur[ií]dica\b/i,
]

describe('nenhum texto da triagem promete resultado', () => {
  it.each(PROMESSAS_PROIBIDAS.map((padrao) => [String(padrao)] as const))(
    'não contém %s',
    (padraoStr) => {
      const padrao = PROMESSAS_PROIBIDAS.find((p) => String(p) === padraoStr)!

      for (const respostas of TODAS) {
        const leitura = diagnosticar(respostas)
        const texto = `${leitura.titulo} ${leitura.leitura} ${leitura.primeiroPasso}`
        expect(texto, `combinação: ${JSON.stringify(respostas)}`).not.toMatch(padrao)
      }
    },
  )
})

describe('as regras de prioridade clínica', () => {
  const base: Respostas = {
    divida: 'nao',
    negativado: 'nao',
    recusa: 'nao',
    score: 'alto',
    objetivo: 'credito',
  }

  it('negativação declarada domina qualquer outro sinal', () => {
    // Mesmo com score alto e nenhuma recusa, a restrição ativa vem primeiro:
    // nada mais se resolve enquanto ela existir.
    expect(diagnosticar({ ...base, negativado: 'sim' }).id).toBe('negativacao')
    expect(diagnosticar({ ...base, negativado: 'sim', score: 'alto', recusa: 'nao' }).id).toBe(
      'negativacao',
    )
  })

  it('dívida em atraso somada a recusa também indica restrição', () => {
    expect(diagnosticar({ ...base, divida: 'sim', recusa: 'sim' }).id).toBe('negativacao')
  })

  it('score bom com recusa e sem negativação aponta para rating', () => {
    expect(diagnosticar({ ...base, recusa: 'sim', score: 'alto' }).id).toBe('rating')
    // A faixa média entra pelo mesmo motivo: o birô não reprova ali, mas o
    // rating interno pode.
    expect(diagnosticar({ ...base, recusa: 'sim', score: 'medio' }).id).toBe('rating')
  })

  it('sem dívida, sem restrição e com recusa aponta para cadastro', () => {
    expect(diagnosticar({ ...base, recusa: 'sim', score: 'baixo' }).id).toBe('cadastro')
  })

  it('sem recusa e sem restrição é preparação, não incêndio', () => {
    expect(diagnosticar(base).id).toBe('preventivo')
    expect(diagnosticar({ ...base, objetivo: 'imovel' }).servicos[0]).toBe('imobiliario')
    expect(diagnosticar({ ...base, objetivo: 'consorcio' }).servicos[0]).toBe('consorcio')
  })

  it('"não sei" em ponto decisivo devolve "precisa de consulta", e não um chute', () => {
    const indefinido = diagnosticar({
      ...base,
      divida: 'talvez',
      negativado: 'talvez',
      recusa: 'nao',
    })
    expect(indefinido.id).toBe('indefinido')
    expect(indefinido.servicos).toContain('diagnostico')
  })

  it('objetivo PJ sempre puxa o serviço de CNPJ para a lista', () => {
    for (const respostas of TODAS.filter((r) => r.objetivo === 'pj')) {
      const leitura = diagnosticar(respostas)
      // O cenário "cadastro" é o único em que o CNPJ não entra: ali o problema
      // é registro desatualizado, e a leitura é a mesma para PF e PJ.
      if (leitura.id === 'cadastro') continue
      expect(leitura.servicos, JSON.stringify(respostas)).toContain('pj')
    }
  })
})

describe('mensagem e link do WhatsApp', () => {
  const respostas: Respostas = {
    divida: 'sim',
    negativado: 'sim',
    recusa: 'sim',
    score: 'baixo',
    objetivo: 'imovel',
  }

  it('descreve a situação em primeira pessoa e cita o objetivo', () => {
    const texto = mensagemWhatsApp(respostas, diagnosticar(respostas))

    expect(texto).toContain('Delamayer')
    expect(texto).toContain('nome negativado')
    expect(texto).toContain('quero financiar um imóvel')
    expect(texto).toContain('Podemos fazer a consulta?')
  })

  it('cabe na prévia do WhatsApp', () => {
    for (const combinacao of TODAS) {
      const texto = mensagemWhatsApp(combinacao, diagnosticar(combinacao))
      expect(texto.length, texto).toBeLessThan(420)
    }
  })

  it('gera um link wa.me com a mensagem codificada', () => {
    const url = linkDiagnostico(respostas, diagnosticar(respostas))

    expect(url).toMatch(/^https:\/\/wa\.me\/55\d{10,11}\?text=/)
    // Uma quebra de linha crua no querystring quebraria o link em alguns
    // clientes; codificada, ela vira %0A.
    expect(url).not.toContain('\n')
    expect(decodeURIComponent(url.split('text=')[1])).toContain('Delamayer')
  })
})

describe('completo()', () => {
  it('só aceita as cinco respostas presentes', () => {
    expect(completo({})).toBe(false)
    expect(completo({ divida: 'sim' })).toBe(false)
    expect(completo({ divida: 'sim', negativado: 'nao', recusa: 'sim', score: 'alto' })).toBe(false)
    expect(
      completo({
        divida: 'sim',
        negativado: 'nao',
        recusa: 'sim',
        score: 'alto',
        objetivo: 'credito',
      }),
    ).toBe(true)
  })
})
