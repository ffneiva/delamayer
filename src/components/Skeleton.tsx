import { cn } from '@/lib/utils'

/**
 * Esqueletos de carregamento.
 *
 * A regra que define o arquivo: **o esqueleto tem a forma do conteúdo que vai
 * substituí-lo.** Um retângulo genérico onde vai entrar um objeto 3D flutuando
 * produz um salto de layout na troca — que é exatamente o problema que o
 * esqueleto existia para evitar. Por isso não existe aqui um `<Skeleton />`
 * que serve para tudo: cada espera tem a sua forma.
 *
 * `aria-hidden` sempre: para quem usa leitor de tela, a informação útil é a
 * região viva que anuncia "carregando", não a descrição de uma caixa cinza.
 */
type Props = { className?: string }

/** O espaço do WebGL enquanto o chunk do three.js não chegou. */
export function SkeletonCena({ className }: Props) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden', className)}>
      {/* Um halo dourado no lugar exato onde o monograma vai aparecer. Não é
          um retângulo: a cena é um objeto flutuando no vazio, e um retângulo
          cinza prometeria uma caixa que nunca chega. */}
      <div
        className="absolute top-1/2 left-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,168,85,0.22) 0%, rgba(212,168,85,0.06) 55%, transparent 72%)',
          animation: 'fade-in 900ms var(--ease-vault) both',
        }}
      />
    </div>
  )
}
