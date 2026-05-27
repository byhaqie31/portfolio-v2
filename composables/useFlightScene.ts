import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'

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
let clouds: THREE.Group | null = null
let cloudTexture: THREE.CanvasTexture | null = null
let controls: OrbitControls | null = null
let host: HTMLElement | null = null
let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let visibilityHandler: (() => void) | null = null

/* Camera direction state — exposed reactively so the page can render
 * a compass / heading / pitch readout during inspect mode. Convention:
 *   N (0°)   = looking toward -Z (the cardinal direction the plane is
 *              parked facing on Z-axis terms — though the plane itself
 *              points +X, i.e. East, after its π/2 Y-rotation)
 *   E (90°)  = looking toward +X
 *   S (180°) = looking toward +Z
 *   W (270°) = looking toward -X
 *   pitch positive = camera looking up; negative = looking down. */
const cameraHeading = ref(90)
const cameraPitch = ref(0)
const _dirHelper = new THREE.Vector3()

/* Camera pose snapshot taken when the user enters inspect mode, so
 * leaving inspect can animate back to the pre-inspect view (zoom +
 * rotation) instead of stranding the camera wherever they happened
 * to drag/zoom to. Cleared on each entry, restored on each exit. */
let inspectEntryPose: {
  position: THREE.Vector3
  target: THREE.Vector3
} | null = null

/* Active reset tween on exit. Held so we can kill it if the user
 * re-enters inspect mid-animation (otherwise the in-flight tween
 * would keep writing to camera.position over their drag input). */
let inspectExitTween: gsap.core.Timeline | null = null

// Spread of the cloud field around the camera/aircraft.
const CLOUD_FIELD_X = 130

/* ── Clouds ────────────────────────────────────────────────────────
 *
 * Billboard sprite cloud field. Pattern adapted from
 * jet-engine-infographic/src/sky.js. Each cloud is a Sprite with a
 * shared canvas-painted texture; they drift along -X per frame and
 * recycle to the +X edge when they pass the camera.
 *
 * Subtle by design — base opacity caps at 0.5 against the deep sky so
 * the clouds add depth and motion without bleaching the palette.
 */

function makeCloudTexture(): THREE.CanvasTexture {
  const size = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, size, size)

  // Stack several soft radial blobs into a single puff.
  for (let i = 0; i < 7; i++) {
    const r = size * (0.16 + Math.random() * 0.16)
    const x = size * (0.28 + Math.random() * 0.44)
    const y = size * (0.40 + Math.random() * 0.24)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function placeCloud(sprite: THREE.Sprite, scatter: boolean) {
  sprite.position.set(
    scatter
      ? (Math.random() * 2 - 1) * CLOUD_FIELD_X
      : CLOUD_FIELD_X + Math.random() * 30,
    -8 + Math.random() * 30, // y: -8 to +22 (above and below the cruising plane at y=2)
    -80 + Math.random() * 60, // z: -80 to -20 (in front of camera)
  )
  const w = 14 + Math.random() * 26
  sprite.scale.set(w, w * 0.62, 1)
  sprite.userData.speed = 0.08 + Math.random() * 0.16
  // Cap base opacity at 0.5 so clouds stay subtle against the dim sky.
  sprite.userData.baseOpacity = 0.25 + Math.random() * 0.25
}

function buildClouds(count = 16): THREE.Group {
  if (!cloudTexture) cloudTexture = makeCloudTexture()
  const group = new THREE.Group()
  group.name = 'clouds'

  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    placeCloud(sprite, true)
    group.add(sprite)
  }

  return group
}

function tickClouds() {
  if (!clouds) return
  for (const s of clouds.children as THREE.Sprite[]) {
    s.position.x -= s.userData.speed
    const mat = s.material as THREE.SpriteMaterial
    if (mat.opacity < s.userData.baseOpacity) {
      mat.opacity = Math.min(s.userData.baseOpacity, mat.opacity + 0.006)
    }
    if (s.position.x < -CLOUD_FIELD_X) {
      placeCloud(s, false)
      mat.opacity = 0 // fade the recycled cloud back in
    }
  }
}

function buildSky(): Sky {
  const s = new Sky()
  s.scale.setScalar(450000)
  // Sky uniforms are typed optional in @types/three but are guaranteed
  // present immediately after `new Sky()` — non-null assert.
  const u = s.material.uniforms
  // Cinematic-twilight palette: high turbidity for heavy atmosphere, low
  // rayleigh keeps the blue saturated under ACES (per sky.js — pushing
  // rayleigh up washes it toward white instead of brightening it).
  u.turbidity!.value = 8
  u.rayleigh!.value = 1.2
  u.mieCoefficient!.value = 0.005
  u.mieDirectionalG!.value = 0.8

  // Sun low and behind the camera — 12° above the horizon at 200° azimuth
  // (below-and-behind the viewer). The viewer faces away from the sun, so
  // the visible sky is deep zenith blue grading down to a darker horizon,
  // never the bright sunrise gradient that competes with foreground text.
  const sun = new THREE.Vector3()
  const phi = THREE.MathUtils.degToRad(90 - 12)
  const theta = THREE.MathUtils.degToRad(200)
  sun.setFromSphericalCoords(1, phi, theta)
  u.sunPosition!.value.copy(sun)
  return s
}

function animate() {
  if (!renderer || !scene || !camera) return
  rafId = requestAnimationFrame(animate)
  tickClouds()
  controls?.update()
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

    clouds = buildClouds(16)
    scene.add(clouds)

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
    // 0.18 reads as cinematic-twilight — deep saturated blue with enough
    // darkness for warm-white headlines to land cleanly on top. Higher
    // values (>0.3) wash the sky toward white and bleach the foreground.
    renderer.toneMappingExposure = 0.18
    hostEl.appendChild(renderer.domElement)

    // OrbitControls — drag-to-orbit around the aircraft. enabled starts
    // false so the user can't accidentally rotate the camera during the
    // intro/welcome (when the overlay covers the scene). pages/experience
    // calls setControlsEnabled(true) after welcomeDone.
    //
    // Zoom disabled to keep mouse-wheel free for page scroll; pan
    // disabled because there's nothing meaningful to pan to.
    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 2, -45) // aim at the cruising aircraft
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 0.4
    controls.enablePan = false
    controls.enableZoom = false
    controls.enabled = false
    // Slow continuous orbit around the aircraft once controls go live.
    // Outside inspect mode the user has no influence on the camera —
    // enableRotate starts false so stray drags don't rotate or kill
    // the autoRotate. setInspectMode(true) flips both autoRotate and
    // enableRotate when the user explicitly takes control via the
    // "Play with Aircraft" CTA. enableZoom follows the same pattern.
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.enableRotate = false

    // Heading + pitch readouts for the inspect-mode compass. Fires on
    // every camera move (autoRotate ticks, user drag, programmatic
    // position writes) — Vue batches the ref updates per microtask so
    // the rerender cost stays bounded.
    //
    // cameraHeading is intentionally NOT wrapped to [0, 360). Wrapping
    // makes CSS rotate transitions animate the long way around when
    // crossing 0° (e.g. 359 → 1 reads as -358° rotation, snapping the
    // needle counter-clockwise across the whole dial). Tracking a
    // continuous accumulated value — shortest-path delta added to the
    // previous reading — keeps the needle's rotation monotonic and the
    // CSS transition smooth. The page computes the [0, 360) display
    // value at render time via `((heading % 360) + 360) % 360`.
    controls.addEventListener('change', () => {
      if (!camera) return
      camera.getWorldDirection(_dirHelper)
      const raw = (Math.atan2(_dirHelper.x, -_dirHelper.z) * 180 / Math.PI + 360) % 360
      const prev = cameraHeading.value
      const wrappedPrev = ((prev % 360) + 360) % 360
      let delta = raw - wrappedPrev
      if (delta > 180) delta -= 360
      else if (delta < -180) delta += 360
      cameraHeading.value = prev + delta
      cameraPitch.value = Math.asin(_dirHelper.y) * 180 / Math.PI
    })

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

    if (clouds) {
      clouds.traverse((c) => {
        if ((c as THREE.Sprite).isSprite) {
          const sprite = c as THREE.Sprite
          ;(sprite.material as THREE.SpriteMaterial).dispose()
        }
      })
      clouds = null
    }

    if (cloudTexture) {
      cloudTexture.dispose()
      cloudTexture = null
    }

    controls?.dispose()
    controls = null

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

  /**
   * Toggle whether the user can drag-to-orbit the camera. Disabled
   * during intro/welcome so accidental drags on the (overlay-covered)
   * scene don't silently rotate the camera into a weird angle. The
   * autoRotate set in init() only takes effect once enabled flips true.
   */
  function setControlsEnabled(enabled: boolean) {
    if (controls) controls.enabled = enabled
  }

  /**
   * Enter / exit aircraft inspect mode. In inspect mode autoRotate is
   * paused (the user owns the rotation), enableRotate is true (drag
   * orbits the camera) and enableZoom is true (mouse wheel scales the
   * camera distance — the page should pause Lenis separately so the
   * wheel reaches us). Leaving inspect mode restores autoRotate +
   * locks out user drag/zoom so the plane spins untouchably until the
   * user explicitly takes control again, AND snaps the camera back to
   * the pose it was in when they entered inspect — so any zoom or
   * rotation they did during inspect is rolled back, and autoRotate
   * resumes from the same view they saw before clicking Play.
   */
  function setInspectMode(on: boolean) {
    if (!controls || !camera) return

    // Any in-flight exit animation should be killed before we change
    // state again — otherwise it would keep writing to camera.position
    // on top of a fresh inspect-entry drag, or fight a second exit.
    if (inspectExitTween) {
      inspectExitTween.kill()
      inspectExitTween = null
    }

    if (on) {
      // ENTRY — snapshot pose so we can animate back to it on exit.
      inspectEntryPose = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      }
      controls.autoRotate = false
      controls.enableZoom = true
      controls.enableRotate = true
      return
    }

    // EXIT — lock user input immediately; keep autoRotate paused while
    // the tween animates the camera back to the entry pose; flip
    // autoRotate on in onComplete so it resumes from the restored view.
    controls.enableRotate = false
    controls.enableZoom = false

    if (!inspectEntryPose) {
      controls.autoRotate = true
      return
    }

    const targetPose = inspectEntryPose
    inspectEntryPose = null

    inspectExitTween = gsap.timeline({
      onComplete: () => {
        if (controls) controls.autoRotate = true
        inspectExitTween = null
      },
    })
      .to(camera.position, {
        x: targetPose.position.x,
        y: targetPose.position.y,
        z: targetPose.position.z,
        duration: 0.7,
        ease: 'power2.inOut',
      }, 0)
      .to(controls.target, {
        x: targetPose.target.x,
        y: targetPose.target.y,
        z: targetPose.target.z,
        duration: 0.7,
        ease: 'power2.inOut',
        // Drive OrbitControls' internal spherical/lookAt every frame
        // so the camera re-orients smoothly as both tweens progress.
        onUpdate: () => controls?.update(),
      }, 0)
  }

  return {
    init,
    destroy,
    getScene,
    getCamera,
    setControlsEnabled,
    setInspectMode,
    cameraHeading: readonly(cameraHeading),
    cameraPitch: readonly(cameraPitch),
  }
}
