import { describe, expect, it } from 'vitest'
import { linkComProtocolo, protocoloDe } from '@/lib/protocolo'

/**
 * O protocolo é calculado aqui e na API (app/protocolo.py), sem os dois
 * conversarem. Os valores fixos abaixo são os mesmos do teste da API: se um
 * lado mudar a conta e o outro não, um dos dois testes quebra.
 */
describe('protocolo do atendimento', () => {
  it('bate com a conta da API', () => {
    expect(protocoloDe('abc')).toBe('DAUH6')
    expect(protocoloDe('visitante-0001')).toBe('EK49P')
    expect(protocoloDe('a975e0d380a1b2c3d4e5f60718293a4b')).toBe('4XSCJ')
  })

  it('usa só letras e números que não se confundem', () => {
    for (const id of ['x', 'outro-visitante', '1234567890abcdef']) {
      expect(protocoloDe(id)).toMatch(/^[2-9A-HJ-NP-Z]{5}$/)
    }
  })

  it('entra no fim da mensagem, com espaço codificado como %20', () => {
    const link = linkComProtocolo(
      'https://wa.me/5562995006161?text=Ol%C3%A1!%20Tudo%20bem%3F',
      'abc',
    )
    const texto = new URLSearchParams(link.split('?')[1]).get('text')
    expect(texto).toBe('Olá! Tudo bem?\n\nProtocolo: DAUH6')
    expect(link).not.toContain('+')
  })

  it('não repete o protocolo num segundo clique', () => {
    const uma = linkComProtocolo('https://wa.me/5562995006161?text=Oi', 'abc')
    expect(linkComProtocolo(uma, 'abc')).toBe(uma)
  })

  it('funciona em link sem texto', () => {
    const link = linkComProtocolo('https://wa.me/5562995006161', 'abc')
    expect(new URLSearchParams(link.split('?')[1]).get('text')).toBe('Protocolo: DAUH6')
  })
})
