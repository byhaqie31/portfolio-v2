import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/*
 * 3D aircraft lifecycle. Loads the A350 GLB into an existing Three.js
 * scene, normalizes its orientation/scale, places it at the initial
 * cruise pose, and tears down cleanly. Pose (pitch, height) across
 * scroll is owned by useFlightScroll — this composable is just the
 * load + place + dispose lifecycle.
 *
 * Pattern adapted from jet-engine-infographic/src/model-loader.js.
 * Differences from AoT:
 *   - No procedural fallback (we have the PNG silhouette as Plan B if
 *     the GLB itself can't load).
 *   - No AXEL NOVA livery shader patch (default materials for now).
 *
 * DRACO decoder loads from Google's CDN (matches AoT) — saves ~1MB
 * of decoder files in /public.
 */

const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
const TARGET_FUSELAGE_LENGTH = 30 // scene units; sized to feel cinematic at z=-45

let loader: GLTFLoader | null = null
let model: THREE.Group | null = null
let scene: THREE.Scene | null = null

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
  // The A350 GLB has its nose at +Z and wings along X. For a side-profile
  // flyby we want the nose to point along the travel axis. We'll handle
  // direction at flyby time by re-setting rotation — here we just normalize
  // to nose-along-+X as a canonical orientation.
  g.rotation.y = Math.PI / 2

  // Scale: pull the longest horizontal axis down to the target length.
  const box = new THREE.Box3().setFromObject(g)
  const size = new THREE.Vector3()
  box.getSize(size)
  const longest = Math.max(size.x, size.z)
  if (longest > 0) g.scale.setScalar(TARGET_FUSELAGE_LENGTH / longest)

  // Recenter on origin so position transforms read intuitively.
  box.setFromObject(g)
  const center = new THREE.Vector3()
  box.getCenter(center)
  g.position.sub(center)

  // Materials — keep default PBR. Patch transparent + sRGB on textures so
  // GSAP opacity tweens work later and colour space matches the renderer.
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
   * Load the GLB and add it to the given scene. Returns a promise that
   * resolves once the model is ready and mounted. Safe to call when
   * the model is already loaded — just re-adds to the (possibly new) scene.
   */
  function load(targetScene: THREE.Scene): Promise<THREE.Group> {
    scene = targetScene
    if (model) {
      if (!targetScene.children.includes(model)) targetScene.add(model)
      return Promise.resolve(model)
    }
    return new Promise((resolve, reject) => {
      getLoader().load(
        '/models/a350.glb',
        (gltf) => {
          model = normalizeModel(gltf.scene)
          targetScene.add(model)
          resolve(model)
        },
        undefined,
        (err) => {
          console.warn('[useFlightAircraft] GLB load failed', err)
          reject(err)
        },
      )
    })
  }

  /**
   * Place the aircraft at its initial cruise pose. From here, the
   * useFlightScroll choreography ScrollTrigger owns rotation.x (pitch)
   * and position.y (height) and scrubs them across the post-pin scroll
   * distance — pitch up for takeoff, level for cruise, pitch down +
   * drop for descent and landing.
   *
   * Coordinates: camera at origin looking at (0, 0, -1) with FOV 55°.
   * Aircraft sits at z=-45 (cinematic distance), y=2 (just above eye
   * level so the lower-third masthead has room beneath), nose pointing
   * +X (the viewer sees the aircraft in profile).
   */
  function startCruise() {
    if (!model) return
    model.rotation.set(0, Math.PI / 2, 0)
    model.position.set(0, 2, -45)
  }

  /**
   * Returns the loaded model (THREE.Group) so external composables can
   * tween its rotation/position. Returns null until the GLB has loaded.
   */
  function getModel(): THREE.Group | null {
    return model
  }

  /**
   * Returns the flat array of materials on the loaded aircraft. Used by
   * useFlightScroll to opacity-tween them as the iris reveals. Returns
   * an empty array if the model hasn't loaded yet.
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
    if (model && scene) {
      scene.remove(model)
    }
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
    scene = null
  }

  return { load, startCruise, getModel, getMaterials, destroy }
}
