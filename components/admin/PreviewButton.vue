<script setup lang="ts">
const props = defineProps<{
  previewKey: string
  data: any
  label?: string
}>()

const { set } = usePreview()

watch(
  () => props.data,
  (val) => set(props.previewKey, val),
  { deep: true },
)

function openPreview() {
  set(props.previewKey, props.data)
  if (import.meta.client) {
    window.open('/admin/preview', '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <button
    type="button"
    class="btn-ghost inline-flex items-center gap-2"
    @click="openPreview"
  >
    <Icon name="fluent:eye-16-filled" size="14" />
    {{ label || 'Preview' }}
  </button>
</template>
