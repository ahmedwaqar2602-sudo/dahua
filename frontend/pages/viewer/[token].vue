<template>
  <div class="h-screen w-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-cyan-500/30 relative">
    
    <!-- Top Header -->
    <header class="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30">
      <div class="flex items-center gap-4">
        <div class="text-cyan-400">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
            <circle cx="12" cy="14" r="2" class="text-rose-500"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-100">Restricted Viewer Portal</h1>
          <p class="text-[10px] text-slate-400">Viewing {{ streams.length }} authorized cameras</p>
        </div>
      </div>
      
      <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-1.5 rounded text-xs font-bold">
        {{ errorMsg }}
      </div>
      <div v-else-if="isLoading" class="flex items-center gap-2 text-cyan-400 text-sm font-bold">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
        Authenticating...
      </div>
      <div v-else class="text-emerald-400 text-xs font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Secure Connection
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col relative z-10 bg-slate-950">
        
        <!-- Filter Toolbar -->
        <div class="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 font-semibold text-sm">
              <svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              Authorized Cameras
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400 font-medium">Camera names</span>
              <div @click="showCameraNames = !showCameraNames" class="w-3.5 h-3.5 rounded-sm border border-cyan-500 flex items-center justify-center cursor-pointer transition-colors" :class="showCameraNames ? 'bg-cyan-500' : 'bg-transparent'">
                <svg v-if="showCameraNames" class="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Camera Grid -->
        <div class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-32">
          
          <div v-if="!isLoading && streams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            <div v-for="cam in streams" :key="cam.id" class="bg-slate-900/60 backdrop-blur-md rounded-md overflow-hidden shadow-lg border border-slate-800 relative aspect-video">
              
              <!-- DVR Scrubber Overlay View -->
              <div v-if="isScrubbing" class="absolute inset-0 z-20 bg-black">
                <img :src="\`http://localhost:1984/api/frame.jpeg?src=\${encodeURIComponent(cam.name)}\`" class="w-full h-full object-cover opacity-60" />
                <!-- Glitch/Overlay effect for DVR -->
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiPjwvcmVjdD4KPC9zdmc+')] pointer-events-none"></div>
                <div class="absolute top-4 right-4 bg-rose-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-300 animate-pulse"></span> REC 
                </div>
                <!-- DVR Timestamp -->
                <div class="absolute top-4 left-4 bg-black/70 text-cyan-400 font-mono text-sm px-3 py-1 rounded backdrop-blur">
                  {{ simulatedPlaybackDate }}
                </div>
                <!-- Playback Overlay icon -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <svg class="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>

              <!-- Live Stream (when not scrubbing) -->
              <iframe v-else :src="cam.streamUrl" class="w-full h-full border-none pointer-events-none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
              
              <div v-if="showCameraNames" class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 pointer-events-none z-30">
                <span class="text-white text-xs font-semibold drop-shadow-md flex items-center gap-2">
                  {{ cam.display_name || cam.name }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="!isLoading && streams.length === 0 && !errorMsg" class="flex flex-col items-center justify-center h-64 border border-dashed border-slate-700 rounded-xl text-slate-500">
            <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="text-sm font-medium">No cameras authorized or available.</span>
          </div>

        </div>
        
        <!-- DVR Playback Timeline -->
        <div v-if="!errorMsg && !isLoading" class="absolute bottom-4 left-4 right-4 bg-slate-900/60 backdrop-blur-md/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-4 flex flex-col z-40">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-slate-200">24/7 NVR Playback</span>
              <button class="bg-slate-800 px-2 py-1 rounded text-[10px] text-cyan-400 border border-cyan-500/30">Mocked Interface</button>
            </div>
            <div class="text-xs text-rose-400 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Recording Active</div>
          </div>
          
          <!-- Interactive Timeline Scrubber -->
          <div class="relative h-16 w-full flex items-center justify-between text-[10px] text-slate-500 font-medium px-2 border-t border-slate-800 pt-6 mt-2 cursor-pointer group" @mousedown="startScrub" @mousemove="onScrub" @mouseup="endScrub" @mouseleave="endScrub">
            <!-- Time Markers -->
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">00:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">04:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">08:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">12:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">16:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">20:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            <div class="flex flex-col items-center pointer-events-none"><span class="mb-1">24:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
            
            <!-- Event Bars -->
            <div class="absolute top-10 left-[15%] w-[10%] h-1.5 bg-cyan-500 rounded-full pointer-events-none"></div>
            <div class="absolute top-10 left-[35%] w-[20%] h-1.5 bg-amber-500 rounded-full pointer-events-none"></div>
            <div class="absolute top-10 right-[10%] w-[15%] h-1.5 bg-amber-500 rounded-full pointer-events-none"></div>
            <div class="absolute top-10 right-[12%] w-[25%] h-1.5 bg-cyan-500 rounded-full pointer-events-none"></div>
            
            <!-- Current Time Scrubber Pill -->
            <div class="absolute top-2 -translate-x-1/2 -translate-y-full bg-white text-slate-950 px-4 py-1.5 rounded shadow-[0_4px_15px_rgba(0,0,0,0.3)] font-bold text-xs whitespace-nowrap transition-transform duration-75 pointer-events-none" :style="{ left: scrubPercentage + '%' }">
              {{ simulatedPlaybackTime }}
              <div class="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
              <!-- Vertical Scrubber Line -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-20 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-[-1]"></div>
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center gap-4 text-[10px] font-semibold text-slate-400">
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-300"></div> Person</span>
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-500"></div> Vehicle</span>
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-cyan-500"></div> All motion</span>
            </div>
            <button @click="resetToLive" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-1.5 rounded-full text-xs font-bold transition-colors shadow-lg">Return to Live</button>
          </div>
        </div>
        
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token

const isLoading = ref(true)
const errorMsg = ref('')
const streams = ref([])
const showCameraNames = ref(true)

// Playback & Scrubber State
const isScrubbing = ref(false)
const isDragging = ref(false)
const scrubPercentage = ref(100) // 100% = Live (right edge)

const simulatedPlaybackTime = computed(() => {
  // Convert 0-100% to a HH:MM format
  if (scrubPercentage.value >= 99) return 'LIVE'
  const totalMinutes = Math.floor((scrubPercentage.value / 100) * 1440)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return \`\${hours.toString().padStart(2, '0')}:\${mins.toString().padStart(2, '0')}\`
})

const simulatedPlaybackDate = computed(() => {
  const d = new Date()
  const dateStr = d.toISOString().split('T')[0]
  return \`\${dateStr} \${simulatedPlaybackTime.value}\`
})

const startScrub = (e) => {
  isDragging.value = true
  isScrubbing.value = true
  onScrub(e)
}

const onScrub = (e) => {
  if (!isDragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  let x = e.clientX - rect.left
  if (x < 0) x = 0
  if (x > rect.width) x = rect.width
  scrubPercentage.value = (x / rect.width) * 100
}

const endScrub = () => {
  isDragging.value = false
}

const resetToLive = () => {
  scrubPercentage.value = 100
  isScrubbing.value = false
}

// Data Fetching
onMounted(async () => {
  if (!token) {
    errorMsg.value = 'Invalid access token URL'
    isLoading.value = false
    return
  }

  try {
    const res = await $fetch(\`/api/view/verify?token=\${token}\`)
    if (res.success) {
      streams.value = res.streams
      
      // Log the entrance
      await $fetch('/api/view/log', {
        method: 'POST',
        body: { token, action: 'ENTER' }
      }).catch(e => console.error('Failed to log access'))
      
    } else {
      errorMsg.value = res.message || 'Access Denied'
    }
  } catch(e) {
    errorMsg.value = 'Network error or token expired'
  } finally {
    isLoading.value = false
  }
})

onUnmounted(async () => {
  if (!errorMsg.value && token) {
    // Attempt to log exit
    try {
      await navigator.sendBeacon('/api/view/log', JSON.stringify({ token, action: 'EXIT' }))
    } catch(e) {}
  }
})
</script>
