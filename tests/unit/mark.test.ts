import { describe, expect, it } from 'vitest'
import { MARK_SIZE, MARK_STROKE, markCenterline, markOutline, OURO } from '@/lib/mark'

/**
 * A geometria da marca.
 *
 * Testar desenho parece estranho até acontecer o bug que estes testes pegam.
 * Foram dois, nos dois formatos em que o monograma existe:
 *
 *  · no SVG, um raio de arco que vira zero ou negativo não dá erro — o
 *    navegador simplesmente desenha uma reta no lugar da barriga do "D";
 *  · no 3D, um polígono auto-intersectante triangula errado, e o
 *    `ShapeGeometry` produz faces invertidas em vez de falhar.
 *
 * Nos dois casos o resultado é uma marca errada que ninguém nota até alguém
 * abrir o site — e favicon é a coisa que menos se olha e mais se nota quando
 * está torta.
 */

describe('markCenterline — o traço do SVG', () => {
  const d = markCenterline()

  it('é um traço único e contínuo', () => {
    // Um só "M": se aparecerem dois, o desenho quebrou em partes soltas e a
    // esquadria dos cantos entre elas se perde.
    expect(d.match(/M /g)).toHaveLength(1)
  })

  it('tem exatamente um arco — a barriga do "D"', () => {
    expect(d.match(/A /g)).toHaveLength(1)
  })

  it('percorre os oito vértices medidos no arquivo original', () => {
    // ponta da diagonal → pé da haste → topo-esquerda → topo-direita →
    // (barriga) → base-esquerda → topo da haste inferior → fim da 2ª diagonal.
    // São 1 M + 6 L + 1 A.
    expect(d.match(/[MLA] /g)).toHaveLength(8)
  })

  it('não emite NaN em nenhuma coordenada', () => {
    expect(d).not.toContain('NaN')
  })

  it('usa um raio de arco positivo', () => {
    const raio = Number(d.match(/A ([\d.]+)/)?.[1])
    expect(raio).toBeGreaterThan(0)
  })

  it('cabe na caixa, com o traço inteiro dentro', () => {
    const numeros = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
    const meio = MARK_STROKE / 2

    for (const n of numeros) {
      // O raio do arco é bem maior que a caixa (a barriga é um arco raso de um
      // círculo grande), então ele fica de fora da verificação de limites.
      if (n > MARK_SIZE) continue
      expect(n).toBeGreaterThanOrEqual(-meio)
      expect(n).toBeLessThanOrEqual(MARK_SIZE + meio)
    }
  })
})

describe('MARK_STROKE', () => {
  /**
   * O valor vem de medir a haste esquerda no arquivo original. Se alguém
   * "arredondar para um número bonito", a marca deixa de ser a marca — e a
   * diferença é pequena demais para saltar aos olhos numa revisão.
   */
  it('mantém a espessura medida no arquivo original', () => {
    expect(MARK_STROKE).toBeGreaterThan(8)
    expect(MARK_STROKE).toBeLessThan(9.5)
  })

  it('é pequena o bastante para as duas hastes não se tocarem', () => {
    // As hastes superior e inferior compartilham a mesma coluna; se o traço
    // crescesse demais, o vazio entre elas fecharia e o "D" viraria um bloco.
    expect(MARK_STROKE).toBeLessThan(MARK_SIZE / 8)
  })
})

describe('markOutline — a versão 3D', () => {
  const contornos = markOutline()

  /**
   * Três pedaços, e não um só, porque o traço se cruza consigo mesmo: a
   * diagonal longa atravessa a barriga embaixo à direita. Ver `cortes()` em
   * lib/mark.ts.
   */
  it('devolve os três pedaços da fita', () => {
    expect(contornos).toHaveLength(3)
  })

  it('nenhum pedaço tem furo — é um traço, não um contorno vazado', () => {
    for (const contorno of contornos) {
      expect(contorno.furos).toHaveLength(0)
    }
  })

  it('as duas diagonais são quadriláteros', () => {
    expect(contornos[0].externo).toHaveLength(4)
    expect(contornos[2].externo).toHaveLength(4)
  })

  it('o pedaço central carrega a barriga, com dezenas de pontos', () => {
    expect(contornos[1].externo.length).toBeGreaterThan(80)
  })

  it('inverte o eixo Y — o SVG cresce para baixo, o three.js para cima', () => {
    // O primeiro ponto é a ponta da diagonal, que no SVG fica embaixo. Em
    // coordenadas de cena ela precisa estar ABAIXO da origem (y < 0); se a
    // inversão sumisse, o monograma apareceria de cabeça para baixo.
    expect(contornos[0].externo[0].y).toBeLessThan(0)
  })

  it('fica centrado na origem, com ~2 unidades de lado', () => {
    const todos = contornos.flatMap((c) => c.externo)
    const xs = todos.map((p) => p.x)
    const ys = todos.map((p) => p.y)

    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(2.05)
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(2.05)
    expect(Math.abs((Math.max(...xs) + Math.min(...xs)) / 2)).toBeLessThan(0.12)
    expect(Math.abs((Math.max(...ys) + Math.min(...ys)) / 2)).toBeLessThan(0.12)
  })

  it('nenhuma coordenada é NaN ou infinita', () => {
    for (const contorno of contornos) {
      for (const ponto of contorno.externo) {
        expect(Number.isFinite(ponto.x)).toBe(true)
        expect(Number.isFinite(ponto.y)).toBe(true)
      }
    }
  })

  /**
   * O limite de esquadria em ação.
   *
   * A ponta da diagonal é um ângulo bem agudo. Sem o `Math.max(0.25, …)` em
   * `bordas()`, o canto projetaria um espeto de comprimento quase infinito —
   * e a peça 3D ganharia uma agulha saindo do nada. O teste verifica que
   * nenhum ponto escapou muito além da caixa.
   */
  it('nenhum canto vira espeto', () => {
    for (const contorno of contornos) {
      for (const ponto of contorno.externo) {
        expect(Math.hypot(ponto.x, ponto.y)).toBeLessThan(1.8)
      }
    }
  })

  /**
   * Os pedaços vizinhos precisam compartilhar exatamente os mesmos pontos de
   * borda no ponto de corte. É isso que faz três fitas separadas parecerem uma
   * peça única depois de extrudadas — qualquer divergência abre uma fenda
   * visível na aresta.
   */
  it('os pedaços se encaixam sem fenda', () => {
    const perto = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y) < 1e-9

    // O fim da diagonal 1 é o começo do pedaço central.
    const fimDa1 = contornos[0].externo[1]
    const inicioDo2 = contornos[1].externo[0]
    expect(perto(fimDa1, inicioDo2)).toBe(true)

    // E o fim do central é o começo da diagonal 2.
    const central = contornos[1].externo
    const meioDoCentral = central.length / 2
    const fimDo2 = central[meioDoCentral - 1]
    const inicioDa3 = contornos[2].externo[0]
    expect(perto(fimDo2, inicioDa3)).toBe(true)
  })
})

describe('paleta', () => {
  it('o degradê de ouro tem quatro paradas em hexadecimal válido', () => {
    expect(OURO).toHaveLength(4)
    for (const cor of OURO) {
      expect(cor).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
