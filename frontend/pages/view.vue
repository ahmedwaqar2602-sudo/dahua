<template>
  <div class="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
    <!-- Header -->
    <header class="p-4 border-b border-neutral-900 flex items-center justify-between z-10 bg-black/80 backdrop-blur-md">
      <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Secure Camera Feed
      </h1>
      <div v-if="streams.length > 0" class="flex items-center gap-2">
        <span class="flex h-3 w-3 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-medium text-emerald-400 uppercase tracking-widest">Live</span>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 relative flex items-center justify-center p-4">
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-neutral-400 text-sm animate-pulse">Authenticating stream access...</span>
      </div>

      <div v-else-if="error" class="max-w-md w-full text-center space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 mb-4">
          <!-- Lock Icon -->
          <svg class="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Access Denied</h2>
        <p class="text-neutral-400">{{ error }}</p>
      </div>

      <div v-else-if="streams.length > 0" class="absolute inset-0 p-4">
        <div class="w-full h-full grid gap-4" :style="gridStyle">
          <div v-for="stream in streams" :key="stream.id" class="relative group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
            <!-- Camera Name Overlay -->
            <div class="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-xs font-medium text-white">{{ stream.display_name || stream.name }}</span>
            </div>
            
            <iframe
              :src="stream.streamUrl"
              class="w-full h-full border-none pointer-events-none"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.query.token

const loading = ref(true)
const error = ref('')
const streams = ref([])

const gridStyle = computed(() => {
  const count = streams.value.length;
  if (count === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }
  if (count === 2) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' }
  if (count <= 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }
  if (count <= 6) return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }
  return { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }
})

const sendAuditLog = (action) => {
  if (!token) return
  const url = '/api/view/log'
  const data = new URLSearchParams()
  data.append('token', token)
  data.append('action', action)
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data)
  } else {
    // fallback
    fetch(url, {
      method: 'POST',
      body: data,
      keepalive: true
    }).catch(console.error)
  }
}

const verifyToken = async () => {
  if (!token) {
    error.value = 'No access token provided in the URL.'
    loading.value = false
    return
  }

  try {
    const res = await $fetch(`/api/view/verify?token=${encodeURIComponent(token)}`)
    if (res.success) {
      streams.value = res.streams
    } else {
      error.value = res.message || 'Access denied.'
    }
  } catch (err) {
    if (err.data && (err.data.error || err.data.message)) {
      error.value = err.data.error || err.data.message
    } else {
      error.value = 'Failed to verify token. Server might be unreachable.'
    }
  } finally {
    loading.value = false
  }
}

const handleUnload = () => {
  sendAuditLog('EXIT')
}

onMounted(() => {
  sendAuditLog('ENTER')
  verifyToken()
  window.addEventListener('beforeunload', handleUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleUnload)
  // Ensure EXIT is logged if component is unmounted directly via router
  sendAuditLog('EXIT')
})
</script>
