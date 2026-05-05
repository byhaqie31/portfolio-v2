const PREVIEW_PATH = '/admin/preview'

/**
 * Per-document override store. Parent admin and the iframe each get their
 * own instance — they stay in sync via direct `postMessage`.
 */
const store = ref<Record<string, any>>({})

/** Refresh functions registered by `usePreviewableFetch` calls so a parent
 *  message can trigger a real API re-fetch on the iframe side. */
const refreshRegistry = new Map<string, () => Promise<any>>()

let listenersInstalled = false

function clone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

function postToIframes(message: any) {
  if (typeof document === 'undefined') return
  document.querySelectorAll('iframe').forEach((frame) => {
    try {
      frame.contentWindow?.postMessage(message, window.location.origin)
    } catch {
      /* cross-origin or detached — ignore */
    }
  })
}

function postToParent(message: any) {
  if (typeof window === 'undefined') return
  if (window.parent === window) return
  try {
    window.parent.postMessage(message, window.location.origin)
  } catch {
    /* ignore */
  }
}

function installListeners() {
  if (listenersInstalled || !import.meta.client) return
  listenersInstalled = true

  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return
    const data = e.data
    if (!data?.type) return

    switch (data.type) {
      // Parent → iframe: a single key changed
      case 'preview:set':
        if (data.key) store.value = { ...store.value, [data.key]: data.value }
        break

      // Parent → iframe: full state replace (initial-state response)
      case 'preview:state':
        if (data.data) store.value = data.data
        break

      // Parent → iframe: drop overlay for a key (or all) so the section
      // falls back to API data
      case 'preview:clear':
        if (data.key) {
          const next = { ...store.value }
          delete next[data.key]
          store.value = next
        } else {
          store.value = {}
        }
        break

      // Parent → iframe: re-fetch the underlying API for a key (or all)
      case 'preview:refresh': {
        const fn = data.key ? refreshRegistry.get(data.key) : null
        if (fn) {
          fn()
        } else if (!data.key) {
          refreshRegistry.forEach((f) => f())
        }
        break
      }

      // Iframe → parent: send me your current overlay state
      case 'preview:request':
        postToIframes({ type: 'preview:state', data: store.value })
        break
    }
  })
}

export function usePreview() {
  const route = useRoute()
  const isPreviewRoute = computed(() => route.path === PREVIEW_PATH)

  function init() {
    if (!import.meta.client) return
    installListeners()
    // Iframe context: ask parent for whatever overlay state it already has
    if (isPreviewRoute.value && window.parent !== window) {
      postToParent({ type: 'preview:request' })
    }
  }

  function set<T = any>(key: string, value: T) {
    const cloned = clone(value)
    store.value = { ...store.value, [key]: cloned }
    postToIframes({ type: 'preview:set', key, value: cloned })
  }

  function get<T = any>(key: string): T | undefined {
    return store.value[key] as T | undefined
  }

  /** Drop overlay for a key (or all). Iframe sections fall back to API. */
  function clear(key?: string) {
    if (key) {
      const next = { ...store.value }
      delete next[key]
      store.value = next
      postToIframes({ type: 'preview:clear', key })
    } else {
      store.value = {}
      postToIframes({ type: 'preview:clear' })
    }
  }

  /** Tell iframe sections to re-call their underlying API endpoint. */
  function refresh(key?: string) {
    postToIframes({ type: 'preview:refresh', key })
  }

  /** After a successful save: drop overlay + re-fetch API in one step. */
  function commit(key?: string) {
    clear(key)
    refresh(key)
  }

  return { isPreviewRoute, init, set, get, clear, refresh, commit }
}

/**
 * Drop-in replacement for `useFetch` that:
 *  - On the public site: behaves exactly like `useFetch`.
 *  - Inside the preview iframe (`/admin/preview`): still hits the real API
 *    so the iframe can show the live DB state, but layers an in-memory
 *    overlay on top so admin form edits show through before they're saved.
 *    The overlay is updated via `postMessage` from the parent admin page.
 */
export async function usePreviewableFetch<T = any>(
  previewKey: string,
  url: string,
  options: any = {},
): Promise<{ data: any; pending: any; error: any; refresh: () => Promise<void> }> {
  const { isPreviewRoute, get, init } = usePreview()

  if (isPreviewRoute.value) {
    if (import.meta.client) init()

    const apiResult = await useFetch<T>(url, options)

    if (import.meta.client) {
      refreshRegistry.set(previewKey, apiResult.refresh as () => Promise<any>)
    }

    const fallback = options.default ? options.default() : null
    const data = computed(() => {
      const override = get<T>(previewKey)
      if (override !== undefined) return override
      const api = (apiResult.data as any).value
      return (api ?? fallback) as T
    })

    return {
      data,
      pending: apiResult.pending,
      error: apiResult.error,
      refresh: apiResult.refresh as () => Promise<void>,
    }
  }

  return (await useFetch<T>(url, options)) as any
}
