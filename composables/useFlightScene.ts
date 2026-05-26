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
  // Cinematic-twilight palette: high turbidity for heavy atmosphere, low
  // rayleigh keeps the blue saturated under ACES (per sky.js — pushing
  // rayleigh up washes it toward white instead of brightening it).
  u.turbidity.value = 8
  u.rayleigh.value = 1.2
  u.mieCoefficient.value = 0.005
  u.mieDirectionalG.value = 0.8

  // Sun low and behind the camera — 12° above the horizon at 200° azimuth
  // (below-and-behind the viewer). The viewer faces away from the sun, so
  // the visible sky is deep zenith blue grading down to a darker horizon,
  // never the bright sunrise gradient that competes with foreground text.
  const sun = new THREE.Vector3()
  const phi = THREE.MathUtils.degToRad(90 - 12)
  const theta = THREE.MathUtils.degToRad(200)
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
    // Horizontal lookAt so the cruising aircraft can sit at the centre of
    // the frame. We give up some of the zenith blue this way, but the low
    // exposure (0.25) and the deep horizon-side palette keep the sky
    // cinematic without needing the upward tilt.
    camera.lookAt(0, 0, -1)

    sky = buildSky()
    scene.add(sky)

    // Lighting for the GLB aircraft. Cool ambient matches the twilight sky
    // colour; warm directional key gives the fuselage a single soft highlight
    // edge so it reads as 3D form, not a silhouette. Values mirror AoT's
    // Scene 0 lighting setup in jet-engine.js.
    scene.add(new THREE.AmbientLight(0xC8D8E8, 1.0))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(20, 30, 15)
    scene.add(key)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // 0.25 reads as cinematic-twilight — deep saturated blue with enough
    // darkness for warm-white headlines to land cleanly on top. Higher
    // values (>0.4) wash the sky toward white and bleach the foreground.
    renderer.toneMappingExposure = 0.25
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

  function getScene(): THREE.Scene | null {
    return scene
  }

  function getCamera(): THREE.PerspectiveCamera | null {
    return camera
  }

  return { init, destroy, getScene, getCamera }
}
