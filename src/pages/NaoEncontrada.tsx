import { BotaoWhatsApp, ButtonLink } from '@/components/Button'
import { Mark } from '@/components/Mark'
import { BUSINESS } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { ROUTES } from '@/lib/routes'

/**
 * 404 de verdade.
 *
 * "De verdade" porque o arquivo correspondente (dist/404.html) é servido pela
 * distribuição com status HTTP 404, e não com 200 (ver CustomErrorResponses em
 * scripts/aws-setup.sh). Um endereço inexistente que responde 200 com a home
 * dentro é o *soft 404* que o Google trata como sinal de site mal cuidado.
 *
 * A página não é um beco: ela lista as rotas reais e mantém o WhatsApp à
 * mão. Quem digitou um endereço errado continua sendo alguém que queria falar
 * com a empresa.
 */
export function NaoEncontrada({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main id="conteudo" className="flex min-h-[100svh] items-center pt-32 pb-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <Mark className="mx-auto h-16 w-16 opacity-60" />

          <p data-numero className="gold mt-10 font-display text-7xl leading-none font-semibold">
            404
          </p>

          <h1 className="mt-6 font-display text-[clamp(1.7rem,4.6vw,2.8rem)] leading-tight text-plat-50">
            Este endereço não existe
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[0.98rem] leading-relaxed text-plat-400">
            Pode ser um link antigo ou um erro de digitação. As páginas do site estão logo abaixo —
            e o WhatsApp funciona de qualquer jeito.
          </p>

          <nav aria-label="Páginas do site" className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-2.5">
              {ROUTES.map((rota) => (
                <li key={rota.path}>
                  <a
                    href={rota.path}
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate(rota.path)
                    }}
                    className="inline-block rounded-full border border-edge px-4 py-2 text-sm text-plat-300 transition-colors duration-400 hover:border-gold-700 hover:text-gold-100"
                  >
                    {rota.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <BotaoWhatsApp
              href={linkWhatsApp(`Olá! Vim pelo site da ${BUSINESS.shortName}.`)}
              origem="404"
            >
              Falar no WhatsApp
            </BotaoWhatsApp>

            {/* Link comum, sem interceptar o clique: numa página de erro o
                recarregamento completo é o comportamento mais previsível — e
                garante que a home venha do servidor mesmo se o roteador
                estiver em estado esquisito. */}
            <ButtonLink href="/" variante="texto" rotuloCursor="Início">
              Voltar ao início
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  )
}
