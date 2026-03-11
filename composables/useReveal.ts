/**
 * useReveal — adds .is-visible to elements with .reveal class when they enter the viewport.
 * Usage: call useReveal() in any component's onMounted (or just use it in a layout/page).
 */
export function useReveal() {
  const observer = ref<IntersectionObserver | null>(null)

  function init() {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.value?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.value?.observe(el)
    })
  }

  onMounted(() => init())
  onUnmounted(() => observer.value?.disconnect())
}
