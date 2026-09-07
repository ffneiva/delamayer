import { Canvas, type ThreeElements, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { markOutline } from '@/lib/mark'

/**
 * O monograma da marca, em ouro de verdade.
 *
 * Quatro decisões carregam a cena — e as quatro existem para servir à mesma
 * restrição: **nenhum byte vindo de terceiro, nenhum asset binário no
 * repositório.**
 *
 * 1. **Ambiente cozido em código, sem HDRI.** Metal sem environment map fica
 *    amarelo-chapado: o que dá a leitura de "polido" são as faixas de luz
 *    refletidas. Em vez de baixar um `.hdr` de estúdio (2–8 MB, hospedado num
 *    CDN que um dia sai do ar), monta-se uma cena auxiliar com retângulos
 *    emissivos — softboxes — e o `PMREMGenerator` a converte, uma única vez,
 *    no cubemap que a `MeshStandardMaterial` consome.
 *
 * 2. **Geometria vinda do vetor da marca.** O "D" cortado é extrudado a partir
 *    dos mesmos pontos que desenham o favicon (ver src/lib/mark.ts). Não é uma
 *    aproximação do logotipo: é o logotipo, com espessura. Ajustar a espessura
 *    do traço muda os dois ao mesmo tempo.
 *
 * 3. **Sem @react-three/drei.** A biblioteca resolveria ambiente, flutuação e
 *    sombra de contato, mas traz junto os loaders de HDRI e gainmap que este
 *    site nunca usa — ~250 kB de JS para três efeitos que cabem em 80 linhas.
 *
 * 4. **Ouro, e não amarelo.** A cor base vem do arquivo da marca, mas o que
 *    faz o material parecer ouro é a combinação de `metalness: 1` com
 *    reflexo colorido: as softboxes são levemente quentes, e é a luz refletida
 *    — não o `color` — que produz o tom.
 *
 * A cena é carregada sob `React.lazy` (ver sections/Hero) e nunca monta em
 * `prefers-reduced-motion` nem em tela pequena.
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
 * O estúdio envolve o objeto, inclusive por trás e por baixo. A primeira
 * versão tinha só luzes frontais, e o monograma "apagava" sempre que o
 * ponteiro o girava para longe delas: metal com `metalness: 1` não tem cor
 * própria, só reflexo, e o que havia atrás era preto.
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

  // Preenchimento: largos, por todos os lados, e MUITO mais fortes do que a
  // intuição sugere. O primeiro ajuste desta cena usou intensidade ~1 aqui e o
  // monograma saiu parecendo um contorno vazado: com `metalness: 1` o objeto
  // não tem cor própria, só reflexo, e um preenchimento fraco sobre fundo preto
  // é indistinguível de não ter preenchimento nenhum.
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
  const textura = useMemo(() => montarAmbiente(gl), [gl])

  useEffect(() => () => textura.dispose(), [textura])

  return <primitive object={textura} attach="environment" />
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometria do monograma
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converte os contornos vetoriais da marca em geometria extrudada.
 *
 * O bisel é o detalhe que faz a peça parecer usinada em vez de recortada: ele
 * cria a aresta fina que captura a luz da key light e desenha o contorno
 * brilhante do símbolo. Sem ele, as bordas ficam pretas e o objeto some no
 * fundo.
 */
function useGeometriaDaMarca() {
  return useMemo(() => {
    const shapes = markOutline().map(({ externo, furos }) => {
      const shape = new THREE.Shape(externo.map((p) => new THREE.Vector2(p.x, p.y)))
      for (const furo of furos) {
        shape.holes.push(new THREE.Path(furo.map((p) => new THREE.Vector2(p.x, p.y))))
      }
      return shape
    })

    return new THREE.ExtrudeGeometry(shapes, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.018,
      bevelSegments: 4,
      curveSegments: 12,
    }).center()
  }, [])
}

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

/** Largura aproximada do monograma, em unidades de cena. */
const LARGURA_MARCA = 2.1

/**
 * Escala o monograma para caber na largura visível.
 *
 * A câmera é fixa, então o que muda entre telas é a proporção: num desktop
 * 16:9 cabem ~9 unidades de cena na horizontal; num celular em pé, ~2. Com
 * escala constante, o mesmo símbolo que fica elegante no monitor invade a tela
 * inteira do telefone.
 *
 * `viewport` já vem do R3F em unidades de mundo no plano z=0, e é recalculado
 * no resize — então basta uma regra de três.
 */
function useEscalaAjustada() {
  const viewport = useThree((s) => s.viewport)
  return Math.min(1.7, Math.max(0.45, (viewport.width * 0.5) / LARGURA_MARCA))
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
 * Com a medida local, cada cena gira em torno de zero quando está centralizada,
 * que é exatamente quando alguém a está olhando.
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

function Monograma({
  giroPorScroll = 0,
  ...props
}: ThreeElements['group'] & { giroPorScroll?: number }) {
  const externo = useRef<THREE.Group>(null)
  const interno = useRef<THREE.Group>(null)
  const ponteiro = usePonteiroDaJanela()
  const gl = useThree((estado) => estado.gl)
  const posicao = usePosicaoNaTela(gl)
  const ajuste = useEscalaAjustada()
  const geometria = useGeometriaDaMarca()

  const ouro = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e8be6b',
        // 0,88 em vez de 1: metal puro não tem cor difusa nenhuma, só reflexo —
        // e no pior ângulo de giro isso deixava a peça cinza. A fração de
        // difusa que sobra aqui garante que ela seja dourada sempre.
        metalness: 0.88,
        // Rugosidade espalha o reflexo em vez de concentrá-lo num ponto: o
        // brilho fica menos "liga/desliga" conforme a peça gira.
        roughness: 0.24,
        envMapIntensity: 2.8,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      ouro.dispose()
      geometria.dispose()
    }
  }, [ouro, geometria])

  useFrame((state, delta) => {
    // Perseguição amortecida do ponteiro. O fator exponencial mantém a mesma
    // sensação a 60 ou a 144 Hz — um `lerp` de passo fixo ficaria mais rápido
    // em telas mais velozes.
    if (externo.current) {
      // Amplitude curta de propósito: com giro largo, o ponteiro no canto da
      // tela leva a peça a um ângulo em que ela reflete só o fundo escuro — e
      // some. Aqui ela nunca sai do cone de luz.
      const k = 1 - 0.0015 ** delta
      // A rolagem entra somada ao ponteiro: a peça continua respondendo ao
      // mouse, mas também vira conforme atravessa a tela.
      const alvoY = ponteiro.current.x * 0.42 + posicao.current * giroPorScroll
      externo.current.rotation.y += (alvoY - externo.current.rotation.y) * k
      externo.current.rotation.x += (-ponteiro.current.y * 0.2 - externo.current.rotation.x) * k
    }

    // Flutuação ociosa: duas senoides de período diferente, para o movimento
    // não parecer um metrônomo.
    if (interno.current) {
      const t = state.clock.elapsedTime
      interno.current.position.y = Math.sin(t * 0.85) * 0.07
      interno.current.rotation.z = Math.sin(t * 0.6) * 0.035
    }
  })

  return (
    <group ref={externo} {...props} scale={(props.scale as number) * ajuste}>
      <group ref={interno}>
        <mesh geometry={geometria} material={ouro} />
      </group>
    </group>
  )
}

/**
 * Sombra de contato falsa: um plano com textura radial.
 *
 * Uma sombra real exigiria shadow map e um segundo passe de render — caro para
 * um borrão que ninguém olha de perto.
 */
function SombraDeContato() {
  const ajuste = useEscalaAjustada()
  const textura = useMemo(() => {
    const lado = 256
    const canvas = document.createElement('canvas')
    canvas.width = lado
    canvas.height = lado
    const ctx = canvas.getContext('2d')!

    const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.5)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.2)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, lado, lado)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => textura.dispose(), [textura])

  return (
    <mesh position={[0, -1.55 * ajuste, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={ajuste}>
      <planeGeometry args={[7, 4]} />
      <meshBasicMaterial map={textura} transparent depthWrite={false} />
    </mesh>
  )
}

/**
 * Poeira de ouro suspensa.
 *
 * Um `Points` com 160 partículas distribuídas numa casca esférica ao redor da
 * peça. Custa quase nada (uma chamada de desenho, sem iluminação) e resolve um
 * problema real: sem nada entre a câmera e o fundo preto, o monograma parece
 * colado na tela em vez de flutuar num espaço.
 *
 * `sizeAttenuation` é o que faz as partículas de trás ficarem menores — é a
 * única pista de profundidade que a cena tem.
 */
function PoeiraDeOuro() {
  const pontos = useRef<THREE.Points>(null)

  const geometria = useMemo(() => {
    const total = 160
    const posicoes = new Float32Array(total * 3)
    for (let i = 0; i < total; i++) {
      // Distribuição em casca esférica: raio entre 2,2 e 5, ângulos uniformes.
      const raio = 2.2 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      posicoes[i * 3] = raio * Math.sin(phi) * Math.cos(theta)
      posicoes[i * 3 + 1] = raio * Math.sin(phi) * Math.sin(theta) * 0.6
      posicoes[i * 3 + 2] = raio * Math.cos(phi)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posicoes, 3))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#e8cb8a',
        size: 0.022,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometria.dispose()
      material.dispose()
    }
  }, [geometria, material])

  useFrame((_, delta) => {
    if (pontos.current) pontos.current.rotation.y += delta * 0.045
  })

  return <points ref={pontos} geometry={geometria} material={material} />
}

function Cena({ escala, giroPorScroll }: { escala: number; giroPorScroll: number }) {
  return (
    <>
      <AmbienteDeEstudio />
      <ambientLight intensity={0.35} color="#ffe9c2" />
      <directionalLight position={[3, 5, 6]} intensity={2.4} color="#fff3d8" />
      <directionalLight position={[-5, -1, 3]} intensity={1.1} color="#ffd08a" />
      <PoeiraDeOuro />
      <Monograma
        scale={escala}
        position={[0, 0.08, 0]}
        rotation={[0.06, -0.35, 0]}
        giroPorScroll={giroPorScroll}
      />
      <SombraDeContato />
    </>
  )
}

export default function BrandScene({
  escala = 1,
  giroPorScroll = 0,
}: {
  escala?: number
  giroPorScroll?: number
}) {
  return (
    <Canvas
      // dpr limitado: em telas 3x o custo por fragmento triplica sem ganho
      // perceptível num objeto que está sempre em movimento.
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.3, 6.4], fov: 34 }}
      style={{ pointerEvents: 'none' }}
    >
      <Cena escala={escala} giroPorScroll={giroPorScroll} />
    </Canvas>
  )
}
