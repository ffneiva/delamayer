import { SCORE_VS_RATING } from '@/lib/business'
import { cn } from '@/lib/utils'

/**
 * A comparação entre score e rating — a peça de conteúdo mais importante do
 * site, e a que mais sofre num celular.
 *
 * ── O bug que este componente existe para corrigir ──────────────────────────
 *
 * A primeira versão era uma `<table>` com `w-full` e `whitespace-nowrap` na
 * coluna de critério. Três colunas de texto não cabem em 390 px: a tabela
 * assumia a largura mínima do conteúdo (~424 px), estourava o cartão, e o
 * `overflow-hidden` dele **cortava a coluna "Rating" fora da tela** — que é
 * justamente a coluna que dá nome à seção.
 *
 * Pior: a varredura de responsividade não pegou, porque ela media
 * `document.scrollWidth`, e o `overflow-x: clip` do body impede o documento de
 * rolar. O conteúdo sumia sem deixar rastro na métrica.
 *
 * ── A saída ────────────────────────────────────────────────────────────────
 *
 * No celular, cada linha vira um bloco: o critério como título e os dois
 * indicadores empilhados, cada um com o próprio rótulo. A partir de `md`, volta
 * a ser uma tabela de verdade.
 *
 * O importante é que **o conteúdo aparece uma vez só no DOM**. A alternativa
 * comum — renderizar uma tabela para desktop e uma lista para celular, uma
 * escondida — duplica todo o texto da seção e é o tipo de coisa que o Google lê
 * como conteúdo repetido. Aqui o que muda é `display`, e os rótulos de coluna
 * do modo empilhado são spans que só existem abaixo de `md`.
 */
export function TabelaComparativa({ className }: { className?: string }) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <table className="w-full text-left text-sm max-md:block">
        <caption className="sr-only">
          Comparação entre o score de crédito e o rating bancário
        </caption>

        {/* O cabeçalho não faz sentido empilhado: no celular cada célula leva o
            próprio rótulo, e repetir "Critério / Score / Rating" no topo seria
            uma legenda para uma tabela que não está mais ali. */}
        <thead className="max-md:hidden">
          <tr className="border-b border-edge">
            <th scope="col" className="label-mono px-5 py-4 font-normal">
              Critério
            </th>
            <th scope="col" className="px-5 py-4 font-display text-base text-plat-100">
              Score
            </th>
            <th scope="col" className="px-5 py-4 font-display text-base text-gold-200">
              Rating
            </th>
          </tr>
        </thead>

        <tbody className="max-md:block">
          {SCORE_VS_RATING.map((linha) => (
            <tr
              key={linha.criterio}
              className="border-b border-edge/60 transition-colors duration-400 last:border-0 hover:bg-white/[0.018] max-md:block max-md:px-5 max-md:py-5"
            >
              <th
                scope="row"
                className="px-5 py-4 text-left align-top font-normal text-plat-500 md:whitespace-nowrap max-md:block max-md:px-0 max-md:pt-0 max-md:pb-3 max-md:font-display max-md:text-base max-md:text-plat-100"
              >
                {linha.criterio}
              </th>

              <td className="px-5 py-4 align-top text-plat-300 max-md:block max-md:px-0 max-md:py-0">
                <span className="label-mono mb-1 hidden text-plat-600 max-md:block">Score</span>
                {linha.score}
              </td>

              <td className="px-5 py-4 align-top text-gold-100/90 max-md:block max-md:px-0 max-md:pt-3 max-md:pb-0">
                <span className="label-mono mb-1 hidden max-md:block">Rating</span>
                {linha.rating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
