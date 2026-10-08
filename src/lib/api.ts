/**
 * O cliente da API.
 *
 * A API mora no mesmo domínio do site, em `/api/*` — não há URL de serviço
 * escrita em lugar nenhum, não há CORS e não há chave. Quem resolve para onde
 * `/api` aponta é a borda, e isso é de propósito: o endereço do back-end não
 * precisa existir no código que qualquer pessoa baixa ao abrir a página.
 *
 * ── A regra que atravessa este arquivo ──────────────────────────────────────
 *
 * **Nada aqui pode quebrar a página.** Todo envio falha em silêncio e devolve
 * `null`. Se a API estiver fora, se a rede cair, se um bloqueador de anúncios
 * matar a requisição: o formulário continua funcionando, o diagnóstico continua
 * calculando e o botão do WhatsApp continua abrindo. O registro é para a
 * Delamayer; a página é para quem está do outro lado. Trocar uma coisa pela
 * outra seria perder as duas.
 */

/** Identificação de um registro em andamento. O token autoriza completá-lo. */
export type Bilhete = { id: string; token: string }

export type Origem = 'formulario' | 'diagnostico'

export type CamposDoLead = {
  nome?: string
  telefone?: string
  email?: string
  limpo?: 'sim' | 'nao' | 'nao-sei'
  negativado?: 'sim' | 'nao' | 'nao-sei'
  financiar?: string
  respostas?: Record<string, string>
  cenario?: string
  enviouWhatsapp?: boolean
  concluido?: boolean
}

const TEMPO_LIMITE = 8000

async function enviar<T>(caminho: string, opcoes: RequestInit): Promise<T | null> {
  // Um formulário travado esperando uma resposta que não vem é pior do que um
  // registro perdido. O relógio garante que a interface siga em frente.
  const relogio = AbortSignal.timeout(TEMPO_LIMITE)

  try {
    const resposta = await fetch(`/api${caminho}`, {
      ...opcoes,
      signal: relogio,
      headers: { 'content-type': 'application/json', ...opcoes.headers },
    })
    if (!resposta.ok) return null
    return (await resposta.json()) as T
  } catch {
    return null
  }
}

/**
 * Abre o registro.
 *
 * Acontece assim que a pessoa responde a primeira coisa, e não no fim: quem
 * desiste na terceira pergunta é exatamente quem vale a pena chamar de volta,
 * e para isso o registro precisa existir antes de ela desistir.
 */
export function abrirLead(origem: Origem, visitante: string | null): Promise<Bilhete | null> {
  return enviar<Bilhete>('/leads', {
    method: 'POST',
    body: JSON.stringify({ origem, consentimento: true, visitante }),
  })
}

/** Costura mais um pedaço ao registro já aberto. */
export function completarLead(bilhete: Bilhete, campos: CamposDoLead): Promise<unknown | null> {
  return enviar(`/leads/${bilhete.id}`, {
    method: 'PATCH',
    headers: { 'x-lead-token': bilhete.token },
    body: JSON.stringify(campos),
  })
}
