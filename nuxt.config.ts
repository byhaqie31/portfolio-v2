// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-13',
  devtools: { enabled: true },

  modules: ['@nuxtjs/google-fonts', '@nuxt/icon', '@nuxt/ui'],

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

  googleFonts: {
    families: {
      'Orbitron': [400, 700, 900],
      'DM Mono': [300, 400, 500],
      'Syne': [400, 600, 800],
    },
    display: 'swap',
    preload: true,
  },

  app: {
    head: {
      title: 'Ahmad Baihaqie — Software Engineer',
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/ABIcon.svg' },
      ],
      meta: [
        { name: 'description', content: 'Software engineer portfolio — Ahmad Baihaqie' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#020408' },
      ],
    },
  },
})
