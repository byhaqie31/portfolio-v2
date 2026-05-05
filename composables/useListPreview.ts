import type { Ref } from 'vue'

interface Options<F = any> {
  /** The in-progress edit form (optional). When `open` is true, this gets merged into the preview list. */
  form?: Ref<F>
  /** The item currently being edited (null when creating). */
  editing?: Ref<any>
  /** Whether the edit modal is open — only then does form merge happen. */
  open?: Ref<boolean>
  /** Field name to filter on (e.g. 'is_visible' for projects, 'is_public' for feedback). Items with falsy values are removed from the preview. */
  visibleField?: string
}

/**
 * Live-preview wrapper for list-based admin tabs.
 *
 * - Watches the saved list and syncs to the preview store on every change
 *   (so saves, deletes, and visibility toggles reflect immediately).
 * - When the edit modal is open, merges the in-progress form into the
 *   preview list so typing reflects live (replaces the edited item, or
 *   appends when creating).
 * - Optionally filters by a visibility field so the preview matches what
 *   public visitors actually see.
 */
export function useListPreview<T extends { id?: any }>(
  previewKey: string,
  list: Ref<T[]>,
  options: Options = {},
) {
  const previewList = computed(() => {
    let base = [...list.value]

    if (options.open?.value && options.form?.value) {
      const formVal = options.form.value
      const editingVal = options.editing?.value
      if (editingVal && editingVal.id !== undefined) {
        base = base.map((item) =>
          (item as any).id === editingVal.id ? { ...item, ...formVal } : item,
        )
      } else {
        base = [...base, formVal]
      }
    }

    if (options.visibleField) {
      const field = options.visibleField
      base = base.filter((item: any) => {
        const v = item?.[field]
        return v !== false && v !== 0
      })
    }

    return base
  })

  useFormPreview(previewKey, previewList)
}
