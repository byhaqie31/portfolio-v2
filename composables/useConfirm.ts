interface ConfirmState {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default' | 'success'
}

const visible = ref(false)
const state = ref<ConfirmState>({ title: '', message: '' })
let resolvePromise: ((value: boolean) => void) | null = null

export function useConfirm() {
  function confirm(options: ConfirmState): Promise<boolean> {
    state.value = options
    visible.value = true
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function success(options: { title: string; message: string }) {
    state.value = { ...options, variant: 'success' }
    visible.value = true
    resolvePromise = null
  }

  function resolve(value: boolean) {
    visible.value = false
    resolvePromise?.(value)
    resolvePromise = null
  }

  return { visible: readonly(visible), state: readonly(state), confirm, success, resolve }
}
