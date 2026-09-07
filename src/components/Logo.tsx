import { cn } from '@/lib/utils'
import { Mark } from './Mark'

/**
 * O lockup da marca: monograma + "DELAMAYER" + assinatura.
 *
 * O logotipo do arquivo original é uma imagem de texto em prata. Aqui ele é
 * **texto de verdade** com o degradê aplicado por `background-clip: text` —
 * o utilitário `chrome` de index.css, que reproduz a mesma sequência de
 * claro/escuro do arquivo da marca.
 *
 * O que se ganha: o reflexo vira código (anima com `animate-sheen`), fica
 * nítido em qualquer densidade de tela, e o nome da empresa continua sendo
 * texto selecionável e indexável — coisas que um PNG prateado não faz.
 *
 * O que se perde: a fidelidade absoluta ao desenho das letras. É uma troca
 * consciente; se o cliente entregar o arquivo vetorial oficial do logotipo,
 * trocar aqui é um componente só.
 */
type Props = {
  className?: string
  /** Só o monograma, sem o nome. Usado no cabeçalho compacto e no favicon. */
  apenasMarca?: boolean
  /** Acrescenta "Soluções Financeiras" embaixo. */
  comAssinatura?: boolean
}

export function Logo({ className, apenasMarca = false, comAssinatura = false }: Props) {
  if (apenasMarca) {
    return <Mark className={className} title="Delamayer" />
  }

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Mark className="h-[1.6em] w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="chrome animate-sheen font-display text-[1em] font-semibold tracking-[0.16em]">
          DELAMAYER
        </span>
        {/* `leading-[1.5]` não é escolha estética — é o que faz o til aparecer.
            Com `background-clip: text`, o degradê é recortado pelo glifo mas
            desenhado dentro da CAIXA do elemento. Em `leading-none`, a caixa tem
            exatamente a altura da fonte, e o til do "Õ" de SOLUÇÕES fica acima
            dela: sem fundo por trás, o acento simplesmente não é pintado.
            A palavra saía "SOLUÇOES" e ninguém entendia por quê.

            O tamanho subiu junto (0,42em → 0,52em) porque a 8,8 px o acento
            ocupa menos de um pixel mesmo com a caixa certa, e o espaçamento
            recuou: tracking largo em texto pequeno separa as letras a ponto de
            a palavra deixar de ser lida como palavra. */}
        {comAssinatura && (
          <span className="gold mt-[0.15em] font-sans text-[0.52em] leading-[1.5] font-light tracking-[0.2em] uppercase">
            Soluções Financeiras
          </span>
        )}
      </span>
    </span>
  )
}
