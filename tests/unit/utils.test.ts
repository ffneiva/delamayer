import { describe, expect, it } from 'vitest'
import { clamp, cn, prefersReducedMotion } from '@/lib/utils'

describe('cn', () => {
  it('junta as classes e ignora o que é falso', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
    expect(cn()).toBe('')
  })
})

describe('clamp', () => {
  it('segura o valor no intervalo', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('prefersReducedMotion', () => {
  it('sem navegador, responde que não', () => {
    // Os testes rodam em node: é este o caminho que protege o build do site
    // de quebrar quando o código de animação é importado fora do navegador.
    expect(prefersReducedMotion()).toBe(false)
  })
})
