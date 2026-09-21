import { useState } from 'react'

/**
 * A primeira tela dos formulários: nome, WhatsApp e e-mail.
 *
 * Pedido da Delamayer em 21/09/2026: o contato vem **no começo**, e não no
 * fim. Quem desiste no meio das perguntas já deixou o WhatsApp, e é isso que
 * permite chamar de volta. Nome e WhatsApp são obrigatórios (sem eles não se
 * passa para a pergunta seguinte); o e-mail é opcional, para não pesar na
 * primeira tela.
 *
 * Cada campo é salvo quando a pessoa sai dele (`aoSair`), antes mesmo de
 * apertar o botão: quem digita o telefone e fecha a aba também fica
 * registrado.
 */

export type Contato = { nome: string; telefone: string; email: string }

export const CONTATO_VAZIO: Contato = { nome: '', telefone: '', email: '' }

/** Os dígitos do telefone, sem o 55 do país: "62999998888". */
export function digitosDoTelefone(texto: string): string {
  const d = texto.replace(/\D/g, '')
  return d.length > 11 && d.startsWith('55') ? d.slice(2) : d
}

export function telefoneValido(texto: string): boolean {
  const d = digitosDoTelefone(texto)
  return (d.length === 10 || d.length === 11) && d[0] !== '0'
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

/** "(62) 99999-8888" enquanto a pessoa digita. */
export function mascaraDeTelefone(texto: string): string {
  const d = digitosDoTelefone(texto).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

type Erros = Partial<Record<keyof Contato, string>>

export function conferirContato(c: Contato): Erros {
  const erros: Erros = {}
  if (c.nome.trim().length < 3) erros.nome = 'Escreva seu nome completo para continuar.'
  if (!telefoneValido(c.telefone)) erros.telefone = 'Informe o WhatsApp com DDD para continuar.'
  if (c.email.trim() && !EMAIL.test(c.email.trim())) erros.email = 'Confira o e-mail.'
  return erros
}

const CAMPO =
  'w-full rounded-xl border border-edge bg-obsidian px-5 py-4 text-[0.97rem] text-plat-100 ' +
  'placeholder:text-plat-600 transition-colors duration-300 outline-none ' +
  'focus:border-gold-700 focus:ring-1 focus:ring-gold-800 aria-[invalid=true]:border-gold-500'

export const BOTAO_PRINCIPAL =
  'w-full rounded-xl border border-gold-700 bg-gold-900/30 px-5 py-4 text-[0.97rem] ' +
  'text-gold-100 transition-colors duration-400 hover:border-gold-400 hover:bg-gold-800/40'

export function PrimeiroPasso({
  valor,
  aoMudar,
  aoSair,
  aoConfirmar,
  titulo = 'Para começar, seus dados.',
  rastro,
  Titulo = 'h2',
}: {
  valor: Contato
  aoMudar: (c: Contato) => void
  /** Um campo válido perdeu o foco: é a hora de guardar só ele. */
  aoSair: (campos: { nome?: string; telefone?: string; email?: string }) => void
  /** Tudo certo: o nome, o telefone só com dígitos e o e-mail, se houver. */
  aoConfirmar: (c: Contato) => void
  titulo?: string
  rastro: string
  Titulo?: 'h2' | 'h3'
}) {
  const [erros, setErros] = useState<Erros>({})

  const confirmar = () => {
    const encontrados = conferirContato(valor)
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      // O foco vai para o primeiro campo a corrigir: quem usa leitor de tela
      // ouve o erro, e quem está no celular vê o campo certo.
      const primeiro = (['nome', 'telefone', 'email'] as const).find((c) => encontrados[c])
      document.getElementById(`primeiro-passo-${primeiro}`)?.focus()
      return
    }
    aoConfirmar({
      nome: valor.nome.trim(),
      telefone: digitosDoTelefone(valor.telefone),
      email: valor.email.trim(),
    })
  }

  const mudar = (campo: keyof Contato, texto: string) => {
    aoMudar({ ...valor, [campo]: texto })
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  const erro = (campo: keyof Contato) =>
    erros[campo] ? (
      <p id={`primeiro-passo-${campo}-erro`} className="text-sm text-gold-300">
        {erros[campo]}
      </p>
    ) : null

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        confirmar()
      }}
    >
      <Titulo className="font-display text-[clamp(1.35rem,3vw,1.9rem)] leading-snug text-plat-50">
        {titulo}
      </Titulo>
      <p className="mt-3 text-sm text-plat-500">
        É pelo nome e pelo WhatsApp que a gente te chama na conversa.
      </p>

      <div className="mt-7 grid gap-3">
        <input
          id="primeiro-passo-nome"
          type="text"
          value={valor.nome}
          onChange={(e) => mudar('nome', e.target.value)}
          onBlur={() => {
            if (valor.nome.trim().length >= 3) aoSair({ nome: valor.nome.trim() })
          }}
          placeholder="Seu nome completo"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? 'primeiro-passo-nome-erro' : undefined}
          className={CAMPO}
          aria-label="Nome completo"
        />
        {erro('nome')}

        <input
          id="primeiro-passo-telefone"
          type="tel"
          value={valor.telefone}
          onChange={(e) => mudar('telefone', mascaraDeTelefone(e.target.value))}
          onBlur={() => {
            if (telefoneValido(valor.telefone))
              aoSair({ telefone: digitosDoTelefone(valor.telefone) })
          }}
          placeholder="WhatsApp com DDD"
          autoComplete="tel-national"
          inputMode="tel"
          required
          aria-required="true"
          aria-invalid={Boolean(erros.telefone)}
          aria-describedby={erros.telefone ? 'primeiro-passo-telefone-erro' : undefined}
          className={CAMPO}
          aria-label="WhatsApp com DDD"
        />
        {erro('telefone')}

        <input
          id="primeiro-passo-email"
          type="email"
          value={valor.email}
          onChange={(e) => mudar('email', e.target.value)}
          onBlur={() => {
            if (EMAIL.test(valor.email.trim())) aoSair({ email: valor.email.trim() })
          }}
          placeholder="E-mail (opcional)"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(erros.email)}
          aria-describedby={erros.email ? 'primeiro-passo-email-erro' : undefined}
          className={CAMPO}
          aria-label="E-mail (opcional)"
        />
        {erro('email')}

        <button type="submit" data-rastro={rastro} className={`${BOTAO_PRINCIPAL} mt-2`}>
          Começar
        </button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-plat-600">
        O que você responder fica guardado com a Delamayer para o atendimento.
      </p>
    </form>
  )
}
