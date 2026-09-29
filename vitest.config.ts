import path from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * Configuração dos testes unitários.
 *
 * O ambiente padrão é `node`, e não `jsdom`: a lógica testada aqui — triagem
 * do diagnóstico, horário no fuso de Goiânia, geração de JSON-LD — não toca no
 * DOM. Subir um jsdom por arquivo custaria centenas de milissegundos cada, e o
 * teste que roda rápido é o teste que se roda.
 *
 * A cobertura mira `src/lib`, que é onde mora a decisão. Componentes de
 * apresentação ficam para o Playwright, que os exercita no navegador de
 * verdade — testar `<Reveal>` com jsdom mediria se o React renderiza, não se a
 * animação funciona.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      // Ficam de fora os invólucros de API de navegador e de rede: medição
      // (`analytics`, `pixel`, `observability`), a fila de rastro com os
      // ouvintes de evento (`rastro`), o cliente HTTP (`api`) e o
      // `localStorage` (`storage`). Cobri-los mediria o mock; quem os
      // exercita de verdade é o Playwright, no navegador. O que sobra é
      // decisão pura, e é aí que o mínimo de 85% tem sentido.
      exclude: [
        'src/lib/analytics.ts',
        'src/lib/observability.ts',
        'src/lib/pixel.ts',
        'src/lib/rastro.ts',
        'src/lib/api.ts',
        'src/lib/storage.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
