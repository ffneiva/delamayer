import type { ReactNode } from 'react'
import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { linkWhatsApp } from '@/lib/diagnostico'

/**
 * As peças das páginas-guia (/nome-sujo, /limpar-nome, /bacen).
 *
 * As três respondem uma pergunta que as pessoas digitam no Google, e têm a
 * mesma forma por isso: a resposta curta primeiro, logo abaixo do título, e o
 * detalhe depois. É o formato que o buscador usa para montar o trecho em
 * destaque e que os assistentes de IA citam: uma pergunta, e um parágrafo que
 * a responde sozinho, sem depender do resto da página.
 */

export function TituloDeSecao({
  etiqueta,
  titulo,
  children,
}: {
  etiqueta: string
  titulo: string
  children?: ReactNode
}) {
  return (
    <Reveal>
      <p className="label-mono mb-5 flex items-center gap-3">
        <span aria-hidden className="h-px w-8 bg-gold-700" />
        {etiqueta}
      </p>
      <h2 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-plat-50">
        {titulo}
      </h2>
      {children ? (
        <div className="mt-6 max-w-3xl space-y-4 text-[0.98rem] leading-relaxed text-plat-400">
          {children}
        </div>
      ) : null}
    </Reveal>
  )
}

/**
 * A resposta direta à pergunta da página, num bloco só.
 *
 * Precisa fazer sentido lida sozinha, fora da página: é o trecho que o Google
 * recorta para o resultado em destaque e o que um assistente de IA transcreve.
 */
export function Resposta({ pergunta, children }: { pergunta: string; children: ReactNode }) {
  return (
    <section className="pb-6">
      <div className="container-x">
        <Reveal>
          <div className="card max-w-4xl p-7 md:p-9">
            <h2 className="label-mono mb-4 text-gold-500">{pergunta}</h2>
            <div className="space-y-4 text-[1.02rem] leading-relaxed text-plat-200">{children}</div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

type Cartao = {
  titulo: string
  texto: ReactNode
  /** Linha de rodapé do cartão: o "como" ou o "para quem". */
  detalhe?: ReactNode
  /** Destaca o cartão (o caminho que a Delamayer faz, por exemplo). */
  marca?: string
  /** Ocupa duas colunas: fecha a grade quando o número de cartões é ímpar. */
  largo?: boolean
}

export function Cartoes({ itens, colunas = 3 }: { itens: Cartao[]; colunas?: 2 | 3 }) {
  return (
    <ol
      className={`mt-12 grid gap-px overflow-hidden rounded-2xl border border-edge bg-edge md:grid-cols-2 ${
        colunas === 3 ? 'lg:grid-cols-3' : ''
      }`}
    >
      {itens.map((item, i) => (
        <Reveal
          as="li"
          key={item.titulo}
          delay={i * 0.06}
          className={`flex flex-col bg-obsidian p-7 ${item.largo ? 'md:col-span-2' : ''}`}
        >
          <p className="flex items-center gap-3">
            <span
              data-numero
              className="font-mono text-xs tracking-[0.16em] text-gold-600 tabular-nums"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {item.marca ? (
              <span className="rounded-full border border-gold-800 px-2.5 py-0.5 font-mono text-[0.62rem] tracking-[0.14em] text-gold-400 uppercase">
                {item.marca}
              </span>
            ) : null}
          </p>
          <h3 className="mt-3 font-display text-lg leading-snug text-plat-50">{item.titulo}</h3>
          <div className="mt-3 text-sm leading-relaxed text-plat-400">{item.texto}</div>
          {item.detalhe ? (
            <p className="mt-auto pt-5 text-[0.82rem] leading-relaxed text-plat-500">
              {item.detalhe}
            </p>
          ) : null}
        </Reveal>
      ))}
    </ol>
  )
}

/** Um link no meio do texto, para outra página do site. */
export function LinkDoTexto({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-gold-300 underline decoration-gold-800 underline-offset-4 transition-colors hover:text-gold-100 hover:decoration-gold-500"
    >
      {children}
    </a>
  )
}

export function ChamadaFinal({
  titulo,
  texto,
  mensagem,
  origem,
  rotulo,
}: {
  titulo: string
  texto: string
  /** A mensagem que já vai escrita no WhatsApp. */
  mensagem: string
  origem: string
  rotulo: string
}) {
  return (
    <section className="pb-28 md:pb-36">
      <div className="container-x">
        <Reveal>
          <div className="card p-9 text-center md:p-14">
            <h2 className="mx-auto max-w-[24ch] font-display text-[clamp(1.7rem,4vw,2.7rem)] leading-tight text-plat-50">
              {titulo}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-plat-400">
              {texto}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <BotaoWhatsApp href={linkWhatsApp(mensagem)} origem={origem}>
                {rotulo}
              </BotaoWhatsApp>
              <ButtonLink href="/diagnostico" variante="contorno" rotuloCursor="Abrir">
                Fazer o diagnóstico antes
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
