import { Component, type ErrorInfo, type ReactNode } from 'react'
import { BUSINESS } from '@/lib/business'

/**
 * Rede de segurança contra erro de render.
 *
 * Sem isto, uma exceção em qualquer componente derruba a árvore inteira e o
 * visitante fica com uma tela preta — sem telefone, sem endereço, sem saída.
 * Para um site cuja única função é gerar uma conversa no WhatsApp, isso é a
 * pior falha possível: o erro custa o lead inteiro.
 *
 * O fallback é deliberadamente pobre em recursos: HTML e estilo inline, sem
 * depender de nenhum componente do site. Se o que quebrou foi o sistema de
 * design, um fallback bonito quebraria junto.
 */
type Props = { children: ReactNode }
type State = { erro: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    // O Sentry, quando configurado, captura isto pelo handler global. O console
    // continua sendo o caminho de diagnóstico em desenvolvimento e para quem
    // abrir o inspetor em produção.
    console.error('[render]', erro, info.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          background: '#050506',
          color: '#d7dbe1',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#b07c24',
              margin: '0 0 1rem',
            }}
          >
            Algo quebrou aqui
          </p>
          <h1 style={{ fontSize: '1.7rem', margin: '0 0 1rem', color: '#fafbfc' }}>
            O site travou, mas o atendimento não.
          </h1>
          <p style={{ margin: '0 0 2rem', lineHeight: 1.6, color: '#8d95a1' }}>
            Recarregue a página — e, se continuar assim, fale direto pelo WhatsApp. A consulta é a
            mesma, com site ou sem ele.
          </p>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            style={{
              display: 'inline-block',
              padding: '0.9rem 1.9rem',
              borderRadius: '999px',
              background: 'linear-gradient(180deg, #e8cb8a, #c2913c)',
              color: '#050506',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            WhatsApp {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>
    )
  }
}
