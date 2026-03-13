// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-13',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxt/icon'],

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
