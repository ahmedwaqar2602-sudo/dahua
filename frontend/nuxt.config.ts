// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/api/dvr/**': { proxy: 'http://localhost:4002/api/dvr/**' },
    '/clips/**': { proxy: 'http://localhost:4002/clips/**' },
    '/api/**': { proxy: 'https://dahua.ahmedwaqar-0208.workers.dev/api/**' },
    '/admin/dashboard': { redirect: '/' },
    '/admin/login': { redirect: '/' },
    '/admin/**': { redirect: '/' },
    '/admin': { redirect: '/' }
  },
  nitro: {
    devProxy: {
      '/api/dvr': {
        target: 'http://localhost:4002/api/dvr',
        changeOrigin: true
      },
      '/clips': {
        target: 'http://localhost:4002/clips',
        changeOrigin: true
      },
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
