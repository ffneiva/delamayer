/**
 * As chaves que o site guarda no navegador, num lugar só.
 *
 * É uma chave só hoje, e mesmo assim vale o arquivo: string literal de
 * `localStorage` espalhada pelo código tem um modo de falha conhecido e chato
 * de achar — duas partes escrevem chaves quase iguais, e o sintoma é um estado
 * que some entre telas sem erro nenhum no console.
 *
 * O prefixo `dlm.` evita colisão com qualquer outra coisa servida no mesmo
 * domínio, hoje ou depois.
 */

/** Identificador aleatório da visita. Ver lib/rastro.ts. */
export const CHAVE_VISITANTE = 'dlm.visitante'
