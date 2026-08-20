<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 p-6 overflow-hidden">
    <!-- Header & Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-100 tracking-tight">Access Notifications</h1>
        <p class="text-sm text-slate-400 mt-1">Secure audit log of all camera stream views and system events.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search logs..." 
            class="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-3 py-2 transition-colors"
          >
        </div>

        <!-- Camera Filter Dropdown -->
        <select 
          v-model="cameraFilter" 
          class="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block py-2 px-3 transition-colors appearance-none pr-8 cursor-pointer relative"
        >
          <option value="">All Cameras</option>
          <option v-for="cam in uniqueCameras" :key="cam" :value="cam">{{ cam }}</option>
        </select>

        <!-- Export CSV Button -->
        <button 
          @click="exportCSV" 
          class="bg-transparent hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          :disabled="filteredLogs.length === 0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        <!-- Clear All Button -->
        <button 
          @click="clearLogs" 
          class="bg-transparent hover:bg-rose-500/10 text-rose-500 border border-rose-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ml-auto"
          :disabled="isClearing || logs.length === 0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {{ isClearing ? 'Clearing...' : 'Clear All' }}
        </button>
      </div>
    </div>

    <!-- Data Table Container (Glassmorphism) -->
    <div class="flex-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden flex flex-col relative shadow-2xl">
      
      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-700/50 bg-slate-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 shrink-0">
        <div class="col-span-3">Timestamp</div>
        <div class="col-span-2">User / Actor</div>
        <div class="col-span-3">Target</div>
        <div class="col-span-2">Event / Action</div>
        <div class="col-span-2">Status</div>
      </div>

      <!-- Table Body -->
      <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredLogs.length === 0" class="flex flex-col items-center justify-center h-full py-16 text-slate-500">
          <svg class="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p class="text-lg font-medium text-slate-300">No Audit Records Found</p>
          <p class="text-sm mt-1">System events and camera access logs will populate here.</p>
        </div>

        <!-- Log Rows -->
        <div v-else class="flex flex-col divide-y divide-slate-800/50">
          <div 
            v-for="log in filteredLogs" 
            :key="log.id" 
            class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Timestamp -->
            <div class="col-span-3 flex items-center gap-2 text-sm text-slate-300 font-medium">
              <svg class="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDateTime(log.timestamp) }}
            </div>
            
            <!-- User / Actor -->
            <div class="col-span-2 text-sm font-semibold text-slate-200 truncate">
              {{ log.user_label || 'Unknown' }}
            </div>
            
            <!-- Target (Camera Name) -->
            <div class="col-span-3 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span class="font-medium text-cyan-400 truncate" :title="log.camera_name">{{ log.camera_name }}</span>
            </div>
            
            <!-- Event / Action -->
            <div class="col-span-2 text-sm text-slate-300 truncate font-medium">
              {{ log.action }}
            </div>
            
            <!-- Status Badge -->
            <div class="col-span-2 flex items-center">
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-bold border"
                :class="getStatusClasses(log.action)"
              >
                {{ getStatusLabel(log.action) }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const logs = ref([])
const isLoading = ref(true)
const isClearing = ref(false)
const searchQuery = ref('')
const cameraFilter = ref('')

const uniqueCameras = computed(() => {
  const cams = new Set(logs.value.map(l => l.camera_name).filter(Boolean))
  return Array.from(cams).sort()
})

const filteredLogs = computed(() => {
  let result = logs.value

  if (cameraFilter.value) {
    result = result.filter(log => log.camera_name === cameraFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      (log.user_label && log.user_label.toLowerCase().includes(q)) ||
      (log.camera_name && log.camera_name.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q))
    )
  }

  return result
})

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp + 'Z') // UTC
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
  
  return `${formattedDate} | ${formattedTime}`
}

const getStatusClasses = (action) => {
  const act = (action || '').toLowerCase()
  if (act.includes('fail') || act.includes('error')) {
    return 'bg-red-500/10 text-red-400 border-red-500/20'
  }
  if (act.includes('warn') || act.includes('change') || act.includes('settings')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  // Default success/informational
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
}

const getStatusLabel = (action) => {
  const act = (action || '').toLowerCase()
  if (act.includes('fail') || act.includes('error')) return 'Failed'
  if (act.includes('warn')) return 'Warning'
  if (act.includes('change') || act.includes('settings')) return 'Modified'
  return 'Success'
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

const exportCSV = () => {
  if (filteredLogs.value.length === 0) return

  const headers = ['Timestamp', 'User', 'Camera', 'Action']
  const rows = filteredLogs.value.map(log => [
    formatDateTime(log.timestamp),
    log.user_label || '',
    log.camera_name || '',
    log.action || ''
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchLogs()
})
</script>
