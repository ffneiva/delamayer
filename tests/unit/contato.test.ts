import { describe, expect, it } from 'vitest'
import {
  CONTATO_VAZIO,
  conferirContato,
  digitosDoTelefone,
  mascaraDeTelefone,
  telefoneValido,
} from '@/components/PrimeiroPasso'

/**
 * A primeira tela dos formulários: nome e WhatsApp obrigatórios, e-mail
 * opcional. Sem os dois primeiros, a pessoa não passa para as perguntas.
 */

describe('telefone', () => {
  it('põe a máscara enquanto se digita', () => {
    expect(mascaraDeTelefone('6')).toBe('(6')
    expect(mascaraDeTelefone('629')).toBe('(62) 9')
    expect(mascaraDeTelefone('6299999')).toBe('(62) 9999-9')
    expect(mascaraDeTelefone('6232221111')).toBe('(62) 3222-1111')
    expect(mascaraDeTelefone('62999998888')).toBe('(62) 99999-8888')
    expect(mascaraDeTelefone('')).toBe('')
  })

  it('aceita o número colado com +55 e corta o excesso', () => {
    expect(mascaraDeTelefone('+55 62 99999-8888')).toBe('(62) 99999-8888')
    expect(mascaraDeTelefone('629999988881234')).toBe('(62) 99999-8888')
    expect(digitosDoTelefone('+55 (62) 99999-8888')).toBe('62999998888')
  })

  it('valida DDD e número', () => {
    expect(telefoneValido('(62) 99999-8888')).toBe(true)
    expect(telefoneValido('(62) 3222-1111')).toBe(true)
    expect(telefoneValido('5562999998888')).toBe(true)
    expect(telefoneValido('9999-8888')).toBe(false)
    expect(telefoneValido('(06) 99999-8888')).toBe(false)
    expect(telefoneValido('')).toBe(false)
  })
})

describe('conferirContato', () => {
  it('exige nome e WhatsApp', () => {
    const erros = conferirContato(CONTATO_VAZIO)
    expect(Object.keys(erros).sort()).toEqual(['nome', 'telefone'])
  })

  it('deixa passar sem e-mail, mas não com e-mail errado', () => {
    const base = { nome: 'Maria Aparecida', telefone: '(62) 99999-8888', email: '' }
    expect(conferirContato(base)).toEqual({})
    expect(conferirContato({ ...base, email: 'maria@' })).toHaveProperty('email')
    expect(conferirContato({ ...base, email: 'maria@exemplo.com' })).toEqual({})
  })
})
