<template>
  <section class="threejs-section" aria-label="Recorrido 3D">
    <canvas ref="threeCanvas" class="three-canvas"></canvas>
    <div class="text-overlay">
      <div class="text-frame">
        <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
          <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
          <template v-for="(item, idx) in sections" :key="idx">
            <div
              v-bind:id="item.ID || undefined"
              :style="{ color: item.COLOR, margin: '0.5em 0', fontWeight: item.STYLE === 'titleGroup' || item.STYLE === 'title' ? 'bold' : 'normal', fontSize: item.STYLE === 'titleGroup' ? '1.5em' : item.STYLE === 'title' ? '1.2em' : '1em' }"
            >
              <template v-if="item.STYLE === 'link' && item.LINK">
                <a :href="item.LINK" target="_blank" :style="{ color: item.COLOR }">{{ item.CONTENT }}</a>
              </template>
              <template v-else>
                {{ item.CONTENT }}
              </template>
            </div>
          </template>
          <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:2%"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { ScrollController } from '@/utils/scrollController'
import sectionsData from '@/data/sections.json'
import cloudsAlphaUrl from '@/assets/textures/clouds/clouds_alpha.png'
import planetDiffuseUrl from '@/assets/textures/planet/planet_diffuse.jpg'
import skyDiffuseUrl from '@/assets/textures/sky/sky_diffuse.jpg'

const threeCanvas = ref<HTMLCanvasElement | null>(null)
const textContentRef = ref<HTMLDivElement | null>(null)
const startMarkerRef = ref<HTMLDivElement | null>(null)
const endMarkerRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let planet: THREE.Mesh, dome: THREE.Mesh, clouds: THREE.Mesh
let scrollController: ScrollController
const sections = ref(sectionsData.sections)
let lastAllowedY = 0 // Para resetear el scroll sobrante

function getFrameHeight() {
  // Calcula el alto real del marco, ajustando si cambian las barras
  const frame = textContentRef.value?.parentElement
  return frame ? frame.clientHeight : window.innerHeight * 0.9
}

function getScrollLimits() {
  // Calcula los límites de desplazamiento según la posición de los marcadores
  const frame = textContentRef.value?.parentElement
  if (!frame || !textContentRef.value || !startMarkerRef.value || !endMarkerRef.value) return { minY: 0, maxY: 0 }
  const frameRect = frame.getBoundingClientRect()
  const contentRect = textContentRef.value.getBoundingClientRect()
  const startRect = startMarkerRef.value.getBoundingClientRect()
  const endRect = endMarkerRef.value.getBoundingClientRect()
  // El margen ya está incluido en los divs
  const minY = Math.min(0, frameRect.height - contentRect.height)
  const maxY = 0
  return { minY, maxY }
}

onMounted(() => {
  // Inicializar controlador de scroll
  scrollController = new ScrollController()
  // Exponer el scrollController globalmente para navegación
  window.scrollController = scrollController

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: threeCanvas.value!, antialias: true })
  renderer.setClearColor('#34495e') // color de fondo plano
  renderer.setSize(threeCanvas.value!.clientWidth, threeCanvas.value!.clientHeight, false)

  // Scene
  scene = new THREE.Scene()

  // Camera
  const aspect = threeCanvas.value!.clientWidth / threeCanvas.value!.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0, 70)

  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)
  // Luz direccional
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  // Cargar texturas
  const textureLoader = new THREE.TextureLoader()

  // Función para cargar textura con manejo de errores
  const loadTexture = (path: string) => {
    return textureLoader.load(
      path,
      undefined, // onLoad
      undefined, // onProgress
      (error) => {
        console.error('Error loading texture:', path, error)
      }
    )
  }

  // Texturas del planeta (solo diffuse por ahora)
  const planetDiffuse = loadTexture(planetDiffuseUrl)
  // const planetNormal = loadTexture('/src/assets/textures/planet/planet_normal.jpg')
  // const planetRoughness = loadTexture('/src/assets/textures/planet/planet_roughness.jpg')

  // Texturas del cielo (solo diffuse por ahora)
  const skyDiffuse = loadTexture(skyDiffuseUrl)
  // const skyNormal = loadTexture('/src/assets/textures/sky/sky_normal.jpg')

  // Texturas de nubes (solo diffuse por ahora)
  const cloudsDiffuse = loadTexture(cloudsAlphaUrl)
  // const cloudsAlpha = loadTexture('/src/assets/textures/clouds/clouds_alpha.png')
  // const cloudsNormal = loadTexture('/src/assets/textures/clouds/clouds_normal.jpg')

  // Configurar mapeo de textura de nubes para evitar cortes
  cloudsDiffuse.wrapS = THREE.RepeatWrapping
  cloudsDiffuse.wrapT = THREE.RepeatWrapping
  cloudsDiffuse.repeat.set(1, 1) // Sin repetición
  cloudsDiffuse.offset.set(0, 0) // Sin offset
  cloudsDiffuse.rotation = 0 // Sin rotación
  cloudsDiffuse.center.set(0.5, 0.5) // Centrar la rotación

  // Planeta (esfera mucho más grande)
  const planetGeometry = new THREE.SphereGeometry(45, 64, 64)
  
  // Distorsionar vértices para crear montañas
  const positions = planetGeometry.attributes.position.array
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1] 
    const z = positions[i + 2]
    
    // Calcular distancia desde el centro
    const distance = Math.sqrt(x * x + y * y + z * z)
    
    // Aplicar ruido para crear montañas
    const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * Math.sin(y * 0.3) * 7
    const newDistance = distance + noise
    
    // Normalizar y escalar
    const scale = newDistance / distance
    positions[i] *= scale
    positions[i + 1] *= scale  
    positions[i + 2] *= scale
  }
  
  planetGeometry.attributes.position.needsUpdate = true
  
  // Material del planeta con texturas
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetDiffuse,
    // normalMap: planetNormal,
    // roughnessMap: planetRoughness,
    side: THREE.FrontSide,
    flatShading: false
  })
  
  planet = new THREE.Mesh(planetGeometry, planetMaterial)
  planet.position.set(0, -42, 0)
  scene.add(planet)

  // Cúpula/cielo con textura
  const domeGeometry = new THREE.SphereGeometry(100, 64, 64)
  const domeMaterial = new THREE.MeshStandardMaterial({
    map: skyDiffuse,
    // normalMap: skyNormal,
    side: THREE.BackSide
  })
  dome = new THREE.Mesh(domeGeometry, domeMaterial)
  dome.position.set(0, -42, 0)
  scene.add(dome)

  // Nubes con textura y transparencia
  const cloudsGeometry = new THREE.SphereGeometry(80, 64, 64)
  
  // Ajustar coordenadas UV para mejor mapeo de textura
  const uvs = cloudsGeometry.attributes.uv
  for (let i = 0; i < uvs.count; i++) {
    const u = uvs.getX(i)
    const v = uvs.getY(i)
    
    // Ajustar coordenadas UV para evitar cortes
    uvs.setXY(i, u * 1.0, v * 1.0)
  }
  
  const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: cloudsDiffuse,
    // alphaMap: cloudsAlpha,
    // normalMap: cloudsNormal,
    transparent: true,
    opacity: 0.8,
    side: THREE.BackSide
  })
  clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
  clouds.position.set(0, -42, 0)
  scene.add(clouds)

  nextTick(() => animate()) // Asegura refs listos
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (scrollController) {
    scrollController.destroy()
  }
  renderer.dispose()
})

function onResize() {
  if (!renderer || !camera || !threeCanvas.value) return
  const width = threeCanvas.value.clientWidth
  const height = threeCanvas.value.clientHeight
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate() {
  requestAnimationFrame(animate)
  let allow3DRotation = true;
  // Sincronizar desplazamiento del texto con el scroll (usando rotationY)
  if (textContentRef.value && scrollController && startMarkerRef.value && endMarkerRef.value) {
    const factor = 120 // puedes ajustar este valor
    let y = -scrollController.getRotations().rotationY * factor
    const { minY, maxY } = getScrollLimits()
    // Bloqueo inteligente: si estamos en el tope, no dejamos subir más
    if (y > maxY) {
      y = maxY
      scrollController.resetRotationYTo(-maxY / factor)
      allow3DRotation = false;
    }
    // Si estamos en el fondo, no dejamos bajar más
    if (y < minY) {
      y = minY
      scrollController.resetRotationYTo(-minY / factor)
      allow3DRotation = false;
    }
    textContentRef.value.style.transform = `translateY(${y}px)`
    lastAllowedY = y
  }
  // Aplicar rotaciones desde el controlador de scroll SOLO si está permitido
  if (allow3DRotation && scrollController && planet && dome && clouds) {
    scrollController.applyRotations(planet, dome, clouds)
  }
  renderer.render(scene, camera)
}
</script>

<style scoped>
.threejs-section {
  position: relative;
  width: 100%;
  height: 100%;
}
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.text-frame {
  border-radius: 0;
  padding: 2vw;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  box-shadow: none;
  pointer-events: auto;
}
.text-content {
  width: 100%;
  color: white;
  font-size: 1em;
  line-height: 1.5;
  word-break: break-word;
  overflow: hidden;
  text-align: center;
}
.text-content > div {
  text-align: center;
  text-shadow:
    2px 2px 0 var(--color-bg),
    -2px 2px 0 var(--color-bg),
    2px -2px 0 var(--color-bg),
    -2px -2px 0 var(--color-bg),
    2px 0px 0 var(--color-bg),
    0px 2px 0 var(--color-bg),
    -2px 0px 0 var(--color-bg),
    0px -2px 0 var(--color-bg);
}
</style>
