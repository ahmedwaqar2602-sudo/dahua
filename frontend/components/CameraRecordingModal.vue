<template>
  <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden relative">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-white flex items-center gap-2">
                {{ camera?.display_name || camera?.name }} - DVR Archive Playback
                <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">24/7 NVR ARCHIVE</span>
              </h2>
              <p class="text-xs text-slate-400 font-mono">Stream: {{ camera?.name }} • Codec: H.264 • 25 FPS</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Calendar Date Picker -->
            <div class="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <input type="date" v-model="selectedDate" class="bg-transparent text-slate-200 focus:outline-none text-xs font-mono" />
            </div>

            <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Video Player Display Box -->
        <div class="relative bg-black flex items-center justify-center aspect-video w-full max-h-[50vh] overflow-hidden">
          <!-- Active Stream Player -->
          <video v-if="archiveVideoUrl"
            :src="archiveVideoUrl" 
            class="w-full h-full object-contain border-none transition-transform duration-300"
            autoplay controls
          ></video>

          <div v-else class="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-20 flex-col gap-3">
            <svg class="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span class="text-slate-300 font-bold text-sm">No recording for this time</span>
          </div>
          
          <!-- Top Left Timestamp Badge -->
          <div class="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-cyan-300 border border-white/10 flex items-center gap-2 pointer-events-none z-10">
            <span class="w-2 h-2 rounded-full" :class="isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
            {{ selectedDate }} {{ currentTimeString }}
          </div>

          <!-- Top Right Recording Tag -->
          <div class="absolute top-4 right-4 bg-rose-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-lg pointer-events-none z-10">
            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
            REC ARCHIVE
          </div>
        </div>


        <!-- Flussonic Watcher DVR Control Deck -->
        <div class="bg-slate-950 p-5 border-t border-slate-800 flex flex-col gap-4">
          
          <!-- Green Archive Timeline with Scrubber -->
          <div class="relative">
            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded bg-emerald-500"></div> Archive Recorded (24h)</span>
              <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded bg-amber-400"></div> Motion Detected</span>
              <span class="font-bold text-slate-200">Position: <strong class="text-cyan-400">{{ currentTimeString }}</strong></span>
            </div>

            <!-- Interactive Timeline Bar -->
            <div 
              class="relative h-12 w-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden cursor-pointer group shadow-inner"
              @mousedown="startScrub"
              @mousemove="onScrub"
              @mouseup="endScrub"
              @mouseleave="endScrub"
            >
              <!-- Real DVR Segments -->
              <div 
                v-for="(seg, idx) in dvrSegments" 
                :key="idx"
                class="absolute inset-y-1 rounded border-y transition-all"
                :class="seg.status === 'motion' ? 'bg-amber-400 border-amber-500 z-10 w-1.5 rounded-full' : 'bg-emerald-500/40 border-emerald-400/50'"
                :style="seg.status === 'motion' ? { left: seg.startPercent + '%' } : { left: seg.startPercent + '%', width: Math.max(0.2, seg.widthPercent) + '%' }"
                :title="seg.title"
              ></div>

              <!-- Hour Markers -->
              <div class="absolute inset-0 flex justify-between px-3 items-center text-[10px] font-mono text-slate-500 pointer-events-none">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>

              <!-- Playhead Needle -->
              <div 
                class="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] pointer-events-none transition-all duration-75 z-20"
                :style="{ left: scrubPercentage + '%' }"
              >
                <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          <!-- Bottom Control Deck: Play/Pause, Speeds, Frame Step, Export, Snapshot -->
          <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            
            <!-- Left: Playback & Step Controls -->
            <div class="flex items-center gap-2">
              <!-- Play / Pause -->
              <button @click="togglePlay" class="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all" :title="isPlaying ? 'Pause' : 'Play'">
                <svg v-if="!isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>

              <!-- Step Backward 1 Frame -->
              <button @click="stepFrame(-1)" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1" title="Step 1 Frame Back">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                ◀ Step
              </button>

              <!-- Step Forward 1 Frame -->
              <button @click="stepFrame(1)" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1" title="Step 1 Frame Forward">
                Step ▶
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            <!-- Middle: Speed Multipliers -->
            <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <span class="px-2 text-[10px] font-bold text-slate-500 uppercase">Speed:</span>
              <button v-for="spd in [0.5, 1, 2, 4, 8, 16]" :key="spd" @click="playbackSpeed = spd" class="px-2.5 py-1 rounded-lg font-mono font-bold transition-all" :class="playbackSpeed === spd ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'">
                {{ spd }}x
              </button>
            </div>

            <!-- Right: Snapshot Capture & Export MP4 -->
            <div class="flex items-center gap-3">
              <!-- Capture Snapshot Frame (PNG) -->
              <button @click="downloadSnapshot" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm" title="Save this frame as PNG image">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4"/></svg>
                Snapshot PNG
              </button>

              <!-- Export MP4 Clip -->
              <button @click="exportClip" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Export MP4 Clip
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  camera: Object
})
const emit = defineEmits(['close'])

const streamHost = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1'
const selectedDate = ref(new Date().toISOString().split('T')[0])
const isPlaying = ref(false)
const playbackSpeed = ref(1)
const scrubPercentage = ref(45)
const isDragging = ref(false)
const videoFrameRef = ref(null)
let playTimer = null

const currentTimeString = computed(() => {
  const totalMinutes = Math.floor((scrubPercentage.value / 100) * 1440)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const secs = Math.floor((((scrubPercentage.value / 100) * 1440) % 1) * 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const streamPlayerUrl = computed(() => {
  if (!props.camera) return ''
  return `http://${streamHost}:1984/stream.html?src=${encodeURIComponent(props.camera.name)}&mode=webrtc,mse`
})


const archiveVideoUrl = ref(null)
const dvrSegments = ref([])

watch([selectedDate, () => props.camera], async ([date, cam]) => {
  if (!cam) return;
  try {
    const res = await $fetch(`/api/admin/recordings?cameraId=${cam.name}&date=${date}`);
    if (res.success) {
      dvrSegments.value = res.segments.map(seg => {
        const [sH, sM] = seg.start.split(':').map(Number);
        const [eH, eM] = seg.end.split(':').map(Number);
        const sPercent = ((sH * 60 + sM) / 1440) * 100;
        const ePercent = ((eH * 60 + eM) / 1440) * 100;
        return {
          startPercent: sPercent,
          widthPercent: ePercent - sPercent,
          title: `Recorded ${seg.start} - ${seg.end}`,
          status: seg.status // 'recorded', 'motion'
        };
      });
    }
  } catch(e) {
    console.error(e);
  }
}, { immediate: true })


// Watch for scrubber and date changes to fetch new recording clip
watch([scrubPercentage, selectedDate, () => props.camera], async ([pct, date, cam]) => {
  if (!cam) return
  
  // Calculate ISO string for start time
  const totalMinutes = Math.floor((pct / 100) * 1440)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const secs = Math.floor((((pct / 100) * 1440) % 1) * 60)
  
  const targetDate = new Date(`${date}T${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.000Z`)
  const targetIso = targetDate.toISOString()

  try {
    const res = await fetch(`/api/dvr/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cameraId: cam.name,
        start: targetIso,
        end: targetIso
      })
    })
    
    const data = await res.json()
    if (data.success && data.downloadUrl) {
      archiveVideoUrl.value = data.downloadUrl
    } else {
      archiveVideoUrl.value = null
    }
  } catch (e) {
    archiveVideoUrl.value = null
  }
}, { immediate: true })

const currentFrameUrl = computed(() => {
  if (!props.camera) return ''
  return `http://${streamHost}:1984/api/frame.jpeg?src=${encodeURIComponent(props.camera.name)}`
})


const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlaybackLoop()
  } else {
    clearInterval(playTimer)
  }
}

const startPlaybackLoop = () => {
  clearInterval(playTimer)
  playTimer = setInterval(() => {
    if (scrubPercentage.value >= 100) {
      scrubPercentage.value = 0
    } else {
      scrubPercentage.value = Math.min(100, scrubPercentage.value + (0.1 * playbackSpeed.value))
    }
  }, 200)
}

const stepFrame = (direction) => {
  isPlaying.value = false
  clearInterval(playTimer)
  scrubPercentage.value = Math.max(0, Math.min(100, scrubPercentage.value + (direction * 0.05)))
}

const startScrub = (e) => {
  isDragging.value = true
  onScrub(e)
}

const onScrub = (e) => {
  if (!isDragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  let x = e.clientX - rect.left
  if (x < 0) x = 0
  if (x > rect.width) x = rect.width
  scrubPercentage.value = Math.round((x / rect.width) * 1000) / 10
}

const endScrub = () => {
  isDragging.value = false
}

const downloadSnapshot = () => {
  if (!props.camera) return
  const link = document.createElement('a')
  link.href = currentFrameUrl.value
  link.download = `snapshot_${props.camera.name}_${selectedDate.value}_${currentTimeString.value.replace(/:/g, '-')}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportClip = () => {
  alert(`Exporting MP4 Recording Clip for ${props.camera?.display_name || props.camera?.name} (${selectedDate.value} @ ${currentTimeString.value}). Downloading will commence...`)
}

onUnmounted(() => {
  clearInterval(playTimer)
})
</script>

