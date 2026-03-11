/**
 * useCommandPalette — global state for the command palette (⌘K).
 * Share state across Navbar and CommandPalette components.
 */
const isOpen = ref(false)
const query = ref('')

export function useCommandPalette() {
  function open() {
    isOpen.value = true
    query.value = ''
  }

  function close() {
    isOpen.value = false
    query.value = ''
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  // ⌘K / Ctrl+K shortcut
  function setupShortcut() {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape' && isOpen.value) {
        close()
      }
    }

    onMounted(() => window.addEventListener('keydown', handler))
    onUnmounted(() => window.removeEventListener('keydown', handler))
  }

  return { isOpen, query, open, close, toggle, setupShortcut }
}
