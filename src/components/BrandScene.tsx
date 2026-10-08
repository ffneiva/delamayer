import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { markOutline } from '@/lib/mark'

/**
 * O monograma da marca, em ouro — a peça central do site.
 *
 * Cinco decisões carregam a cena, e todas servem à mesma restrição: **nenhum
 * byte vindo de terceiro, nenhum asset binário no repositório.**
 *
 * 1. **Ambiente cozido em código, sem HDRI.** Metal sem environment map fica
 *    amarelo chapado: o que dá a leitura de "polido" são as faixas de luz
 *    refletidas. Em vez de baixar um `.hdr` de estúdio (2–8 MB, num CDN que um
 *    dia sai do ar), monta-se uma cena auxiliar com retângulos emissivos —
 *    softboxes — e o `PMREMGenerator` a converte, uma vez, no cubemap que a
 *    `MeshStandardMaterial` consome.
 *
 * 2. **Geometria vinda do vetor da marca.** O símbolo é extrudado a partir dos
 *    mesmos pontos que desenham o favicon (ver src/lib/mark.ts). Não é uma
 *    aproximação do logotipo: é o logotipo, com espessura.
 *
 * 3. **Três peças, e não uma.** O traço da marca é um só, mas ele se cruza
 *    consigo mesmo; `markOutline` já o devolve cortado em três fitas que se
 *    encaixam sem fenda. Extrudá-las separadamente custa duas chamadas de
 *    desenho a mais e habilita a coisa mais interessante da cena: **a peça se
 *    monta na entrada**, cada fita vindo da sua própria direção.
 *
 * 4. **Poça de luz no lugar de reflexo.** A primeira versão espelhava a peça
 *    abaixo de um chão virtual. Não coube: o quadro tem ~3,9 unidades de altura
 *    e a peça ocupa 1,6 — sobra menos do que o espelho precisaria, e o que
 *    aparecia era um pedaço de ouro cortado na borda inferior, sem leitura de
 *    reflexo nenhuma. O que ficou é o que a composição comporta: uma sombra de
 *    contato e um halo elíptico quente logo abaixo da peça.
 *
 * 5. **Sem @react-three/drei.** A biblioteca resolveria ambiente, flutuação,
 *    reflexo e sombra de contato, mas traz junto os loaders de HDRI e gainmap
 *    que este site nunca usa — ~250 kB de JS para efeitos que couberam aqui.
 *
 * A cena não monta com `prefers-reduced-motion`, nem sem WebGL (ver Cena3D).
 * No celular ela monta em modo `compacto`: menos partículas, sem a segunda
 * camada de poeira, sem antisserrilhado e com metade da resolução — o que sai é
 * o que custa fill rate, que é o gargalo num aparelho de bolso.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Estúdio virtual
// ─────────────────────────────────────────────────────────────────────────────

type Softbox = {
  position: [number, number, number]
  scale: [number, number]
  intensity: number
  color: string
  rotation?: [number, number, number]
}

/**
 * Cada retângulo só existe no reflexo — é ele que desenha o brilho no ouro.
 *
 * As intensidades são muito mais altas do que a intuição sugere, e isso custou
 * uma iteração: com preenchimento em ~1, o monograma saía parecendo um contorno
 * vazado. Metal com `metalness` alto não tem cor própria, só reflexo, e sobre
 * fundo preto um reflexo fraco é indistinguível de reflexo nenhum.
 */
const SOFTBOXES: Softbox[] = [
  // Key: a faixa larga que corre pela frente e define a aresta do bisel.
  { position: [0, 3.2, 4.2], scale: [11, 4.5], intensity: 11, color: '#fff4dd' },
  // Rim quente atrás, para separar o objeto do fundo com um contorno de ouro.
  { position: [-4.5, 1.2, -4], scale: [7, 7], intensity: 8, color: '#ffd489' },
  // Kicker frio — sem ele o ouro fica melado, sem contraste de temperatura.
  { position: [5, -1.4, 2], scale: [6, 4], intensity: 5, color: '#cfe0f5' },
  // Barra fina inclinada: vira o "risco" característico do metal polido.
  {
    position: [1.5, 4, -1],
    scale: [0.35, 9],
    intensity: 16,
    color: '#ffffff',
    rotation: [0, 0, Math.PI / 5],
  },
  // Segunda barra, cruzada com a primeira: são as duas que fazem o brilho
  // varrer a superfície quando a peça gira, em vez de acender e apagar.
  {
    position: [-2.4, -3, 2],
    scale: [0.3, 7],
    intensity: 9,
    color: '#fff6e4',
    rotation: [0, 0, -Math.PI / 3.4],
  },

  // Preenchimento: largos, por todos os lados.
  { position: [-7, 0, 3], scale: [9, 9], intensity: 3.4, color: '#e8d5ad' },
  { position: [7, 1.5, -2], scale: [9, 9], intensity: 3.4, color: '#dcc79c' },
  { position: [0, -5, 1], scale: [12, 6], intensity: 2.6, color: '#b8a888' },
  { position: [0, 1, -8], scale: [14, 10], intensity: 4, color: '#d0b98d' },
]

function texturaDeCeu(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Degradê vertical, e não preto chapado: mesmo virado para o "chão", o
  // monograma reflete alguma coisa. É esse piso de luminância que impede o
  // objeto de desaparecer quando o ponteiro o inclina.
  const gradiente = ctx.createLinearGradient(0, 0, 0, 256)
  gradiente.addColorStop(0, '#a08f65') // zênite: o teto quente do estúdio
  gradiente.addColorStop(0.45, '#5c5138')
  gradiente.addColorStop(0.72, '#2a251a')
  gradiente.addColorStop(1, '#0d0b08') // chão
  ctx.fillStyle = gradiente
  ctx.fillRect(0, 0, 4, 256)

  const textura = new THREE.CanvasTexture(canvas)
  textura.mapping = THREE.EquirectangularReflectionMapping
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

function montarAmbiente(gl: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(gl)
  const estudio = new THREE.Scene()
  estudio.background = texturaDeCeu()

  const descartaveis: Array<THREE.BufferGeometry | THREE.Material> = []

  for (const box of SOFTBOXES) {
    const geometria = new THREE.PlaneGeometry(box.scale[0], box.scale[1])
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(box.color).multiplyScalar(box.intensity),
      side: THREE.DoubleSide,
    })
    const malha = new THREE.Mesh(geometria, material)
    malha.position.set(...box.position)
    if (box.rotation) malha.rotation.set(...box.rotation)
    else malha.lookAt(0, 0, 0)
    estudio.add(malha)
    descartaveis.push(geometria, material)
  }

  const alvo = pmrem.fromScene(estudio, 0.18)

  // A cena auxiliar já cumpriu seu papel: o conteúdo dela vive agora na textura.
  pmrem.dispose()
  for (const item of descartaveis) item.dispose()
  ;(estudio.background as THREE.CanvasTexture).dispose()

  return alvo.texture
}

/**
 * Publica o mapa na cena via `attach="environment"`.
 *
 * O caminho imperativo (`scene.environment = tex` num useEffect) funciona, mas
 * mexe num objeto devolvido por hook e deixa a limpeza por conta de quem
 * escreve. Com `attach`, é o próprio R3F que faz o vínculo na montagem e
 * restaura o valor anterior na desmontagem.
 */
function AmbienteDeEstudio() {
  const gl = useThree((s) => s.gl)
  const cena = useThree((s) => s.scene)
  const textura = useMemo(() => montarAmbiente(gl), [gl])

  useEffect(() => () => textura.dispose(), [textura])

  /**
   * O estúdio inteiro gira devagar em torno da peça.
   *
   * É o efeito de melhor retorno da cena, e custa uma linha: o cubemap é cozido
   * uma vez só, e girá-lo é trocar um uniforme por quadro. O que o olho vê é o
   * reflexo VARRENDO a superfície — as faixas de luz correndo pelo bisel — em
   * vez de um brilho fixo que só se move quando o objeto se move. É a diferença
   * entre uma peça de metal e uma foto de uma peça.
   *
   * Sentido contrário ao da deriva do monograma, de propósito: girando juntos,
   * o reflexo ficaria estático em relação à superfície e o efeito sumiria.
   */
  useFrame((estado) => {
    // `environmentRotation` chegou no r163. A guarda existe porque a cena é
    // carregada sob demanda, e um three.js mais antigo em cache do navegador
    // derrubaria a cena inteira num TypeError.
    if (cena.environmentRotation) {
      cena.environmentRotation.y = -estado.clock.elapsedTime * 0.055
    }
  })

  return <primitive object={textura} attach="environment" />
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometria
// ─────────────────────────────────────────────────────────────────────────────

/**
 * As três fitas da marca, extrudadas separadamente.
 *
 * O bisel é o detalhe que faz a peça parecer usinada em vez de recortada: ele
 * cria a aresta fina que captura a luz da key light e desenha o contorno
 * brilhante do símbolo. Sem ele, as bordas ficam pretas e o objeto some no
 * fundo.
 */
function useGeometrias() {
  return useMemo(
    () =>
      markOutline().map(({ externo, furos }) => {
        const shape = new THREE.Shape(externo.map((p) => new THREE.Vector2(p.x, p.y)))
        for (const furo of furos) {
          shape.holes.push(new THREE.Path(furo.map((p) => new THREE.Vector2(p.x, p.y))))
        }
        return new THREE.ExtrudeGeometry(shape, {
          depth: 0.17,
          bevelEnabled: true,
          bevelThickness: 0.024,
          bevelSize: 0.02,
          bevelSegments: 4,
          curveSegments: 12,
        })
      }),
    [],
  )
}

/**
 * De onde cada fita vem na animação de montagem.
 *
 * A direção de cada uma acompanha o próprio traço: a diagonal longa entra pelo
 * canto inferior direito, na linha dela; o "D" entra pela esquerda; a segunda
 * diagonal, por baixo. O escalonamento é curto — a peça precisa estar inteira
 * antes de a pessoa terminar de ler o título.
 */
const ENTRADA = [
  { atraso: 0.0, de: [2.3, -2.0, 1.1] as const, giro: [0.2, 0.9, 0.6] as const },
  { atraso: 0.13, de: [-2.6, 0.7, -0.9] as const, giro: [0.35, -0.9, -0.35] as const },
  { atraso: 0.26, de: [-1.2, -2.3, 1.0] as const, giro: [-0.5, 0.7, 0.8] as const },
]

const DURACAO_ENTRADA = 1.35

// ─────────────────────────────────────────────────────────────────────────────
// Movimento
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Posição do ponteiro normalizada em [-1, 1], lida da window.
 *
 * O `state.pointer` do R3F não serve aqui: o <Canvas> é `pointer-events: none`
 * (para não roubar cliques do texto que fica por cima), e sem eventos chegando
 * ao canvas aquele valor nunca sai de (0, 0). Um listener na window resolve — e
 * de quebra o monograma reage ao mouse mesmo quando ele está sobre o título.
 */
function usePonteiroDaJanela() {
  const ponteiro = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const aoMover = (e: PointerEvent) => {
      ponteiro.current.x = (e.clientX / window.innerWidth) * 2 - 1
      ponteiro.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', aoMover, { passive: true })
    return () => window.removeEventListener('pointermove', aoMover)
  }, [])

  return ponteiro
}

/**
 * Onde a cena está na tela, de −1 (saindo por cima) a +1 (entrando por baixo).
 *
 * A primeira versão usava o progresso da PÁGINA inteira, e o resultado foi um
 * bug visível: no fecho do site a rolagem já estava em ~95%, o giro acumulado
 * passava de 85°, e o monograma aparecia **de perfil** — uma lasca dourada de
 * três pixels de largura. Um objeto que existe em duas seções precisa de uma
 * referência local, não global.
 *
 * A leitura é feita fora do ciclo de render do React: um `useState` aqui
 * re-renderizaria a árvore da cena a cada evento de scroll para mudar um número
 * que só o `useFrame` consome.
 */
function usePosicaoNaTela(gl: THREE.WebGLRenderer) {
  const posicao = useRef(0)

  useEffect(() => {
    const canvas = gl.domElement
    const medir = () => {
      const caixa = canvas.getBoundingClientRect()
      const centro = caixa.top + caixa.height / 2
      const meiaTela = window.innerHeight / 2
      posicao.current = Math.max(-1.5, Math.min(1.5, (centro - meiaTela) / meiaTela))
    }
    medir()
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir, { passive: true })
    return () => {
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
    }
  }, [gl])

  return posicao
}

/**
 * Uma luz pontual que persegue o cursor.
 *
 * O environment map dá o reflexo do estúdio, que é fixo em relação ao mundo.
 * Esta luz dá o realce que responde à MÃO de quem está olhando: ela desliza
 * pelo bisel conforme o mouse anda, e é o que transforma a peça de
 * "renderizada" em "presente".
 *
 * Sem ponteiro — celular, tablet —, ela orbita sozinha. O movimento é o mesmo;
 * o que muda é quem o comanda.
 */
function LuzDoPonteiro({ compacto }: { compacto: boolean }) {
  const luz = useRef<THREE.PointLight>(null)
  const ponteiro = usePonteiroDaJanela()
  const viewport = useThree((s) => s.viewport)

  useFrame((estado, delta) => {
    const l = luz.current
    if (!l) return

    let alvoX: number
    let alvoY: number

    if (compacto) {
      const t = estado.clock.elapsedTime
      alvoX = Math.cos(t * 0.42) * viewport.width * 0.42
      alvoY = Math.sin(t * 0.31) * viewport.height * 0.34
    } else {
      alvoX = ponteiro.current.x * viewport.width * 0.62
      alvoY = ponteiro.current.y * viewport.height * 0.55
    }

    const k = 1 - 0.004 ** delta
    l.position.x += (alvoX - l.position.x) * k
    l.position.y += (alvoY - l.position.y) * k
  })

  return (
    <pointLight
      ref={luz}
      position={[0, 0, 3.2]}
      intensity={26}
      distance={16}
      decay={2}
      color="#fff3d6"
    />
  )
}

/** Largura aproximada do monograma, em unidades de cena. */
const LARGURA_MARCA = 2.1

/**
 * Escala o monograma para caber na largura visível.
 *
 * A câmera é fixa, então o que muda entre telas é a proporção: num desktop
 * 16:9 cabem ~9 unidades de cena na horizontal; num celular em pé, ~4. Com
 * escala constante, o mesmo símbolo que fica elegante no monitor invade a tela
 * inteira do telefone.
 *
 * `viewport` já vem do R3F em unidades de mundo no plano z=0 e é recalculado no
 * resize — então basta uma regra de três. O `ocupacao` diferente no celular
 * existe porque lá a cena tem a largura toda, e não 52% dela.
 */
function useEscalaAjustada(ocupacao: number) {
  const viewport = useThree((s) => s.viewport)
  return Math.min(1.7, Math.max(0.42, (viewport.width * ocupacao) / LARGURA_MARCA))
}

/** Altura do "chão" virtual sob a peça. */
const CHAO = -1.22

// ─────────────────────────────────────────────────────────────────────────────
// A peça
// ─────────────────────────────────────────────────────────────────────────────

type MonogramaProps = {
  escala: number
  ocupacao: number
  giroPorScroll: number
}

function Monograma({ escala, ocupacao, giroPorScroll }: MonogramaProps) {
  const orientacao = useRef<THREE.Group>(null)
  const flutuacao = useRef<THREE.Group>(null)
  const fitas = useRef<Array<THREE.Mesh | null>>([])
  const inicio = useRef(0)

  const ponteiro = usePonteiroDaJanela()
  const gl = useThree((estado) => estado.gl)
  const posicao = usePosicaoNaTela(gl)
  const ajuste = useEscalaAjustada(ocupacao)
  const geometrias = useGeometrias()

  /**
   * Um material POR fita, e não um compartilhado.
   *
   * O motivo é o brilho de montagem: cada fita esfria no seu tempo, e
   * `emissiveIntensity` é propriedade do material. Com um material só, as três
   * apagariam juntas — e o escalonamento da entrada, que é o efeito inteiro,
   * deixaria de ser visível.
   */
  const materiais = useMemo(
    () =>
      ENTRADA.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: '#e8be6b',
            // 0,88 e não 1: metal puro não tem cor difusa nenhuma, só reflexo —
            // e no pior ângulo de giro isso deixava a peça cinza. A fração de
            // difusa que sobra garante que ela seja dourada sempre.
            metalness: 0.88,
            roughness: 0.24,
            envMapIntensity: 2.8,
            emissive: new THREE.Color('#ffb44a'),
            emissiveIntensity: 0,
          }),
      ),
    [],
  )

  useEffect(() => {
    return () => {
      for (const m of materiais) m.dispose()
      for (const g of geometrias) g.dispose()
    }
  }, [materiais, geometrias])

  useFrame((estado, delta) => {
    if (!inicio.current) inicio.current = estado.clock.elapsedTime
    const t = estado.clock.elapsedTime
    const desdeAEntrada = t - inicio.current

    /**
     * Quanto a peça está desmontada por causa da rolagem.
     *
     * `posicao` vale 0 com a cena centralizada e cresce em módulo conforme ela
     * se afasta — negativo saindo por cima, positivo ainda chegando por baixo.
     * As fitas se separam pelo caminho por onde vieram nos DOIS sentidos, e a
     * zona morta no meio garante que a peça fique inteira enquanto está sendo
     * olhada de frente.
     *
     * Antes isto só valia para `posicao` negativo, e a consequência era que a
     * peça do fecho só se montava na PRIMEIRA vez — aquela montagem vinha da
     * animação de entrada, que roda uma vez por montagem. Agora ela é dirigida
     * pela rolagem, então desfaz e refaz sempre que se sobe e desce.
     */
    const ZONA_MORTA = 0.32
    const separacao = Math.max(0, Math.abs(posicao.current) - ZONA_MORTA) * 0.75

    // ── Montagem: cada fita vem da sua direção e trava no lugar ──────────────
    for (let i = 0; i < ENTRADA.length; i++) {
      const { atraso, de, giro } = ENTRADA[i]
      const bruto = Math.min(1, Math.max(0, (desdeAEntrada - atraso) / DURACAO_ENTRADA))
      // easeOutQuint: a fita chega rápido e desacelera longo, que é o que faz
      // parecer que ela "assenta" em vez de simplesmente parar.
      const p = 1 - (1 - bruto) ** 5
      const deslocamento = 1 - p + separacao

      const malha = fitas.current[i]
      if (!malha) continue
      malha.position.set(de[0] * deslocamento, de[1] * deslocamento, de[2] * deslocamento)
      malha.rotation.set(giro[0] * deslocamento, giro[1] * deslocamento, giro[2] * deslocamento)

      // A fita chega incandescente e esfria ao assentar. O expoente concentra o
      // brilho no fim do voo: com decaimento linear ela pareceria uma luz sendo
      // apagada, e não metal perdendo calor.
      materiais[i].emissiveIntensity = (1 - p) ** 2 * 1.1
    }

    // ── Orientação: deriva lenta + ponteiro + posição na tela ────────────────
    //
    // A deriva existe para a peça nunca ficar parada: é ela que faz o brilho
    // varrer a superfície mesmo sem ninguém mexer o mouse — e é a única fonte
    // de movimento no celular, onde não há ponteiro.
    const k = 1 - 0.0015 ** delta
    const alvoY =
      Math.sin(t * 0.17) * 0.34 + ponteiro.current.x * 0.4 + posicao.current * giroPorScroll
    const alvoX = Math.sin(t * 0.23) * 0.08 - ponteiro.current.y * 0.18

    if (orientacao.current) {
      orientacao.current.rotation.y += (alvoY - orientacao.current.rotation.y) * k
      orientacao.current.rotation.x += (alvoX - orientacao.current.rotation.x) * k
    }

    // ── Flutuação ociosa: duas senoides de período diferente, para o
    //    movimento não parecer um metrônomo.
    if (flutuacao.current) {
      flutuacao.current.position.y = Math.sin(t * 0.85) * 0.07
      flutuacao.current.rotation.z = Math.sin(t * 0.6) * 0.035
    }
  })

  const escalaFinal = escala * ajuste

  return (
    <>
      <group
        ref={orientacao}
        scale={escalaFinal}
        position={[0, 0.08, 0]}
        rotation={[0.06, -0.35, 0]}
      >
        <group ref={flutuacao}>
          {geometrias.map((geometria, i) => (
            <mesh
              // biome-ignore lint/suspicious/noArrayIndexKey: as três fitas são fixas e a ordem é a identidade
              key={i}
              ref={(m) => {
                fitas.current[i] = m
              }}
              geometry={geometria}
              material={materiais[i]}
            />
          ))}
        </group>
      </group>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambiente da cena
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Poça de luz sob a peça.
 *
 * Um plano elíptico com degradê radial quente, deitado no chão e em mistura
 * aditiva. Ele faz o trabalho que o reflexo faria — dizer que existe uma
 * superfície ali embaixo — sem precisar da altura de quadro que um espelho
 * exige, e sem nenhum dos problemas de normal invertida que escalar por −1 traz.
 */
function PocaDeLuz({ ocupacao }: { ocupacao: number }) {
  const ajuste = useEscalaAjustada(ocupacao)
  const textura = useMemo(() => {
    const lado = 256
    const canvas = document.createElement('canvas')
    canvas.width = lado
    canvas.height = lado
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2)
    g.addColorStop(0, 'rgba(233,199,126,0.55)')
    g.addColorStop(0.3, 'rgba(191,142,58,0.22)')
    g.addColorStop(0.65, 'rgba(120,84,24,0.06)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, lado, lado)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => textura.dispose(), [textura])

  return (
    <mesh position={[0, CHAO + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={ajuste}>
      <planeGeometry args={[6, 3.4]} />
      <meshBasicMaterial
        map={textura}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/**
 * Sombra de contato: um plano com textura radial, deitado no chão.
 *
 * Uma sombra real exigiria shadow map e um segundo passe de render — caro para
 * um borrão que ninguém olha de perto.
 */
function SombraDeContato({ ocupacao }: { ocupacao: number }) {
  const ajuste = useEscalaAjustada(ocupacao)
  const textura = useMemo(() => {
    const lado = 256
    const canvas = document.createElement('canvas')
    canvas.width = lado
    canvas.height = lado
    const ctx = canvas.getContext('2d')!

    const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.22)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, lado, lado)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => textura.dispose(), [textura])

  return (
    <mesh position={[0, CHAO + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={ajuste}>
      <planeGeometry args={[7, 4]} />
      <meshBasicMaterial map={textura} transparent depthWrite={false} />
    </mesh>
  )
}

/**
 * Halo dourado atrás da peça.
 *
 * É o mais barato dos efeitos de "bloom" — um plano com degradê radial e mistura
 * aditiva, atrás de tudo. Um bloom de verdade exigiria pós-processamento, que
 * significa render targets, dois passes e ~40 kB de `postprocessing`. Aqui o
 * que se quer é só o objeto não flutuar sobre um vazio absoluto.
 */
function Halo({ escala }: { escala: number }) {
  const textura = useMemo(() => {
    const lado = 256
    const canvas = document.createElement('canvas')
    canvas.width = lado
    canvas.height = lado
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2)
    g.addColorStop(0, 'rgba(212,168,85,0.5)')
    g.addColorStop(0.35, 'rgba(176,124,36,0.19)')
    g.addColorStop(0.7, 'rgba(120,84,24,0.05)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, lado, lado)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => textura.dispose(), [textura])

  return (
    <mesh position={[0, 0.1, -1.6]} scale={5.2 * escala}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={textura}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/**
 * Poeira de ouro suspensa, em duas camadas de profundidade.
 *
 * Custa duas chamadas de desenho (sem iluminação) e resolve um problema real:
 * sem nada entre a câmera e o fundo preto, o monograma parece colado na tela em
 * vez de flutuar num espaço. As duas camadas giram em velocidades diferentes —
 * é a diferença entre elas que produz a sensação de paralaxe.
 *
 * `sizeAttenuation` é o que faz as partículas de trás ficarem menores; é a
 * única outra pista de profundidade que a cena tem.
 */
function PoeiraDeOuro({
  total,
  raio,
  tamanho,
  velocidade,
}: {
  total: number
  raio: number
  tamanho: number
  velocidade: number
}) {
  const pontos = useRef<THREE.Points>(null)

  const geometria = useMemo(() => {
    const posicoes = new Float32Array(total * 3)
    for (let i = 0; i < total; i++) {
      // Distribuição em casca esférica: raio na faixa, ângulos uniformes.
      const r = raio + Math.random() * raio * 0.9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      posicoes[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      posicoes[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.62
      posicoes[i * 3 + 2] = r * Math.cos(phi)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posicoes, 3))
    return g
  }, [total, raio])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#e8cb8a',
        size: tamanho,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [tamanho],
  )

  useEffect(() => {
    return () => {
      geometria.dispose()
      material.dispose()
    }
  }, [geometria, material])

  useFrame((_, delta) => {
    if (pontos.current) {
      pontos.current.rotation.y += delta * velocidade
      pontos.current.rotation.x += delta * velocidade * 0.3
    }
  })

  return <points ref={pontos} geometry={geometria} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Montagem
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  /** Tamanho relativo da peça. 1 é o do herói no desktop. */
  escala?: number
  /** Quanto a rolagem gira a peça, em radianos por tela atravessada. */
  giroPorScroll?: number
  /**
   * Modo econômico para celular: menos partículas, sem reflexo e resolução
   * menor. A peça e a iluminação continuam idênticas — o que sai é o que
   * custa fill rate, que é o gargalo num aparelho de bolso.
   */
  compacto?: boolean
  /**
   * `false` congela o laço de render sem destruir nada.
   *
   * É o que permite manter a cena montada fora da tela sem gastar GPU: o
   * contexto, o cubemap do estúdio e a geometria continuam de pé, e voltar a
   * desenhar custa um quadro. Ver o cabeçalho de components/Cena3D.
   */
  ativo?: boolean
}

function Cena({ escala, giroPorScroll, compacto }: Required<Omit<Props, 'ativo'>>) {
  // No celular a cena ocupa a largura toda do herói; no desktop, 52% dela.
  const ocupacao = compacto ? 0.42 : 0.5

  return (
    <>
      <AmbienteDeEstudio />
      <ambientLight intensity={0.35} color="#ffe9c2" />
      <directionalLight position={[3, 5, 6]} intensity={2.4} color="#fff3d8" />
      <directionalLight position={[-5, -1, 3]} intensity={1.1} color="#ffd08a" />
      <LuzDoPonteiro compacto={compacto} />

      <Halo escala={escala} />
      <PoeiraDeOuro total={compacto ? 70 : 150} raio={2.2} tamanho={0.022} velocidade={0.045} />
      {!compacto && <PoeiraDeOuro total={90} raio={4.2} tamanho={0.014} velocidade={-0.022} />}

      <Monograma escala={escala} ocupacao={ocupacao} giroPorScroll={giroPorScroll} />

      <SombraDeContato ocupacao={ocupacao} />
      <PocaDeLuz ocupacao={ocupacao} />
    </>
  )
}

export default function BrandScene({
  escala = 1,
  giroPorScroll = 0,
  compacto = false,
  ativo = true,
}: Props) {
  return (
    <Canvas
      // dpr limitado: em telas 3x o custo por fragmento triplica sem ganho
      // perceptível num objeto que está sempre em movimento. No celular o teto
      // é ainda mais baixo, porque lá ele custa bateria.
      dpr={[1, compacto ? 1.4 : 1.75]}
      gl={{
        antialias: !compacto,
        alpha: true,
        powerPreference: compacto ? 'default' : 'high-performance',
      }}
      camera={{ position: [0, 0.3, 6.4], fov: 34 }}
      frameloop={ativo ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
    >
      <Cena escala={escala} giroPorScroll={giroPorScroll} compacto={compacto} />
    </Canvas>
  )
}
