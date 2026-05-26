// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-13',
  devtools: { enabled: true },

  modules: ['@nuxt/icon', '@nuxt/ui', '@nuxtjs/sitemap'],

  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
  },

  site: {
    url: 'https://baihaqie.com',
    name: 'Ahmad Baihaqie — Software Engineer',
  },

  sitemap: {
    exclude: ['/admin/**', '/feedback/**'],
  },

  // The admin preview route renders client-only — its data layer reads
  // from a localStorage-backed preview store that doesn't exist on the
  // server. SSRing it would prefetch the real API and lock the iframe
  // onto published data instead of the in-progress edits.
  routeRules: {
    '/admin/preview': { ssr: false },
  },

  icon: {
    serverBundle: 'local',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Ahmad Baihaqie — Software Engineer',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/ABIcon.svg' },
      ],
      meta: [
        { name: 'description', content: 'Software engineer portfolio — Ahmad Baihaqie' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#fbfbfc', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#14161a', media: '(prefers-color-scheme: dark)' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Ahmad Baihaqie' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },
})
