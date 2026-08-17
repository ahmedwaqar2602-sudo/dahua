<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans p-8 selection:bg-indigo-500/30 relative">
    <div class="max-w-7xl mx-auto space-y-12 relative z-10">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Flexnook Edge Gateway
          </h1>
          <p class="text-slate-500 mt-2">Premium video access and session management system.</p>
        </div>
        <button @click="logout" class="px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all text-sm font-medium backdrop-blur-md">
          Logout
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Cameras Section -->
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Cameras
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div v-for="cam in cameras" :key="cam.id" class="p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium text-slate-200 flex items-center gap-2">
                      {{ cam.display_name || cam.name }}
                      <button @click="openEditNameModal(cam)" class="text-slate-500 hover:text-indigo-400 transition-colors" title="Edit Display Name">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">{{ cam.name }}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-2 truncate" :title="cam.rtsp_url">{{ cam.rtsp_url }}</p>
                </div>
                <button @click="openLiveView(cam.name)" class="mt-4 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg text-xs font-medium transition-colors w-fit border border-indigo-500/20">
                  Inline Live View
                </button>
              </div>
            </div>

            <!-- Add Camera Form -->
            <form @submit.prevent="addCamera" class="flex flex-col gap-3">
              <div class="flex flex-col md:flex-row gap-3">
                <select v-model="newCameraName" required class="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-slate-200 cursor-pointer">
                  <option value="" disabled selected>Select Camera (Matches Proxy)</option>
                  <option value="dahua_cam">dahua_cam</option>
                  <option value="ezviz_cam">ezviz_cam</option>
                </select>
                <input v-model="newCameraDisplayName" type="text" placeholder="Display Name (e.g. Lobby)" class="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600">
                <input v-model="newCameraUrl" type="text" placeholder="RTSP URL" required class="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600">
                <button type="submit" class="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
                  Add
                </button>
              </div>
              <p v-if="addCameraError" class="text-sm text-rose-400 mt-1">{{ addCameraError }}</p>
            </form>
          </section>

          <!-- Generate Link Section -->
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Share Access
            </h2>
            
            <div class="mb-6 space-y-3">
              <label class="block text-sm text-slate-400 font-medium mb-2">Select Cameras to Share</label>
              <div class="flex flex-wrap gap-3">
                <label v-for="cam in cameras" :key="cam.id" class="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 px-4 py-2 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                  <input type="checkbox" :value="cam.id" v-model="selectedCamerasForShare" class="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900">
                  <span class="text-sm text-slate-300">{{ cam.display_name || cam.name }}</span>
                </label>
              </div>
            </div>

            <div class="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-slate-400 font-medium mb-2">Daily Start Time (Optional)</label>
                <input v-model="dailyStartTime" type="time" step="60" class="w-full bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200">
              </div>
              <div>
                <label class="block text-sm text-slate-400 font-medium mb-2">Daily End Time (Optional)</label>
                <input v-model="dailyEndTime" type="time" step="60" class="w-full bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200">
              </div>
            </div>

            <button @click="generateLink" :disabled="selectedCamerasForShare.length === 0" class="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
              Generate Viewer Link
            </button>

            <div v-if="generatedLink" class="mt-6 space-y-3">
              <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium">
                Successfully generated link for {{ generatedUserLabel }}!
              </div>
              <div class="p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl flex items-center justify-between">
                <code class="text-sm text-cyan-300 break-all">{{ generatedLink }}</code>
                <button @click="copyLink" class="ml-4 p-2 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Active Shares Section -->
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
             <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Active Shares
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-slate-500 uppercase bg-slate-950/50 border-y border-slate-800/50">
                  <tr>
                    <th class="px-4 py-4 font-semibold">User</th>
                    <th class="px-4 py-4 font-semibold">Token</th>
                    <th class="px-4 py-4 font-semibold">Cameras</th>
                    <th class="px-4 py-4 font-semibold">Schedule</th>
                    <th class="px-4 py-4 font-semibold">Status</th>
                    <th class="px-4 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
                  <tr v-for="share in activeShares" :key="share.token" class="hover:bg-slate-800/20 transition-colors">
                    <td class="px-4 py-4 font-medium text-slate-200">{{ share.user_label }}</td>
                    <td class="px-4 py-4 font-mono text-xs text-slate-500">{{ share.token.substring(0,8) }}...</td>
                    <td class="px-4 py-4 text-slate-300">{{ JSON.parse(share.allowed_cameras).length }} cam(s)</td>
                    <td class="px-4 py-4 text-xs text-slate-400">
                      <span v-if="share.daily_start_time && share.daily_end_time" class="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">{{ share.daily_start_time }} - {{ share.daily_end_time }}</span>
                      <span v-else class="text-slate-500 italic">24/7 Access</span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span class="flex h-2 w-2 relative">
                          <span v-if="share.status === 'Online'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2" :class="share.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'"></span>
                        </span>
                        <span class="text-xs font-medium" :class="share.status === 'Online' ? 'text-emerald-400' : 'text-slate-500'">{{ share.status }}</span>
                      </div>
                      <div class="text-[10px] text-slate-500 mt-1">Last used: {{ formatTime12h(share.last_used) }}</div>
                    </td>
                    <td class="px-4 py-4 text-right space-x-3">
                      <button v-if="!share.is_revoked" @click="openEditModal(share)" class="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">Edit</button>
                      <button v-if="!share.is_revoked" @click="revokeToken(share.token)" class="text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors">Revoke</button>
                    </td>
                  </tr>
                  <tr v-if="activeShares.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-slate-500">No active shares found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Right Column (User Sessions) -->
        <div class="lg:col-span-1">
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col shadow-2xl">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              User Sessions
            </h2>
            <div class="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[800px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div v-for="session in userSessions" :key="session.sessionId" class="p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:border-slate-700 transition-colors">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-slate-200">{{ session.userLabel }}</span>
                  <span class="text-xs text-slate-500 font-mono">{{ session.token.substring(0,6) }}</span>
                </div>
                <div class="space-y-1 mb-4 text-xs text-slate-400">
                  <div class="flex justify-between"><span>Enter:</span> <span class="text-slate-300">{{ formatTime12h(session.startTime) }}</span></div>
                  <div class="flex justify-between"><span>Exit:</span> <span class="text-slate-300">{{ formatTime12h(session.endTime) }}</span></div>
                </div>
                <button @click="openSessionVideo(session)" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  View User Recording
                </button>
              </div>
              <div v-if="userSessions.length === 0" class="text-center text-slate-500 py-8">
                No completed sessions found.
              </div>
            </div>
          </section>
        </div>

        <!-- Continuous Archives -->
        <div class="lg:col-span-3">
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              Continuous Archives
            </h2>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div v-for="file in continuousArchives" :key="file.name" class="flex-none w-64 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:border-fuchsia-500/30 transition-all group">
                <div class="aspect-video bg-black rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-800 transition-colors cursor-pointer" @click="playArchive(file)">
                  <svg class="w-8 h-8 text-slate-500 group-hover:text-fuchsia-400 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                </div>
                <div class="text-xs text-slate-400 truncate" :title="file.name">{{ file.name }}</div>
                <div class="text-[10px] text-slate-500 mt-1">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</div>
              </div>
              <div v-if="continuousArchives.length === 0" class="text-slate-500 text-sm">No continuous archives found. Run 'npm run dvr'.</div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Live View Modal -->
    <div v-if="showLiveViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl relative">
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 class="text-lg font-semibold text-slate-200">Inline Live View</h3>
          <button @click="closeLiveView" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="aspect-video bg-black relative">
          <iframe :src="liveViewSrc" class="w-full h-full border-none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- User Session Video Modal -->
    <div v-if="showSessionVideoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl relative">
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 class="text-lg font-semibold text-slate-200">User Session Recording</h3>
          <button @click="closeSessionVideo" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="aspect-video bg-black relative">
          <video :src="sessionVideoSrc" class="w-full h-full" controls autoplay playsinline></video>
        </div>
      </div>
    </div>

    <!-- Continuous Archive Modal -->
    <div v-if="showArchiveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl relative">
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 class="text-lg font-semibold text-slate-200">Archive Playback</h3>
          <button @click="showArchiveModal = false; archiveVideoSrc = ''" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="aspect-video bg-black relative">
          <video :src="archiveVideoSrc" class="w-full h-full" controls autoplay playsinline></video>
        </div>
      </div>
    </div>

    <!-- Edit Access Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-md relative p-6">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">Edit Access</h3>
        <div class="space-y-3 mb-6">
          <label class="block text-sm text-slate-400 font-medium">Allowed Cameras</label>
          <div class="max-h-48 overflow-y-auto space-y-2 border border-slate-800 rounded-lg p-3 bg-slate-950/50">
            <label v-for="cam in cameras" :key="cam.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
              <input type="checkbox" :value="cam.id" v-model="editSelectedCameras" class="rounded border-slate-700 text-indigo-500 bg-slate-900 focus:ring-0 focus:ring-offset-0">
              <span class="text-sm text-slate-300">{{ cam.display_name || cam.name }}</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="showEditModal = false" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button @click="saveEditAccess" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Edit Camera Name Modal -->
    <div v-if="showEditNameModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm relative p-6">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">Edit Display Name</h3>
        <div class="space-y-3 mb-6">
          <label class="block text-sm text-slate-400 font-medium">Display Name</label>
          <input v-model="editCameraDisplayName" type="text" placeholder="e.g. Main Office" class="w-full bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-slate-200">
        </div>
        <div class="flex justify-end gap-3">
          <button @click="showEditNameModal = false" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button @click="saveEditCameraName" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">Save</button>
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
const userSessions = ref([])
const continuousArchives = ref([])
const selectedCamerasForShare = ref([])
const generatedLink = ref('')
const generatedUserLabel = ref('')
const dailyStartTime = ref('')
const dailyEndTime = ref('')

const newCameraName = ref('')
const newCameraDisplayName = ref('')
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

const fetchSessions = async () => {
  try {
    const res = await $fetch('/api/admin/user-sessions')
    if (res.success) userSessions.value = res.sessions
  } catch (e) {
    console.error(e)
  }
}

const fetchArchives = async () => {
  try {
    const res = await $fetch('http://localhost:4000/api/dvr/continuous')
    if (res.success) continuousArchives.value = res.files
  } catch (e) {
    console.warn('Could not fetch archives from DVR API. Is local-dvr running?', e)
  }
}

const formatTime12h = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Karachi' 
  }).format(new Date(timestamp))
}

const addCamera = async () => {
  addCameraError.value = ''
  try {
    const res = await $fetch('/api/admin/cameras', {
      method: 'POST',
      body: { name: newCameraName.value, display_name: newCameraDisplayName.value, rtsp_url: newCameraUrl.value }
    })
    if (res.success) {
      newCameraName.value = ''
      newCameraDisplayName.value = ''
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
    const res = await $fetch('/api/admin/update-access', {
      method: 'POST',
      body: { token, revoke: true }
    })
    if (res.success) {
      await fetchShares()
    }
  } catch (e) {
    console.error(e)
  }
}

const showLiveViewModal = ref(false)
const liveViewSrc = ref('')
const openLiveView = (camName) => {
  liveViewSrc.value = `http://localhost:1984/stream.html?src=${encodeURIComponent(camName)}`
  showLiveViewModal.value = true
}
const closeLiveView = () => {
  showLiveViewModal.value = false
  liveViewSrc.value = ''
}

const showSessionVideoModal = ref(false)
const sessionVideoSrc = ref('')
const openSessionVideo = (session) => {
  const start = session.startTime
  const end = session.endTime
  const camera = (session.cameraIds && session.cameraIds.length > 0) ? session.cameraIds[0] : 'dahua_cam'
  sessionVideoSrc.value = `http://localhost:4000/api/dvr/extract?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&camera=${encodeURIComponent(camera)}`
  showSessionVideoModal.value = true
}
const closeSessionVideo = () => {
  showSessionVideoModal.value = false
  sessionVideoSrc.value = ''
}

const showArchiveModal = ref(false)
const archiveVideoSrc = ref('')
const playArchive = (file) => {
  archiveVideoSrc.value = file.url
  showArchiveModal.value = true
}

const showEditModal = ref(false)
const editToken = ref('')
const editSelectedCameras = ref([])

const openEditModal = (share) => {
  editToken.value = share.token
  editSelectedCameras.value = JSON.parse(share.allowed_cameras)
  showEditModal.value = true
}

const saveEditAccess = async () => {
  try {
    const res = await $fetch('/api/admin/update-access', {
      method: 'POST',
      body: { token: editToken.value, cameraIds: editSelectedCameras.value }
    })
    if (res.success) {
      showEditModal.value = false
      await fetchShares()
    }
  } catch(e) {
    console.error(e)
  }
}

const showEditNameModal = ref(false)
const editCameraId = ref(null)
const editCameraDisplayName = ref('')

const openEditNameModal = (cam) => {
  editCameraId.value = cam.id
  editCameraDisplayName.value = cam.display_name || ''
  showEditNameModal.value = true
}

const saveEditCameraName = async () => {
  try {
    const res = await $fetch(`/api/admin/cameras/${editCameraId.value}`, {
      method: 'PUT',
      body: { display_name: editCameraDisplayName.value }
    })
    if (res.success) {
      showEditNameModal.value = false
      await fetchCameras()
    }
  } catch(e) {
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
      await Promise.all([fetchCameras(), fetchShares(), fetchSessions(), fetchArchives()])
    }
  } catch (e) {
    router.push('/admin/login')
  }
})
</script>
