import { registrarConversaoWhatsApp } from '@/lib/analytics'
import { BUSINESS, SCHEDULE_SUMMARY, SERVICES } from '@/lib/business'
import { linkWhatsApp } from '@/lib/diagnostico'
import { ROUTES } from '@/lib/routes'
import { Logo } from './Logo'

/**
 * Rodapé.
 *
 * Ele é a segunda página de contato do site: quem rola até o fim sem clicar em
 * nada costuma estar procurando endereço, telefone ou a confirmação de que a
 * empresa existe de verdade. Por isso o endereço completo aparece aqui, e não
 * só no mapa.
 *
 * A nota de transparência no fim não é jurídica — é editorial. Num setor onde
 * a promessa exagerada é a norma, dizer em letra pequena a mesma coisa que se
 * diz em letra grande é o que faz a letra grande ser acreditável.
 */
type Props = {
  onNavigate: (path: string) => void
  onSection: (id: string) => void
}

export function Footer({ onNavigate, onSection }: Props) {
  const ano = new Date().getFullYear()

  return (
    <footer className="relative border-t border-edge bg-ink">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Logo className="text-[1.3rem]" comAssinatura />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-plat-400">
              Assessoria de crédito em {BUSINESS.address.city}. Diagnóstico, regularização direta e
              leitura de rating bancário.
            </p>

            <a
              href={linkWhatsApp(`Olá! Vim pelo site da ${BUSINESS.shortName}.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarConversaoWhatsApp('rodape')}
              className="mt-6 inline-flex items-center gap-2 font-display text-lg text-gold-200 transition-colors hover:text-gold-100"
            >
              {BUSINESS.phoneDisplay}
            </a>
          </div>

          <nav aria-label="Páginas">
            <h2 className="label-mono mb-5">Páginas</h2>
            <ul className="space-y-3 text-sm">
              {ROUTES.map((rota) => (
                <li key={rota.path}>
                  <a
                    href={rota.path}
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate(rota.path)
                    }}
                    className="text-plat-400 transition-colors hover:text-gold-200"
                  >
                    {rota.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Serviços">
            <h2 className="label-mono mb-5">Serviços</h2>
            <ul className="space-y-3 text-sm">
              {SERVICES.map((servico) => (
                <li key={servico.id}>
                  <button
                    type="button"
                    onClick={() => onSection('servicos')}
                    className="text-left text-plat-400 transition-colors hover:text-gold-200"
                  >
                    {servico.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label-mono mb-5">Escritório</h2>
            <address className="space-y-1 text-sm leading-relaxed text-plat-400 not-italic">
              <p className="text-plat-200">{BUSINESS.address.venue}</p>
              <p>{BUSINESS.address.street}</p>
              <p>
                {BUSINESS.address.district} · {BUSINESS.address.city}/{BUSINESS.address.state}
              </p>
              <p>CEP {BUSINESS.address.zip}</p>
            </address>

            <dl className="mt-5 space-y-1 text-sm text-plat-400">
              {SCHEDULE_SUMMARY.map((linha) => (
                <div key={linha.days} className="flex justify-between gap-4">
                  <dt>{linha.days}</dt>
                  <dd className="text-plat-300">{linha.hours}</dd>
                </div>
              ))}
            </dl>

            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm text-plat-400 transition-colors hover:text-gold-200"
            >
              {BUSINESS.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-edge pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-plat-600">
            <strong className="font-medium text-plat-500">Transparência.</strong> A {BUSINESS.name}{' '}
            presta assessoria e intermediação de negociação de dívidas. Não somos instituição
            financeira, não concedemos crédito e não removemos registros legítimos dos órgãos de
            proteção ao crédito — a baixa de uma restrição é feita pelo credor, após o acordo, nos
            prazos previstos em lei. Resultados variam conforme o caso e nenhuma aprovação de
            crédito é garantida. A consulta ao Serasa e o Registrato do Banco Central são gratuitos
            e podem ser feitos por você mesmo.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-plat-600">
            <p>
              © {ano} {BUSINESS.name}. {BUSINESS.address.city}/{BUSINESS.address.state}.
            </p>
            <p>
              Feito por{' '}
              <a
                href="https://github.com/ffneiva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-plat-500 transition-colors hover:text-gold-300"
              >
                Felipe Neiva
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
