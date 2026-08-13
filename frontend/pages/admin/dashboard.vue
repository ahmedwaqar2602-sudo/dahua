<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-8 selection:bg-indigo-500/30">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Edge Gateway Admin
          </h1>
          <p class="text-neutral-500 mt-2">Manage cameras, access tokens, and view access logs securely.</p>
        </div>
        <button @click="logout" class="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-all text-sm font-medium">
          Logout
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column (Cameras & Shares) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Cameras Section -->
          <section class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Cameras
              </h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div v-for="cam in cameras" :key="cam.id" class="p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-indigo-500/50 transition-colors group">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium text-neutral-200">{{ cam.name }}</h3>
                    <p class="text-xs text-neutral-500 mt-1 truncate max-w-[200px]" :title="cam.rtsp_url">{{ cam.rtsp_url }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Camera Form -->
            <form @submit.prevent="addCamera" class="flex flex-col gap-3">
              <div class="flex gap-3">
                <input v-model="newCameraName" type="text" placeholder="Camera Name" required class="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <input v-model="newCameraUrl" type="text" placeholder="RTSP URL" required class="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  Add
                </button>
              </div>
              <p v-if="addCameraError" class="text-sm text-rose-400 mt-1">{{ addCameraError }}</p>
            </form>
          </section>

          <!-- Generate Link Section -->
          <section class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6">
              <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Share Access
            </h2>
            
            <div class="mb-6 space-y-3">
              <label class="block text-sm text-neutral-400 font-medium mb-2">Select Cameras to Share</label>
              <div class="flex flex-wrap gap-3">
                <label v-for="cam in cameras" :key="cam.id" class="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-lg cursor-pointer hover:border-neutral-600 transition-colors">
                  <input type="checkbox" :value="cam.id" v-model="selectedCamerasForShare" class="rounded border-neutral-700 text-indigo-600 focus:ring-indigo-500 bg-neutral-900">
                  <span class="text-sm">{{ cam.name }}</span>
                </label>
              </div>
            </div>

            <div class="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-neutral-400 font-medium mb-2">Daily Start Time (Optional)</label>
                <input v-model="dailyStartTime" type="time" class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-neutral-200">
              </div>
              <div>
                <label class="block text-sm text-neutral-400 font-medium mb-2">Daily End Time (Optional)</label>
                <input v-model="dailyEndTime" type="time" class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-neutral-200">
              </div>
            </div>

            <button @click="generateLink" :disabled="selectedCamerasForShare.length === 0" class="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20">
              Generate Viewer Link
            </button>

            <div v-if="generatedLink" class="mt-6 space-y-3">
              <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium">
                Successfully generated link for {{ generatedUserLabel }}!
              </div>
              <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <code class="text-sm text-indigo-300 break-all">{{ generatedLink }}</code>
                <button @click="copyLink" class="ml-4 p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Active Shares Section -->
          <section class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
             <h2 class="text-xl font-semibold flex items-center gap-2 mb-6">
              <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Active Shares
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-neutral-500 uppercase bg-neutral-950/50">
                  <tr>
                    <th class="px-4 py-3 rounded-l-lg">User</th>
                    <th class="px-4 py-3">Token</th>
                    <th class="px-4 py-3">Cameras</th>
                    <th class="px-4 py-3">Schedule</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="share in activeShares" :key="share.token" class="border-b border-neutral-800/50 last:border-0">
                    <td class="px-4 py-4 font-medium text-neutral-200">{{ share.user_label }}</td>
                    <td class="px-4 py-4 font-mono text-xs text-neutral-400">{{ share.token.substring(0,8) }}...</td>
                    <td class="px-4 py-4">{{ JSON.parse(share.allowed_cameras).length }} cam(s)</td>
                    <td class="px-4 py-4 text-xs text-neutral-400">
                      <span v-if="share.daily_start_time && share.daily_end_time">{{ share.daily_start_time }} - {{ share.daily_end_time }}</span>
                      <span v-else>24/7</span>
                    </td>
                    <td class="px-4 py-4">
                      <span v-if="share.is_revoked" class="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-medium border border-rose-500/20">Revoked</span>
                      <span v-else class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">Active</span>
                    </td>
                    <td class="px-4 py-4 text-right">
                      <button v-if="!share.is_revoked" @click="revokeToken(share.token)" class="text-rose-400 hover:text-rose-300 text-xs font-medium hover:underline">Revoke</button>
                    </td>
                  </tr>
                  <tr v-if="activeShares.length === 0">
                    <td colspan="4" class="px-4 py-8 text-center text-neutral-500">No active shares found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Right Column (Audit Logs) -->
        <div class="lg:col-span-1">
          <section class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6">
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Audit Logs
            </h2>
            <div class="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[800px] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              <div v-for="log in auditLogs" :key="log.id" class="flex gap-4 p-4 bg-neutral-950 border border-neutral-800/50 rounded-xl relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1" :class="log.action === 'ENTER' ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold" :class="log.action === 'ENTER' ? 'text-emerald-400' : 'text-rose-400'">{{ log.action }}</span>
                    <span class="text-xs text-neutral-500">{{ new Date(log.timestamp).toLocaleString() }}</span>
                  </div>
                  <p class="text-xs font-mono text-neutral-400">Token: {{ log.token.substring(0,12) }}...</p>
                </div>
              </div>
              <div v-if="auditLogs.length === 0" class="text-center text-neutral-500 py-8">
                No logs recorded yet.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cameras = ref([])
const activeShares = ref([])
const auditLogs = ref([])
const selectedCamerasForShare = ref([])
const generatedLink = ref('')
const generatedUserLabel = ref('')
const dailyStartTime = ref('')
const dailyEndTime = ref('')

const newCameraName = ref('')
const newCameraUrl = ref('')
const addCameraError = ref('')

const fetchCameras = async () => {
  try {
    const res = await $fetch('/api/admin/cameras')
    if (res.success) cameras.value = res.cameras
  } catch (e) {
    console.error(e)
  }
}

const fetchShares = async () => {
  try {
    const res = await $fetch('/api/admin/active-shares')
    if (res.success) activeShares.value = res.shares
  } catch (e) {
    console.error(e)
  }
}

const fetchLogs = async () => {
  try {
    const res = await $fetch('/api/admin/audit-logs')
    if (res.success) auditLogs.value = res.logs
  } catch (e) {
    console.error(e)
  }
}

const addCamera = async () => {
  addCameraError.value = ''
  try {
    const res = await $fetch('/api/admin/cameras', {
      method: 'POST',
      body: { name: newCameraName.value, rtsp_url: newCameraUrl.value }
    })
    if (res.success) {
      newCameraName.value = ''
      newCameraUrl.value = ''
      await fetchCameras()
    } else {
      addCameraError.value = res.error || 'Failed to add camera.'
    }
  } catch (error) {
    console.error('Failed to add camera:', error)
    addCameraError.value = error.data?.error || 'Failed to add camera.'
  }
}

const generateLink = async () => {
  try {
    const res = await $fetch('/api/admin/generate-link', {
      method: 'POST',
      body: { 
        cameraIds: selectedCamerasForShare.value,
        daily_start_time: dailyStartTime.value,
        daily_end_time: dailyEndTime.value
      }
    })
    if (res.success) {
      const baseUrl = window.location.origin
      generatedLink.value = `${baseUrl}/view?token=${res.token}`
      generatedUserLabel.value = res.user_label
      selectedCamerasForShare.value = []
      dailyStartTime.value = ''
      dailyEndTime.value = ''
      await fetchShares()
    }
  } catch (e) {
    console.error(e)
  }
}

const copyLink = async () => {
  if (generatedLink.value) {
    await navigator.clipboard.writeText(generatedLink.value)
    alert('Link copied to clipboard!')
  }
}

const revokeToken = async (token) => {
  if (!confirm('Are you sure you want to revoke this token?')) return
  try {
    const res = await $fetch('/api/admin/revoke-token', {
      method: 'POST',
      body: { token }
    })
    if (res.success) {
      await fetchShares()
    }
  } catch (e) {
    console.error(e)
  }
}

const logout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  // Try checking auth first, if fails redirect
  try {
    const auth = await $fetch('/api/admin/me')
    if (auth.authenticated) {
      await Promise.all([fetchCameras(), fetchShares(), fetchLogs()])
    }
  } catch (e) {
    router.push('/admin/login')
  }
})
</script>
