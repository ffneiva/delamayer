import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { MIDIA } from '@/lib/business'

/**
 * A matéria em TV aberta.
 *
 * É a única prova social verificável que existe hoje: não há avaliação pública
 * no Google nem depoimento que se possa atribuir a uma pessoa real. Inventar
 * um carrossel de "clientes satisfeitos" seria mais fácil e mais bonito — e
 * seria a primeira mentira do site, num site cujo argumento inteiro é não
 * mentir.
 *
 * O vídeo NÃO é embutido de saída. Um iframe do YouTube custa ~700 kB, abre
 * conexões para três domínios do Google e planta cookies antes de a pessoa
 * pedir. Aqui existe uma capa estática e o iframe só nasce depois do clique —
 * o padrão "facade", que também é o que mantém a CSP enxuta.
 */
export function Midia() {
  const [tocando, setTocando] = useState(false)

  return (
    <section className="py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="label-mono mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold-700" />
              Na mídia
            </p>

            <h2 className="font-display text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.08] text-plat-50">
              {MIDIA.titulo}
            </h2>

            <p className="mt-6 text-[0.98rem] leading-relaxed text-plat-400">{MIDIA.chamada}</p>

            <p className="mt-7 font-mono text-xs tracking-[0.16em] text-gold-400 uppercase">
              {MIDIA.veiculo}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-edge bg-ink">
              {tocando ? (
                <iframe
                  // `autoplay=1` porque o clique já foi a intenção de assistir:
                  // exigir um segundo clique dentro do player é atrito puro.
                  src={`https://www.youtube-nocookie.com/embed/${MIDIA.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={MIDIA.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setTocando(true)}
                  data-cursor="Assistir"
                  aria-label={`Assistir: ${MIDIA.titulo}`}
                  className="group absolute inset-0 flex items-center justify-center"
                >
                  {/* A capa vem do próprio YouTube, em vez de um JPG no
                      repositório: é uma requisição de imagem, sem script e sem
                      cookie, e continua correta se a miniatura do vídeo mudar. */}
                  <img
                    src={`https://i.ytimg.com/vi/${MIDIA.youtubeId}/maxresdefault.jpg`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-vault)] group-hover:scale-[1.03] group-hover:opacity-70"
                  />

                  <span
                    aria-hidden
                    className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold-400/60 bg-obsidian/60 backdrop-blur-sm transition-[transform,border-color,background-color] duration-500 ease-[var(--ease-vault)] group-hover:scale-110 group-hover:border-gold-200 group-hover:bg-obsidian/80"
                  >
                    {/* Triângulo de "play" deslocado 2px à direita: o centro
                        óptico de um triângulo não é o seu centro geométrico. */}
                    <span className="ml-[3px] block h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-gold-100" />
                  </span>
                </button>
              )}
            </div>

            <p className="mt-4 text-right text-xs text-plat-600">
              <a
                href={MIDIA.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-plat-700 underline-offset-4 transition-colors hover:text-plat-400"
              >
                Assistir no YouTube
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
