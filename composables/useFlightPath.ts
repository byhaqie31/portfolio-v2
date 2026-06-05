import * as THREE from 'three'
import type { useFlightScene } from '~/composables/useFlightScene'
import type { useFlightAircraft } from '~/composables/useFlightAircraft'

/*
 * Flight choreography for /experience. Owns the 3D route (a CatmullRom
 * spline), the drifting clouds, the wingtip contrail ribbons, the chase-
 * rig camera, and the derived telemetry. One smoothed `progress` (0 → 1,
 * read from the scroll runway) drives everything:
 *
 *   introT  = clamp(progress / INTRO_END, 0, 1)            — welcome → reveal
 *   flightT = clamp((progress - INTRO_END) / (1 - INTRO_END), 0, 1) — the spline
 *
 * The first INTRO_END of scroll is the intro (welcome card + word
 * highlight + dark-overlay reveal). The remainder flies the aircraft
 * along the spline past four career waypoints while telemetry climbs.
 *
 * Registers `update()` as useFlightScene's per-frame hook. Exposes
 * reactive refs the page binds to (intro choreography, telemetry, active
 * waypoint, rail fill). Ported from the approved prototype
 * (design_handoff_experience_flight/reference/journey.js), with the
 * procedural placeholder plane swapped for the real GLB pivot.
 */

const WORLD_UP = new THREE.Vector3(0, 1, 0)

// Fraction of total scroll devoted to the welcome → highlight → reveal intro.
export const INTRO_END = 0.14

/* Waypoint geometry: where on the spline (flightT) each career stop sits,
 * plus the short label the right-edge rail shows. Card content is composed
 * by the page from data/index.ts and paired to these by index. */
export const FLIGHT_WAYPOINTS = [
  { t: 0.18, rail: 'Faztech' },
  { t: 0.43, rail: 'Univ. Malaya' },
  { t: 0.68, rail: 'Fiuu' },
  { t: 0.9, rail: 'Now' },
] as const

function smoothstep(a: number, b: number, x: number): number {
  const k = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return k * k * (3 - 2 * k)
}

function headingFromTangent(tan: THREE.Vector3): number {
  const deg = (Math.atan2(tan.x, -tan.z) * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}

/* ── GLSL contrail ─────────────────────────────────────────────────────
 *
 * A wingtip ribbon: keeps a short history of recent wingtip world
 * positions + travel directions, builds a tapering triangle strip whose
 * per-vertex life fades head → tail. Additive, depth-write off, cool
 * white. Glow-on-3D is allowed (CINEMATIC §2.3). */
class Contrail {
  max = 56
  width: number
  hist: { p: THREE.Vector3; f: THREE.Vector3 }[] = []
  geom: THREE.BufferGeometry
  pos: Float32Array
  life: Float32Array
  mat: THREE.ShaderMaterial
  mesh: THREE.Mesh

  constructor(width: number, color: number) {
    this.width = width
    this.geom = new THREE.BufferGeometry()
    this.pos = new Float32Array(this.max * 2 * 3)
    this.life = new Float32Array(this.max * 2)
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    this.geom.setAttribute('aLife', new THREE.BufferAttribute(this.life, 1))
    const idx: number[] = []
    for (let i = 0; i < this.max - 1; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = (i + 1) * 2
      const d = (i + 1) * 2 + 1
      idx.push(a, b, c, b, d, c)
    }
    this.geom.setIndex(idx)
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.5 },
      },
      vertexShader: /* glsl */ `
        attribute float aLife;
        varying float vLife;
        void main() {
          vLife = aLife;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vLife;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float a = pow(vLife, 1.6) * uOpacity;
          gl_FragColor = vec4(uColor, a);
        }`,
    })
    this.mesh = new THREE.Mesh(this.geom, this.mat)
    this.mesh.frustumCulled = false
  }

  push(point: THREE.Vector3, forward: THREE.Vector3) {
    this.hist.unshift({ p: point.clone(), f: forward.clone() })
    if (this.hist.length > this.max) this.hist.pop()
    const n = this.hist.length
    const perp = new THREE.Vector3()
    for (let i = 0; i < this.max; i++) {
      const s = this.hist[Math.min(i, n - 1)]
      perp.crossVectors(s.f, WORLD_UP).normalize()
      const ageT = i / (this.max - 1)
      const w = this.width * (1 - ageT * 0.85)
      const o = i * 6
      this.pos[o] = s.p.x + perp.x * w
      this.pos[o + 1] = s.p.y + perp.y * w
      this.pos[o + 2] = s.p.z + perp.z * w
      this.pos[o + 3] = s.p.x - perp.x * w
      this.pos[o + 4] = s.p.y - perp.y * w
      this.pos[o + 5] = s.p.z - perp.z * w
      this.life[i * 2] = 1 - ageT
      this.life[i * 2 + 1] = 1 - ageT
    }
    this.geom.attributes.position.needsUpdate = true
    this.geom.attributes.aLife.needsUpdate = true
  }

  dispose() {
    this.geom.dispose()
    this.mat.dispose()
  }
}

function makeCloudTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, 'rgba(200,212,230,0.9)')
  g.addColorStop(0.45, 'rgba(150,165,190,0.35)')
  g.addColorStop(1, 'rgba(120,135,160,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

type SceneApi = ReturnType<typeof useFlightScene>
type AircraftApi = ReturnType<typeof useFlightAircraft>

export function useFlightPath() {
  const REDUCED =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Reactive state the page binds to ────────────────────────────────
  const introT = ref(0) // 0 → 1 across the welcome / reveal
  const flightT = ref(0) // 0 → 1 across the spline (drives the rail)
  const litCount = ref(0) // how many tagline words are lit
  const overlayOpacity = ref(1) // dark reveal overlay (1 → ~0.06)
  const introOpacity = ref(1) // whole intro layer (1 → 0)
  const hintOpacity = ref(1) // "scroll to fly" hint
  const activeWp = ref(-1) // nearest waypoint index, or -1
  const needleDeg = ref(0) // compass needle rotation (heading)
  // Telemetry readouts (throttled, smoothed) — strings so the HUD renders
  // them verbatim with tabular-nums.
  const alt = ref('08,200')
  const hdg = ref('000')
  const gs = ref('460')
  const vs = ref('+000')

  // ── Route ───────────────────────────────────────────────────────────
  const routePts = [
    new THREE.Vector3(-70, -2, 46),
    new THREE.Vector3(-10, 4, 14),
    new THREE.Vector3(60, 14, -22),
    new THREE.Vector3(135, 24, 18),
    new THREE.Vector3(205, 38, -26),
    new THREE.Vector3(280, 50, 12),
    new THREE.Vector3(355, 60, -8),
  ]
  const curve = new THREE.CatmullRomCurve3(routePts, false, 'catmullrom', 0.5)

  let sceneApi: SceneApi | null = null
  let aircraftApi: AircraftApi | null = null
  let progressSource: (() => number) | null = null

  let clouds: THREE.Sprite[] = []
  let cloudTex: THREE.CanvasTexture | null = null
  let trailL: Contrail | null = null
  let trailR: Contrail | null = null
  let revealMaterials: THREE.Material[] | null = null

  // Smoothing + telemetry running state.
  let progress = 0
  let prevAlt = 8000
  let smGs = 460
  let smVs = 0
  let smScrollV = 0
  let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0
  let hudT = 0
  let lastLit = -1

  // Reusable temporaries (avoid per-frame allocation).
  const tmpPos = new THREE.Vector3()
  const tmpTan = new THREE.Vector3()
  const tmpTanB = new THREE.Vector3()
  const tmpEye = new THREE.Vector3()
  const tmpLook = new THREE.Vector3()
  const tmpSide = new THREE.Vector3()
  const tmpWing = new THREE.Vector3()

  function buildClouds(scene: THREE.Scene) {
    cloudTex = makeCloudTexture()
    for (let i = 0; i < 18; i++) {
      const base = curve.getPointAt(Math.random())
      const m = new THREE.SpriteMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.1 + Math.random() * 0.22,
        depthWrite: false,
        color: 0xaebccf,
      })
      const s = new THREE.Sprite(m)
      s.position.set(
        base.x + (Math.random() - 0.5) * 220,
        base.y + (Math.random() - 0.3) * 70 - 10,
        base.z + (Math.random() - 0.5) * 220,
      )
      const sc = 40 + Math.random() * 90
      s.scale.set(sc, sc * 0.6, 1)
      s.userData.drift = 2 + Math.random() * 4
      scene.add(s)
      clouds.push(s)
    }
  }

  /**
   * Wire the flight into the scene + aircraft + scroll, and register the
   * per-frame hook. `progress` returns the runway scroll position (0 → 1).
   */
  function init(opts: {
    scene: SceneApi
    aircraft: AircraftApi
    progress: () => number
  }) {
    if (typeof window === 'undefined') return
    sceneApi = opts.scene
    aircraftApi = opts.aircraft
    progressSource = opts.progress

    const scene = sceneApi.getScene()
    if (!scene) return

    buildClouds(scene)

    if (!REDUCED) {
      trailL = new Contrail(0.55, 0xcfe6ff)
      trailR = new Contrail(0.55, 0xcfe6ff)
      scene.add(trailL.mesh)
      scene.add(trailR.mesh)
    }

    // Snap progress to the current scroll on boot so a restored scroll
    // position doesn't animate from 0.
    progress = progressSource()

    sceneApi.setFrameHook(update)
  }

  function update({ dt, now }: { dt: number; now: number }) {
    if (!sceneApi || !progressSource) return
    const camera = sceneApi.getCamera()
    if (!camera) return

    // Smoothed progress (snap under reduced motion).
    const target = progressSource()
    progress += (target - progress) * (REDUCED ? 1 : 0.07)

    const it = THREE.MathUtils.clamp(progress / INTRO_END, 0, 1)
    const ft = THREE.MathUtils.clamp((progress - INTRO_END) / (1 - INTRO_END), 0, 1)
    introT.value = it
    flightT.value = ft

    // Aircraft along the curve.
    curve.getPointAt(ft, tmpPos)
    curve.getTangentAt(ft, tmpTan).normalize()

    const pivot = aircraftApi?.getPivot() ?? null
    if (pivot) {
      pivot.position.copy(tmpPos)
      tmpLook.copy(tmpPos).add(tmpTan)
      pivot.lookAt(tmpLook) // nose (+Z) faces travel
      // Banking from heading change over a small lookahead.
      curve.getTangentAt(Math.min(1, ft + 0.012), tmpTanB).normalize()
      let dh =
        Math.atan2(tmpTanB.x, -tmpTanB.z) - Math.atan2(tmpTan.x, -tmpTan.z)
      if (dh > Math.PI) dh -= 2 * Math.PI
      if (dh < -Math.PI) dh += 2 * Math.PI
      pivot.rotateZ(THREE.MathUtils.clamp(-dh * 9, -0.6, 0.6))
    }

    // Camera chase rig. Wide establishing frame during the intro (bias),
    // easing into the chase as flightT leaves 0.
    const introBias = Math.max(0, 1 - ft / 0.06)
    const back = 34 + introBias * 50
    const up = 12 + introBias * 5
    const side = 16 - introBias * 5
    tmpSide.crossVectors(tmpTan, WORLD_UP).normalize()
    tmpEye
      .copy(tmpPos)
      .addScaledVector(tmpTan, -back)
      .addScaledVector(WORLD_UP, up)
      .addScaledVector(tmpSide, side)
    if (REDUCED) camera.position.copy(tmpEye)
    else camera.position.lerp(tmpEye, 0.06)
    tmpLook.copy(tmpPos).addScaledVector(tmpTan, 20)
    camera.lookAt(tmpLook)

    // Contrails from the wingtips (transform pivot-local emit points to
    // world via the pivot's orientation + position).
    if (!REDUCED && pivot && trailL && trailR && aircraftApi) {
      const wt = aircraftApi.getWingtips()
      tmpWing.copy(wt.left).applyQuaternion(pivot.quaternion).add(pivot.position)
      trailL.push(tmpWing, tmpTan)
      tmpWing.copy(wt.right).applyQuaternion(pivot.quaternion).add(pivot.position)
      trailR.push(tmpWing, tmpTan)
    }

    // Cloud drift.
    if (!REDUCED) {
      for (const c of clouds) {
        c.position.x += c.userData.drift * dt
        if (c.position.x > 480) c.position.x = -480
      }
    }

    // ── Intro choreography (welcome zoom → word highlight → reveal) ────
    overlayOpacity.value = 1 - smoothstep(0.12, 0.92, it) * 0.94
    introOpacity.value = 1 - smoothstep(0.88, 1.0, it)
    hintOpacity.value = Math.max(0, 1 - it / 0.22)
    const litTarget = Math.round(smoothstep(0.3, 0.8, it) * 9) // 9 tagline words
    if (litTarget !== lastLit) {
      lastLit = litTarget
      litCount.value = litTarget
    }

    // Reveal the aircraft materials as the overlay clears (introT 0 → 0.4).
    if (revealMaterials) {
      const o = THREE.MathUtils.clamp(it / 0.4, 0, 1)
      for (const m of revealMaterials) (m as THREE.Material & { opacity: number }).opacity = o
    }

    // ── Active waypoint ────────────────────────────────────────────────
    let nearest = -1
    let best = 0.13
    for (let i = 0; i < FLIGHT_WAYPOINTS.length; i++) {
      const d = Math.abs(ft - FLIGHT_WAYPOINTS[i].t)
      if (d < best) {
        best = d
        nearest = i
      }
    }
    if (nearest !== activeWp.value) activeWp.value = nearest

    // ── Telemetry ──────────────────────────────────────────────────────
    const heading = headingFromTangent(tmpTan)
    needleDeg.value = heading
    const altVal = Math.round(tmpPos.y * 600 + 8200)
    const sy = typeof window !== 'undefined' ? window.scrollY : 0
    const scrollV = Math.abs(sy - lastScrollY)
    lastScrollY = sy
    smScrollV += (scrollV - smScrollV) * 0.1
    smGs += (430 + Math.min(140, smScrollV * 1.6) - smGs) * 0.05
    const vsRaw = ((altVal - prevAlt) / Math.max(dt, 0.001)) * 0.12
    prevAlt = altVal
    smVs += (vsRaw - smVs) * 0.06

    if (now - hudT > 90) {
      hudT = now
      alt.value = altVal.toLocaleString()
      hdg.value = Math.round(heading).toString().padStart(3, '0')
      gs.value = Math.round(smGs).toString()
      const v = Math.round(smVs / 10) * 10
      vs.value = (v >= 0 ? '+' : '−') + Math.abs(v).toLocaleString()
    }
  }

  /**
   * Hand the flight the aircraft's materials so it can fade them in with
   * the reveal. Call once the GLB has loaded.
   */
  function setRevealMaterials(mats: THREE.Material[]) {
    revealMaterials = mats
    for (const m of mats) (m as THREE.Material & { opacity: number }).opacity = 0
  }

  function destroy() {
    sceneApi?.setFrameHook(null)
    const scene = sceneApi?.getScene() ?? null
    for (const c of clouds) {
      scene?.remove(c)
      ;(c.material as THREE.SpriteMaterial).dispose()
    }
    clouds = []
    cloudTex?.dispose()
    cloudTex = null
    if (trailL) {
      scene?.remove(trailL.mesh)
      trailL.dispose()
      trailL = null
    }
    if (trailR) {
      scene?.remove(trailR.mesh)
      trailR.dispose()
      trailR = null
    }
    revealMaterials = null
    sceneApi = null
    aircraftApi = null
    progressSource = null
  }

  return {
    init,
    destroy,
    setRevealMaterials,
    // reactive state
    introT: readonly(introT),
    flightT: readonly(flightT),
    litCount: readonly(litCount),
    overlayOpacity: readonly(overlayOpacity),
    introOpacity: readonly(introOpacity),
    hintOpacity: readonly(hintOpacity),
    activeWp: readonly(activeWp),
    needleDeg: readonly(needleDeg),
    alt: readonly(alt),
    hdg: readonly(hdg),
    gs: readonly(gs),
    vs: readonly(vs),
  }
}
