import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

/*
 * Three.js scene lifecycle for the cinematic surface. Boots a renderer +
 * Sky shader on a host element, drives its own RAF loop, and tears down
 * cleanly on unmount.
 *
 * Pattern mirrors jet-engine-infographic/src/jet-engine.js (renderer,
 * camera, ACES tone-mapping, pixelRatio cap, ResizeObserver) and
 * jet-engine-infographic/src/sky.js (Sky uniforms — turbidity, rayleigh,
 * mie, sun position). Singleton: only one scene alive at a time, so the
 * composable safely re-mounts when the layout flickers under HMR.
 *
 * Scope for weekend 2: static sky only. No clouds, no bloom, no scroll-
 * driven camera moves — those land in weekend 3.
 */

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let sky: Sky | null = null
let host: HTMLElement | null = null
let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let visibilityHandler: (() => void) | null = null

function buildSky(): Sky {
  const s = new Sky()
  s.scale.setScalar(450000)
  const u = s.material.uniforms
  // Per sky.js: rayleigh past ~2 washes the blue out under ACES, so keep it modest.
  u.turbidity.value = 3
  u.rayleigh.value = 2
  u.mieCoefficient.value = 0.005
  u.mieDirectionalG.value = 0.8

  // Sun at 48° elevation, 150° azimuth — upper-right of the camera view,
  // cinematic "late-morning crosslight" rather than overhead.
  const sun = new THREE.Vector3()
  const phi = THREE.MathUtils.degToRad(90 - 48)
  const theta = THREE.MathUtils.degToRad(150)
  sun.setFromSphericalCoords(1, phi, theta)
  u.sunPosition.value.copy(sun)
  return s
}

function animate() {
  if (!renderer || !scene || !camera) return
  rafId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

function onResize() {
  if (!host || !camera || !renderer) return
  const { width, height } = host.getBoundingClientRect()
  if (width === 0 || height === 0) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onVisibility() {
  if (document.hidden) {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  } else if (rafId == null && renderer) {
    animate()
  }
}

export function useFlightScene() {
  function init(hostEl: HTMLElement) {
    if (renderer || typeof window === 'undefined') return

    host = hostEl
    const { width, height } = hostEl.getBoundingClientRect()

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300)
    camera.position.set(0, 0, 0)
    camera.lookAt(0, 0, -1)

    sky = buildSky()
    scene.add(sky)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // 0.55 keeps the sky reading blue under ACES; values much higher
    // desaturate toward white.
    renderer.toneMappingExposure = 0.55
    hostEl.appendChild(renderer.domElement)

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(hostEl)

    visibilityHandler = onVisibility
    document.addEventListener('visibilitychange', visibilityHandler)

    animate()
  }

  function destroy() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    resizeObserver?.disconnect()
    resizeObserver = null

    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }

    if (sky) {
      sky.geometry.dispose()
      ;(sky.material as THREE.Material).dispose()
      sky = null
    }

    if (renderer) {
      if (host && renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement)
      }
      renderer.dispose()
      renderer = null
    }

    scene = null
    camera = null
    host = null
  }

  return { init, destroy }
}
