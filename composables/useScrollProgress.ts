/**
 * useScrollProgress — returns a reactive scroll progress value (0–1).
 * Bind to a CSS transform: scaleX() for a progress bar.
 */
export function useScrollProgress() {
  const progress = ref(0)

  function update() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    progress.value = docHeight > 0 ? scrollTop / docHeight : 0
  }

  onMounted(() => {
    window.addEventListener('scroll', update, { passive: true })
    update()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', update)
  })

  return { progress }
}
