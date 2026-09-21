/**
 * O protocolo do atendimento: 5 caracteres no fim da mensagem do WhatsApp.
 *
 * Quem toca no botão do WhatsApp sai do site sem deixar telefone: o site não
 * tem como saber o número de quem vai mandar a mensagem. O que ele consegue é
 * pôr um código no fim da mensagem pronta ("Protocolo: 7K2PX"), e a API grava
 * o mesmo código no atendimento. Quando a mensagem chega, quem atende procura
 * o protocolo no painel e cai direto na pessoa, com o caminho que ela fez.
 *
 * A conta é a mesma da API (app/protocolo.py): FNV-1a de 32 bits sobre o
 * identificador do visitante, em 5 letras sem os caracteres que se confundem
 * (0/O, 1/I). Os dois lados calculam sozinhos, sem conversar. Se mudar aqui,
 * muda lá, e o teste de protocolo dos dois repositórios confere os mesmos
 * valores fixos.
 */

const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function protocoloDe(visitante: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < visitante.length; i++) {
    h ^= visitante.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  let saida = ''
  for (let i = 0; i < 5; i++) {
    saida += ALFABETO[h & 31]
    h >>>= 5
  }
  return saida
}

/**
 * Acrescenta o protocolo ao texto de um link do WhatsApp.
 *
 * Monta a URL à mão, com `encodeURIComponent`, e não com `URLSearchParams`:
 * este codifica espaço como `+`, e há versões do WhatsApp que mostram o `+`
 * literalmente na mensagem.
 */
export function linkComProtocolo(href: string, visitante: string): string {
  const [base, consulta = ''] = href.split('?')
  const texto = new URLSearchParams(consulta).get('text') ?? ''
  const marca = `Protocolo: ${protocoloDe(visitante)}`
  if (texto.includes(marca)) return href
  const novo = texto ? `${texto}\n\n${marca}` : marca
  return `${base}?text=${encodeURIComponent(novo)}`
}
