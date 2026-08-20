<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 p-6 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Access Notifications</h1>
        <p class="text-sm text-slate-400 mt-1">Audit log of all camera stream views.</p>
      </div>
      <button 
        @click="clearLogs" 
        class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        :disabled="isClearing || logs.length === 0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {{ isClearing ? 'Clearing...' : 'Clear All' }}
      </button>
    </div>

    <!-- Timeline Feed -->
    <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-4 relative">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <svg class="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500">
        <svg class="w-16 h-16 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-lg font-medium">No notifications yet</p>
        <p class="text-sm">Camera access events will appear here.</p>
      </div>

      <!-- Timeline Line (Background) -->
      <div v-if="logs.length > 0" class="absolute left-6 top-4 bottom-4 w-px bg-slate-800 -z-10"></div>

      <!-- Logs -->
      <div v-if="logs.length > 0" class="space-y-6 pb-8">
        <div v-for="log in logs" :key="log.id" class="flex items-start gap-6 group">
          <!-- Timeline Icon -->
          <div class="relative shrink-0 w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors z-10 shadow-lg mt-1">
            <div class="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse"></div>
            <svg class="w-5 h-5 text-cyan-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Content Card -->
          <div class="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg group-hover:border-slate-700 transition-colors">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p class="text-[15px] text-slate-300">
                  <span class="font-bold text-slate-100">{{ log.user_label }}</span> triggered <span class="font-semibold text-cyan-400">{{ log.action }}</span> on <span class="font-bold text-slate-100">Camera '{{ log.camera_name }}'</span>
                </p>
              </div>
              <div class="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(log.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const logs = ref([])
const isLoading = ref(true)
const isClearing = ref(false)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp + 'Z') // D1 returns UTC usually
  const isToday = new Date().toDateString() === date.toDateString()
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)

  if (isToday) {
    return `Today at ${formattedTime}`
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
  
  return `${formattedDate} at ${formattedTime}`
}

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const res = await $fetch('/api/notifications')
    if (res.success) {
      logs.value = res.logs
    }
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
  } finally {
    isLoading.value = false
  }
}

const clearLogs = async () => {
  if (!confirm('Are you sure you want to clear all notification logs?')) return
  
  isClearing.value = true
  try {
    const res = await $fetch('/api/notifications', { method: 'DELETE' })
    if (res.success) {
      logs.value = []
    }
  } catch (err) {
    console.error('Failed to clear notifications:', err)
    alert('Failed to clear logs.')
  } finally {
    isClearing.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>
