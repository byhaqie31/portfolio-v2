import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/*
 * 3D aircraft lifecycle for the cinematic flight. Loads the A350 GLB into
 * an existing Three.js scene, normalizes its scale + orientation, and
 * wraps it in a pivot group the flight choreography drives along the
 * spline. This composable owns load + place + dispose only; per-frame
 * position / orientation / banking lives in useFlightPath.
 *
 * Pattern adapted from jet-engine-infographic/src/model-loader.js. DRACO
 * decoder loads from Google's CDN (matches AoT) — saves ~1MB of decoder
 * files in /public.
 *
 * ── Orientation contract ──────────────────────────────────────────────
 * The flight rig is a parent pivot `Group`; the normalized GLB sits
 * inside it, recentred on the pivot's origin and oriented so its NOSE
 * points along the pivot's local +Z. That convention is what lets the
 * flight loop use `pivot.lookAt(point + tangent)` — THREE's Object3D
 * lookAt aligns an object's local +Z toward the target — to fly the
 * aircraft nose-first down the spline, then `pivot.rotateZ(roll)` to bank
 * about the nose axis. (The repo's parked-pose code noses the model +X
 * via rotation.y = π/2; the flight rig re-derives orientation for the
 * +Z-forward convention instead.)
 */

const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
const TARGET_FUSELAGE_LENGTH = 30 // scene units; sized to feel cinematic in the chase rig

/*
 * Rotation applied to the raw GLB so its nose ends up along the pivot's
 * local +Z (travel direction). The A350 GLB ships nose-along-+Z already,
 * so this is a no-op (0). Kept as a single tunable: if the aircraft ever
 * flies sideways/backwards, this is the one value to adjust (e.g. Math.PI
 * to flip front/back, ±π/2 to swap a +X/+Z nose).
 */
const NOSE_ALIGN_Y = 0

let loader: GLTFLoader | null = null
let model: THREE.Group | null = null // normalized GLB (recentred inside the pivot)
let pivot: THREE.Group | null = null // what the flight loop positions / orients
let scene: THREE.Scene | null = null

// Wingtip emit points (pivot-local) + measured span, derived from the
// normalized model bounds. Consumed by the contrail emitters.
const wingtips = {
  left: new THREE.Vector3(),
  right: new THREE.Vector3(),
  halfSpan: 0,
}

function getLoader(): GLTFLoader {
  if (loader) return loader
  const draco = new DRACOLoader()
  draco.setDecoderPath(DRACO_DECODER)
  draco.preload()
  loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  return loader
}

function normalizeModel(g: THREE.Group): THREE.Group {
  // Orient the nose to +Z (see orientation contract above).
  g.rotation.y = NOSE_ALIGN_Y

  // Scale: pull the longest horizontal axis down to the target length.
  let box = new THREE.Box3().setFromObject(g)
  const size = new THREE.Vector3()
  box.getSize(size)
  const longest = Math.max(size.x, size.z)
  if (longest > 0) g.scale.setScalar(TARGET_FUSELAGE_LENGTH / longest)

  // Recenter on origin so the pivot rotates about the aircraft's centre,
  // not its model origin. Done on the inner group so the offset survives
  // the flight loop overwriting the pivot's position every frame.
  box = new THREE.Box3().setFromObject(g)
  const center = new THREE.Vector3()
  box.getCenter(center)
  g.position.sub(center)

  // Measure wingtips from the normalized, centred bounds. Nose is +Z, so
  // the wing span runs along X. Emit just inboard of the tip (×0.92),
  // slightly below and slightly aft so the ribbons trail off the wing.
  box = new THREE.Box3().setFromObject(g)
  box.getSize(size)
  wingtips.halfSpan = size.x / 2
  const tipX = wingtips.halfSpan * 0.92
  const tipY = -size.y * 0.12
  const tipZ = -size.z * 0.08 // nose is +Z, so a small −Z offset trails the emit point slightly aft
  wingtips.left.set(tipX, tipY, tipZ)
  wingtips.right.set(-tipX, tipY, tipZ)

  // Materials — keep default PBR. Patch transparent + sRGB on textures so
  // opacity reveals work and colour space matches the renderer.
  g.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        m.transparent = true
        const mat = m as THREE.MeshStandardMaterial
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
        if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
        m.needsUpdate = true
      })
    }
  })

  return g
}

export function useFlightAircraft() {
  /**
   * Load the GLB, wrap it in a pivot group, and add the pivot to the
   * given scene. Resolves with the pivot once mounted. Safe to call when
   * already loaded — just re-adds to the (possibly new) scene.
   */
  function load(targetScene: THREE.Scene): Promise<THREE.Group> {
    scene = targetScene
    if (pivot) {
      if (!targetScene.children.includes(pivot)) targetScene.add(pivot)
      return Promise.resolve(pivot)
    }
    return new Promise((resolve, reject) => {
      getLoader().load(
        '/models/a350.glb',
        (gltf) => {
          model = normalizeModel(gltf.scene)
          pivot = new THREE.Group()
          pivot.name = 'aircraft-pivot'
          pivot.add(model)
          targetScene.add(pivot)
          resolve(pivot)
        },
        undefined,
        (err) => {
          console.warn('[useFlightAircraft] GLB load failed', err)
          reject(err)
        },
      )
    })
  }

  /** The pivot the flight loop positions / orients / banks. Null until loaded. */
  function getPivot(): THREE.Group | null {
    return pivot
  }

  /** The inner normalized GLB. Null until loaded. */
  function getModel(): THREE.Group | null {
    return model
  }

  /**
   * Wingtip emit points (pivot-local) + measured half-span. Consumed by
   * the contrail emitters, transformed to world via the pivot transform.
   */
  function getWingtips() {
    return wingtips
  }

  /**
   * Flat array of materials on the loaded aircraft. Used by the flight
   * reveal to opacity-tween them in. Empty until the GLB has loaded.
   */
  function getMaterials(): THREE.Material[] {
    if (!model) return []
    const mats: THREE.Material[] = []
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = (child as THREE.Mesh).material
        if (Array.isArray(m)) mats.push(...m)
        else if (m) mats.push(m)
      }
    })
    return mats
  }

  function destroy() {
    if (pivot && scene) scene.remove(pivot)
    if (model) {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry?.dispose()
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((m) => m?.dispose())
        }
      })
    }
    model = null
    pivot = null
    scene = null
  }

  return { load, getPivot, getModel, getWingtips, getMaterials, destroy }
}
