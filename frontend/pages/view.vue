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
          <h1 class="text-lg font-bold text-slate-100 flex items-center gap-2">
            Viewer Portal
            <span v-if="userLabel" class="text-xs font-normal text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">{{ userLabel }}</span>
          </h1>
          <p class="text-[10px] text-slate-400">Viewing {{ streams.length }} authorized camera stream(s)</p>
        </div>
      </div>
      
      <!-- Center: Time Limit / Schedule Remaining Badge -->
      <div v-if="!errorMsg && !isLoading" class="flex items-center gap-3">
        <div v-if="expiresAt" class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
          <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Time Remaining: <strong class="font-mono text-amber-200">{{ remainingTimeText }}</strong></span>
        </div>
        <div v-else-if="dailyStartTime && dailyEndTime" class="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
          <span>Daily Window: <strong class="font-mono text-indigo-200">{{ dailyStartTime }} - {{ dailyEndTime }}</strong></span>
        </div>

        <!-- Permissions Badges -->
        <div class="hidden sm:flex items-center gap-2 text-[10px]">
          <span v-if="allowPtz" class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">PTZ Rights</span>
          <span v-if="allowRecording" class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">Recording Rights</span>
        </div>
      </div>

      <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        {{ errorMsg }}
      </div>
      <div v-else-if="isLoading" class="flex items-center gap-2 text-cyan-400 text-sm font-bold">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
        Authenticating...
      </div>
      <div v-else class="text-emerald-400 text-xs font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Secure Active Session
      </div>
    </header>

    <!-- Error State Overlay -->
    <div v-if="errorMsg" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-100 mb-2">Access Denied or Expired</h2>
      <p class="text-sm text-slate-400 max-w-md">{{ errorMsg }}</p>
      <p class="text-xs text-slate-500 mt-4">Please contact your administrator to generate a renewed access link.</p>
    </div>

    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col relative z-10 bg-slate-950">
        
        <!-- Filter Toolbar -->
        <div class="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 font-semibold text-sm">
              <svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              Authorized Live Feeds
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button v-if="activeCamera && allowAudio" @click="openAudioStream(activeCamera)" class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 transition-all">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
              Listen Audio
            </button>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400 font-medium">Names</span>
              <div @click="showCameraNames = !showCameraNames" class="w-3.5 h-3.5 rounded-sm border border-cyan-500 flex items-center justify-center cursor-pointer transition-colors" :class="showCameraNames ? 'bg-cyan-500' : 'bg-transparent'">
                <svg v-if="showCameraNames" class="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Camera Grid + PTZ Overlay Row -->
        <div class="flex-1 flex overflow-hidden">
          <div class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex flex-col">
            
            <div v-if="!isLoading && streams.length > 0" class="flex-1 grid gap-4 items-center justify-center" :class="streams.length === 1 ? 'grid-cols-1 max-w-5xl mx-auto w-full' : 'grid-cols-1 md:grid-cols-2 w-full'">
              <div v-for="cam in streams" :key="cam.id" @click="activeCamera = cam" class="bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border relative aspect-video transition-all cursor-pointer group flex items-center justify-center" :class="activeCamera?.id === cam.id ? 'border-cyan-500 shadow-cyan-500/20 ring-1 ring-cyan-500/50' : 'border-slate-800 hover:border-slate-700'">

                <!-- Live Stream Player (WebRTC Low-Latency) with Digital Zoom & ePTZ -->
                <div class="w-full h-full overflow-hidden relative flex items-center justify-center bg-black">
                  <iframe 
                    :id="'iframe-' + cam.id"
                    :src="getStreamUrl(cam)" 
                    class="w-full h-full border-none pointer-events-none transform origin-center transition-transform duration-200"
                    :style="{ transform: `scale(${getCamZoom(cam.id)}) translate(${getCamPanX(cam.id)}px, ${getCamPanY(cam.id)}px)` }"
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                  </iframe>
                </div>
                
                <!-- Camera Header / Brand -->
                <div class="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2 border border-white/10 pointer-events-none z-10 shadow-lg">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {{ cam.display_name || cam.name }}
                </div>

                <!-- Digital Zoom Badge Overlay -->
                <div v-if="getCamZoom(cam.id) > 1" class="absolute top-3.5 left-48 bg-cyan-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg backdrop-blur flex items-center gap-1.5 z-20">
                  <span>{{ getCamZoom(cam.id) }}x Zoom</span>
                  <button @click.stop="resetZoomCam(cam.id)" class="hover:text-rose-300 font-bold ml-1" title="Reset Zoom">✕</button>
                </div>

                <!-- Top Right Controls: Voice Toggle & PTZ Active Indicator -->
                <div class="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
                  <!-- Voice ON / OFF Button -->
                  <button v-if="allowAudio" @click.stop="toggleAudio(cam)" class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all" :class="isAudioOn(cam) ? 'bg-emerald-600 text-white shadow-emerald-600/40' : 'bg-black/75 hover:bg-slate-800 text-slate-300 border border-white/10'">
                    <svg v-if="isAudioOn(cam)" class="w-3.5 h-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
                    <svg v-else class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                    <span>{{ isAudioOn(cam) ? 'Voice ON' : 'Voice Muted' }}</span>
                  </button>

                  <!-- Active PTZ Selection Marker -->
                  <div v-if="allowPtz && activeCamera?.capabilities?.ptz && activeCamera?.id === cam.id" class="bg-cyan-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    PTZ Active
                  </div>
                </div>

              </div>
            </div>
            
            <div v-if="!isLoading && streams.length === 0" class="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-xl text-slate-500">
              <span class="text-sm font-medium">No cameras authorized for this token.</span>
            </div>

          </div>

          <!-- PTZ Camera Movement Controls Sidebar (If Allowed in Given Time) -->
          <div v-if="allowPtz && activeCamera?.capabilities?.ptz && streams.length > 0" class="w-80 bg-slate-900/95 border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
            <div>
              <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  Camera Movement & Zoom
                </span>
                <span class="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono font-bold">ALLOWED</span>
              </div>
              <p class="text-[11px] text-slate-400 mb-3">Control: <strong class="text-cyan-300">{{ activeCamera?.display_name || 'Selected Camera' }}</strong></p>

              <!-- PTZ Pad -->
              <div class="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner my-2">
                <!-- UP -->
                <button @click="sendPtz('UP')" class="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all mb-2" title="Tilt Up">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                </button>
                
                <div class="flex items-center justify-center gap-2.5 w-full">
                  <!-- LEFT -->
                  <button @click="sendPtz('LEFT')" class="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all" title="Pan Left">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
                  </button>

                  <!-- STOP -->
                  <button @click="sendPtz('STOP')" class="w-11 h-11 bg-slate-900 border border-slate-700 hover:bg-rose-600 active:scale-95 text-slate-300 hover:text-white rounded-xl flex items-center justify-center shadow-lg transition-all font-bold text-[11px]" title="Stop">
                    STOP
                  </button>

                  <!-- RIGHT -->
                  <button @click="sendPtz('RIGHT')" class="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all" title="Pan Right">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <!-- DOWN -->
                <button @click="sendPtz('DOWN')" class="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all mt-2" title="Tilt Down">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>

              <!-- Zoom Controls -->
              <div class="grid grid-cols-2 gap-2.5 mt-3">
                <button @click="sendPtz('ZOOM_IN')" class="py-2.5 bg-slate-950 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Zoom In (+)
                </button>
                <button @click="sendPtz('ZOOM_OUT')" class="py-2.5 bg-slate-950 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  Zoom Out (-)
                </button>
              </div>
            </div>

            <!-- Optional DVR Playback Launcher if Allowed -->
            <div v-if="allowRecording" class="pt-3 border-t border-slate-800">
              <button @click="openDvrModal" class="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                View DVR Recordings
              </button>
            </div>
          </div>
        </div>

        <!-- DVR Playback Clean Modal (Opens only when clicked) -->
        <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
          <div v-if="showDvrModal && allowRecording" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div class="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 class="text-sm font-bold text-slate-100">24/7 DVR Playback Timeline - {{ activeCamera?.display_name || 'Selected Camera' }}</h3>
                </div>
                <button @click="showDvrModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">✕</button>
              </div>

              <div class="p-6 space-y-4">
                <div v-if="isLoadingRecordings" class="text-center p-8 text-slate-400">Loading recordings...</div>
                <div v-else-if="recordingsError" class="text-center p-8 text-rose-400">{{ recordingsError }}</div>
                <div v-else class="flex h-96 gap-4 border-t border-slate-800 pt-4">
                  <!-- Video Player -->
                  <div class="flex-1 bg-black rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <video v-if="activeRecording" :src="`/api/view/recordings/${activeRecording.id}/stream?token=${token}`" controls autoplay class="w-full h-full object-contain"></video>
                    <div v-else class="text-slate-500 text-sm font-medium flex flex-col items-center gap-2">
                      <svg class="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      Select a recording to play
                    </div>
                  </div>
                  <!-- Recordings List -->
                  <div class="w-64 bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-2 space-y-1">
                    <div v-if="filteredRecordings.length === 0" class="text-center p-4 text-xs text-slate-500">No recordings found for this camera.</div>
                    <div v-for="rec in filteredRecordings" :key="rec.id" @click="activeRecording = rec" class="p-3 rounded-lg border cursor-pointer hover:bg-slate-800 transition-colors" :class="activeRecording?.id === rec.id ? 'bg-slate-800 border-emerald-500 shadow-sm' : 'border-slate-800/50'">
                      <div class="text-xs font-bold text-slate-200">{{ new Date(rec.segment_start).toLocaleTimeString() }}</div>
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-[10px] text-slate-400">{{ new Date(rec.segment_start).toLocaleDateString() }}</span>
                        <span class="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-cyan-400 font-mono">{{ rec.duration_seconds }}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end pt-2">
                  <div class="flex items-center gap-2">
                    <button @click="showDvrModal = false; activeRecording = null" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-xl text-xs font-bold transition-colors">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
      </main>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = computed(() => route.query.token)

const isLoading = ref(true)
const errorMsg = ref('')
const streams = ref([])
const activeCamera = ref(null)
const userLabel = ref('')
const allowPtz = ref(true)
const allowRecording = ref(true)
const allowAudio = ref(true)
const expiresAt = ref(null)
const dailyStartTime = ref(null)
const dailyEndTime = ref(null)
const showCameraNames = ref(true)
const showDvrModal = ref(false)
const remainingTimeText = ref('')
let timerInterval = null


const streamHost = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1'

// DVR Real Recordings State
const recordings = ref([])
const activeRecording = ref(null)
const isLoadingRecordings = ref(false)
const recordingsError = ref('')

const filteredRecordings = computed(() => {
  if (!activeCamera.value) return []
  return recordings.value.filter(r => r.camera_id == activeCamera.value.id || r.camera_id == String(activeCamera.value.id))
})

const openDvrModal = async () => {
  showDvrModal.value = true
  activeRecording.value = null
  if (recordings.value.length === 0 && !isLoadingRecordings.value && !recordingsError.value) {
    isLoadingRecordings.value = true
    try {
      const res = await $fetch(`/api/view/recordings?token=${token.value}`)
      if (res.success) {
        recordings.value = res.recordings
      } else {
        recordingsError.value = res.error || 'Failed to fetch recordings'
      }
    } catch(err) {
      recordingsError.value = 'Failed to fetch recordings'
    } finally {
      isLoadingRecordings.value = false
    }
  }
}

// Viewer Audio / Voice State Management
const viewerAudio = ref({})

const isAudioOn = (cam) => {
  if (!cam) return false
  return !!viewerAudio.value[cam.id]
}

const toggleAudio = (cam) => {
  if (!cam) return
  const nextState = !viewerAudio.value[cam.id]
  viewerAudio.value = { ...viewerAudio.value, [cam.id]: nextState }
  
  const iframe = document.getElementById('iframe-' + cam.id)
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(nextState ? 'unmute' : 'mute', '*')
  }
}

const getStreamUrl = (cam) => {
  if (!cam) return ''
  let baseName = cam.name || 'dahua_cam'
  if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '')
  return `/player.html?src=${encodeURIComponent(baseName)}_sub&muted=${!isAudioOn(cam)}`
}

const openAudioStream = (cam) => {
  if (!cam) return
  let baseName = cam.name || 'dahua_cam'
  if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '')
  const url = `http://${streamHost}:1984/stream.html?src=${encodeURIComponent(baseName)}&media=video,audio`
  window.open(url, '_blank', 'width=800,height=500')
}


// Digital Zoom & ePTZ State
const cameraZoom = ref({})
const cameraPan = ref({})

const getCamZoom = (id) => cameraZoom.value[id] || 1.0
const getCamPanX = (id) => cameraPan.value[id]?.x || 0
const getCamPanY = (id) => cameraPan.value[id]?.y || 0

const zoomInCam = (id) => {
  const cur = getCamZoom(id)
  const next = Math.min(4.0, Math.round((cur + 0.35) * 100) / 100)
  cameraZoom.value = { ...cameraZoom.value, [id]: next }
}

const zoomOutCam = (id) => {
  const cur = getCamZoom(id)
  const next = Math.max(1.0, Math.round((cur - 0.35) * 100) / 100)
  cameraZoom.value = { ...cameraZoom.value, [id]: next }
  if (next === 1.0) {
    cameraPan.value = { ...cameraPan.value, [id]: { x: 0, y: 0 } }
  }
}

const resetZoomCam = (id) => {
  cameraZoom.value = { ...cameraZoom.value, [id]: 1.0 }
  cameraPan.value = { ...cameraPan.value, [id]: { x: 0, y: 0 } }
}

const panCam = (id, dir) => {
  const curPan = cameraPan.value[id] || { x: 0, y: 0 }
  const step = 40
  const nextPan = { ...curPan }
  if (dir === 'LEFT') nextPan.x += step
  if (dir === 'RIGHT') nextPan.x -= step
  if (dir === 'UP') nextPan.y += step
  if (dir === 'DOWN') nextPan.y -= step
  cameraPan.value = { ...cameraPan.value, [id]: nextPan }
}

const sendPtz = async (command, speed = 0.5) => {
  if (!activeCamera.value) return
  const id = activeCamera.value.id
  const isDahua = activeCamera.value.camera_brand === 'Dahua' || activeCamera.value.name?.includes('dahua') || activeCamera.value.name?.includes('101')

  // 1. Digital Zoom In / Out
  if (command === 'ZOOM_IN') {
    zoomInCam(id)
  } else if (command === 'ZOOM_OUT') {
    zoomOutCam(id)
  }

  // 2. Digital Pan / Tilt for Dahua / Fixed cameras
  if (isDahua && ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(command)) {
    panCam(id, command)
  }

  // 3. Dispatch hardware command to backend / agent
  try {
    await $fetch('/api/camera/ptz', {
      method: 'POST',
      body: {
        token: token.value,
        cameraId: id,
        command: command,
        speed: speed
      }
    })
    if (command !== 'STOP' && command !== 'ZOOM_IN' && command !== 'ZOOM_OUT') {
      setTimeout(async () => {
        await $fetch('/api/camera/ptz', {
          method: 'POST',
          body: { token: token.value, cameraId: id, command: 'STOP', speed: 0 }
        }).catch(() => {})
      }, 600)
    }
  } catch (err) {
    console.error('PTZ Viewer Error:', err)
  }
}


const updateRemainingTime = () => {
  if (!expiresAt.value) return
  const diff = new Date(expiresAt.value).getTime() - Date.now()
  if (diff <= 0) {
    remainingTimeText.value = 'Expired'
    errorMsg.value = 'Your granted viewing time has expired.'
    streams.value = []
    if (timerInterval) clearInterval(timerInterval)
    return
  }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  if (hours > 0) {
    remainingTimeText.value = `${hours}h ${minutes}m ${seconds}s`
  } else {
    remainingTimeText.value = `${minutes}m ${seconds}s`
  }
}

const verifyToken = async () => {
  if (!token.value) {
    errorMsg.value = 'Invalid access token URL'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await $fetch(`/api/view/verify?token=${token.value}`)
    if (res.success) {
      streams.value = res.streams
      if (streams.value.length > 0) activeCamera.value = streams.value[0]
      userLabel.value = res.userLabel || 'Authorized Viewer'
      allowPtz.value = !!res.allowPtz
      allowRecording.value = !!res.allowRecording
      allowAudio.value = !!res.allowAudio
      expiresAt.value = res.expiresAt || null
      dailyStartTime.value = res.dailyStartTime || null
      dailyEndTime.value = res.dailyEndTime || null
      
      if (timerInterval) clearInterval(timerInterval)
      if (expiresAt.value) {
        updateRemainingTime()
        timerInterval = setInterval(updateRemainingTime, 1000)
      }

      // Log the entrance
      await $fetch('/api/view/log', {
        method: 'POST',
        body: { token: token.value, action: 'ENTER' }
      }).catch(() => {})
      
    } else {
      errorMsg.value = res.message || 'Access Denied'
    }
  } catch(e) {
    errorMsg.value = e.data?.message || 'Access Denied: Token expired or outside scheduled hours.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  verifyToken()
})

watch(token, () => {
  verifyToken()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (!errorMsg.value && token.value) {
    try {
      navigator.sendBeacon('/api/view/log', JSON.stringify({ token: token.value, action: 'EXIT' }))
    } catch(e) {}
  }
})
</script>
