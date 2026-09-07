import { useCallback, useEffect, useState } from 'react'
import { Grain, Halo, ScrollProgress } from '@/components/Atmosphere'
import { Cursor } from '@/components/Cursor'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { Preloader } from '@/components/Preloader'
import { WhatsAppFab } from '@/components/WhatsAppFab'
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce'
import { useRouteMeta } from '@/hooks/useRouteMeta'
import { scrollToSection, useSmoothScroll } from '@/hooks/useSmoothScroll'
import { routeFor } from '@/lib/routes'
import { Diagnostico } from '@/pages/Diagnostico'
import { Imovel } from '@/pages/Imovel'
import { NaoEncontrada } from '@/pages/NaoEncontrada'
import { Privacy } from '@/pages/Privacy'
import { Rating } from '@/pages/Rating'
import { DiagnosticoCta } from '@/sections/DiagnosticoCta'
import { Faq } from '@/sections/Faq'
import { FinalCta } from '@/sections/FinalCta'
import { Hero } from '@/sections/Hero'
import { Localizacao } from '@/sections/Localizacao'
import { Manifesto } from '@/sections/Manifesto'
import { Metodo } from '@/sections/Metodo'
import { Midia } from '@/sections/Midia'
import { Numeros } from '@/sections/Numeros'
import { ScoreRating } from '@/sections/ScoreRating'
import { Servicos } from '@/sections/Servicos'
import { Transparencia } from '@/sections/Transparencia'

/**
 * Roteador de ~30 linhas.
 *
 * São cinco telas — a landing, /diagnostico, /rating, /imovel e a política de
 * privacidade —, o que ainda não justifica os ~15 kB do react-router. A
 * History API resolve.
 *
 * As rotas e seus metadados vivem em lib/routes.ts, que também é lido pelo
 * build para gerar um HTML estático por rota: assim /diagnostico, /rating e
 * /imovel chegam ao robô do Google e ao leitor de link do WhatsApp já com
 * título e descrição próprios, sem depender de a aplicação rodar.
 */
function usePath() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const aoVoltar = () => setPath(window.location.pathname)
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])

  const navigate = useCallback((destino: string) => {
    if (destino === window.location.pathname) return
    window.history.pushState({}, '', destino)
    setPath(destino)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return { path, navigate }
}

export default function App() {
  const { path, navigate } = usePath()
  const route = routeFor(path)
  const isHome = route.path === '/'

  useRouteMeta(route)
  useSmoothScroll()
  const { alvoRef, aviso } = useRouteAnnounce(route)

  /**
   * O preloader só existe para a primeira visita à home.
   *
   * A decisão é congelada no estado inicial (avaliado uma única vez) e não
   * derivada de `path`: quem cai direto em /diagnostico vindo de um anúncio
   * não pode esperar uma cortina antes de ver a ferramenta, e quem navega
   * entre as rotas depois não vê a abertura de novo.
   */
  const [mostrarPreloader] = useState(() => routeFor(window.location.pathname).path === '/')

  // `pronto` libera a coreografia de entrada do Hero. Sem preloader não há o
  // que esperar — e sem isto o <h1> ficaria preso no translateY inicial.
  const [pronto, setPronto] = useState(!mostrarPreloader)
  const aoTerminar = useCallback(() => setPronto(true), [])

  /**
   * Leva a uma seção da home a partir de qualquer rota.
   *
   * Fora da home as seções não estão montadas, então rolar até elas é
   * impossível: primeiro volta-se para "/" e só depois — com o React já tendo
   * pintado a home — é que a rolagem acontece. Os dois `requestAnimationFrame`
   * aninhados garantem esse "depois" sem `setTimeout` chutado.
   */
  const irParaSecao = useCallback(
    (id: string) => {
      if (document.getElementById(id)) {
        scrollToSection(id)
        return
      }
      navigate('/')
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id)))
    },
    [navigate],
  )

  return (
    <>
      {mostrarPreloader && <Preloader onDone={aoTerminar} />}

      <Cursor />
      <Halo />
      <Grain />
      <ScrollProgress />

      <a
        href="#conteudo"
        className="sr-only rounded-full bg-gold-200 px-5 py-2 font-mono text-xs text-obsidian focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300]"
      >
        Pular para o conteúdo
      </a>

      {/* Região viva: só existe para o leitor de tela saber que a rota mudou. */}
      <p aria-live="polite" role="status" className="sr-only">
        {aviso}
      </p>

      <Nav onSection={irParaSecao} onNavigate={navigate} path={path} />

      {/* Recebe o foco a cada troca de rota (ver useRouteAnnounce), para a
          navegação por teclado recomeçar do início do conteúdo novo. */}
      <div ref={alvoRef} tabIndex={-1} className="outline-none">
        {route.path === '/diagnostico' && <Diagnostico onNavigate={navigate} />}
        {route.path === '/rating' && <Rating onNavigate={navigate} />}
        {route.path === '/imovel' && <Imovel onNavigate={navigate} />}
        {route.path === '/politica-de-privacidade' && <Privacy onNavigate={navigate} />}
        {route.path === '/404' && <NaoEncontrada onNavigate={navigate} />}

        {isHome && (
          <main id="conteudo">
            {/* A ordem é um argumento, não uma lista.
                  Numeros  — "não é só você": o problema é de metade do país
                  Midia    — autoridade, cedo: o tema virou pauta em TV aberta
                  Manifesto— por que o "não" do banco nunca vem explicado
                  ScoreRating — a explicação, que é o diferencial da empresa
                  Metodo   — como se resolve, em ordem
                  Diagnostico — a primeira ação possível, ainda na página */}
            <Hero ready={pronto} />
            <Numeros />
            <Midia />
            <Manifesto />
            <ScoreRating />
            <Metodo />
            <DiagnosticoCta />
            <Servicos />
            <Transparencia />
            <Faq />
            <Localizacao />
            <FinalCta />
          </main>
        )}
      </div>

      <Footer onNavigate={navigate} onSection={irParaSecao} />
      <WhatsAppFab />
    </>
  )
}
