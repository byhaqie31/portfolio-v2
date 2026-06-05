import * as THREE from 'three'

/*
 * Three.js scene lifecycle for the cinematic flight surface. Boots a
 * renderer + gradient skydome + fog + AoT lighting on a host element,
 * drives a single RAF loop, runs a per-frame hook (the flight
 * choreography in useFlightPath), and tears down cleanly on unmount.
 *
 * The camera is fully scripted by the flight loop (a chase rig on the
 * spline) — there are no OrbitControls and no Pilot Mode here. Pattern
 * mirrors jet-engine-infographic/src/jet-engine.js (renderer, ACES
 * tone-mapping, pixelRatio cap, ResizeObserver) and the skydome /
 * lighting from the approved /experience flight prototype.
 *
 * Singleton: only one scene alive at a time, so the composable safely
 * re-mounts when the layout flickers under HMR.
 */

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let skyMesh: THREE.Mesh | null = null
let host: HTMLElement | null = null
let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let visibilityHandler: (() => void) | null = null

/* Per-frame hook — the flight choreography registers here. Runs after
 * dt/now are computed and before the render call, so it can move the
 * aircraft + camera for the frame it's about to draw. */
let frameHook: ((ctx: { dt: number; now: number }) => void) | null = null
let lastFrame = 0

/* Two independent reasons to suspend the render loop:
 *   - `docHidden`     → user switched tab; cancelling RAF drops GPU work.
 *   - `flightOffscreen` → user has scrolled past the flight runway into
 *                       the editorial body, which covers the fixed canvas
 *                       with an opaque bg. No reason to keep drawing it. */
let docHidden = false
let flightOffscreen = false

/* Perf telemetry, exposed reactively for the HUD's bottom-left readout
 * (FPS · CALLS · TRIS · DPR). Updated on a ~280ms throttle so the digits
 * don't jitter. tabular-nums in CSS keeps them from shifting width. */
const perfFps = ref(60)
const perfCalls = ref(0)
const perfTris = ref(0)
const perfDpr = ref(2)
let fpsAcc = 0
let fpsN = 0
let perfT = 0

/* ── Gradient skydome ──────────────────────────────────────────────────
 *
 * A large back-side sphere with a vertical-gradient shader: deep near-
 * black at the zenith grading to a cool blue-grey at the horizon, with a
 * soft glow band just above it. Replaces the AoT `Sky` shader because the
 * flight travels a wide world (route spans ~400 units) and needs a calm,
 * even backdrop that reads behind the telemetry rather than a bright
 * sunrise gradient. Values from the approved flight prototype.
 */
function buildSky(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(900, 32, 24)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x06070b) },
      uHorizon: { value: new THREE.Color(0x1b2433) },
      uGlow: { value: new THREE.Color(0x2c3a4f) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() {
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vP;
      uniform vec3 uTop, uHorizon, uGlow;
      void main() {
        float h = normalize(vP).y;
        float t = smoothstep(-0.05, 0.55, h);
        vec3 col = mix(uHorizon, uTop, t);
        float band = smoothstep(0.16, -0.12, h) * smoothstep(-0.3, 0.05, h);
        col = mix(col, uGlow, band * 0.5);
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
  return new THREE.Mesh(geo, mat)
}

function animate() {
  if (!renderer || !scene || !camera) return
  rafId = requestAnimationFrame(animate)

  const now = performance.now()
  const dt = Math.min(0.05, (now - lastFrame) / 1000)
  lastFrame = now

  frameHook?.({ dt, now })

  renderer.render(scene, camera)

  // Perf accumulation — averaged + flushed on a ~280ms throttle.
  fpsAcc += 1 / Math.max(dt, 0.001)
  fpsN++
  if (now - perfT > 280) {
    perfT = now
    perfFps.value = Math.min(120, Math.round(fpsAcc / fpsN))
    perfCalls.value = renderer.info.render.calls
    perfTris.value = renderer.info.render.triangles
    perfDpr.value = renderer.getPixelRatio()
    fpsAcc = 0
    fpsN = 0
  }
}

function onResize() {
  if (!host || !camera || !renderer) return
  const { width, height } = host.getBoundingClientRect()
  if (width === 0 || height === 0) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function maybeRun() {
  const shouldRun = !docHidden && !flightOffscreen && renderer != null
  if (shouldRun && rafId == null) {
    lastFrame = performance.now()
    animate()
  } else if (!shouldRun && rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function onVisibility() {
  docHidden = document.hidden
  maybeRun()
}

export function useFlightScene() {
  function init(hostEl: HTMLElement) {
    if (renderer || typeof window === 'undefined') return

    host = hostEl
    const { width, height } = hostEl.getBoundingClientRect()

    scene = new THREE.Scene()
    // Fog folds distant route + clouds into the horizon colour so the
    // world fades out rather than ending at a hard edge.
    scene.fog = new THREE.Fog(new THREE.Color(0x11151f), 120, 620)

    // 48° FOV reads as a longer "cinema" lens than the parked-scene 55°;
    // far plane reaches past the skydome (radius 900) so nothing clips.
    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 2000)
    camera.position.set(-90, 20, 70)

    skyMesh = buildSky()
    scene.add(skyMesh)

    // Lighting — cool hemisphere fill, warm key, cool rim. Mirrors the
    // flight prototype so the GLB reads as 3D form against the dim sky.
    scene.add(new THREE.HemisphereLight(0x9fb6d4, 0x0a0b0f, 0.55))
    const key = new THREE.DirectionalLight(0xfff0e0, 1.5)
    key.position.set(-80, 120, 60)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x4fc3f7, 0.5)
    rim.position.set(120, 30, -80)
    scene.add(rim)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    // Hard rule: cap DPR ≤ 2 so retina displays don't quadruple fill cost.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.92
    hostEl.appendChild(renderer.domElement)

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(hostEl)

    visibilityHandler = onVisibility
    document.addEventListener('visibilitychange', visibilityHandler)

    lastFrame = performance.now()
    animate()
  }

  function destroy() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    frameHook = null

    resizeObserver?.disconnect()
    resizeObserver = null

    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }

    if (skyMesh) {
      skyMesh.geometry.dispose()
      ;(skyMesh.material as THREE.Material).dispose()
      skyMesh = null
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

  function getRenderer(): THREE.WebGLRenderer | null {
    return renderer
  }

  /**
   * Register the per-frame choreography hook (the flight loop). Pass null
   * to clear it. Runs inside the RAF loop before each render.
   */
  function setFrameHook(fn: ((ctx: { dt: number; now: number }) => void) | null) {
    frameHook = fn
  }

  /**
   * Drive the render loop from outside. The page's IntersectionObserver
   * calls this: the flight scene is only meaningful while the flight
   * runway is in view. Once the user scrolls into the editorial body the
   * opaque bg covers the fixed canvas, so there's no reason to keep
   * drawing it. Resolved together with `docHidden` (visibilitychange).
   */
  function setActive(active: boolean) {
    flightOffscreen = !active
    maybeRun()
  }

  return {
    init,
    destroy,
    getScene,
    getCamera,
    getRenderer,
    setFrameHook,
    setActive,
    perfFps: readonly(perfFps),
    perfCalls: readonly(perfCalls),
    perfTris: readonly(perfTris),
    perfDpr: readonly(perfDpr),
  }
}
