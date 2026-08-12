// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/api/**': { proxy: 'http://localhost:8787/api/**' }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8787/api',
        changeOrigin: true
      }
    }
  },
  app: {
    head: {
      title: 'Dahua Secure Camera Portal',
      meta: [
        { name: 'description', content: 'Secure camera access portal with Cloudflare Workers backend' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap' }
      ]
    }
  }
});
