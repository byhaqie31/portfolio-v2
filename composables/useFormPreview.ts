import type { Ref } from 'vue'

/**
 * Auto-syncs an admin form's reactive state to the preview store
 * so the embedded preview iframe (and any open preview tabs) update
 * live as the user types.
 */
export function useFormPreview<T>(previewKey: string, form: Ref<T>) {
  const { set } = usePreview()

  watch(
    form,
    (val) => set(previewKey, val),
    { deep: true, immediate: true },
  )
}
