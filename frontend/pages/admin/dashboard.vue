<template>
  <div class="flex h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-950 flex flex-col border-r border-slate-800">
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">D</div>
        <h1 class="text-lg font-semibold tracking-wide text-slate-100">DMSS Portal</h1>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 mt-4">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="currentTab = tab.id"
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium', currentTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200']"
        >
          <span v-html="tab.icon" class="w-5 h-5"></span>
          {{ tab.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors text-sm font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content Pane -->
    <main class="flex-1 flex flex-col overflow-hidden bg-slate-900">
      <!-- Header -->
      <header class="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur">
        <h2 class="text-xl font-medium text-slate-100">{{ currentTabName }}</h2>
        <div class="flex items-center gap-4">
          <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span class="text-sm text-slate-400">System Online</span>
        </div>
      </header>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto p-8">
        
        <!-- Live View Tab -->
        <div v-if="currentTab === 'live'" class="max-w-6xl mx-auto h-full flex flex-col gap-6">
          <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            <div v-if="streamPending" class="absolute inset-0 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <iframe
              v-else-if="adminStreamUrl"
              :src="adminStreamUrl"
              class="absolute inset-0 w-full h-full border-none"
              allowfullscreen
              allow="autoplay; encrypted-media; picture-in-picture"
            ></iframe>
            <div v-else class="absolute inset-0 flex items-center justify-center text-slate-500">
              Failed to load admin stream.
            </div>
          </div>

          <!-- PTZ & Controls Bar -->
          <div class="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div class="flex gap-2">
              <button @click="triggerAction('Snapshot')" class="btn-control"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Snapshot</button>
              <button @click="triggerAction('Record Local Clip')" class="btn-control"><svg class="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg> Record Clip</button>
            </div>
            <div class="flex gap-2">
              <button @click="ptzAction('Zoom In')" class="btn-control p-2" title="Zoom In"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></button>
              <button @click="ptzAction('Zoom Out')" class="btn-control p-2" title="Zoom Out"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg></button>
              <div class="w-px h-6 bg-slate-700 mx-2 self-center"></div>
              <button @click="triggerAction('Two-Way Audio')" class="btn-control"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> Audio</button>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="currentTab === 'settings'" class="max-w-4xl mx-auto space-y-8">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 class="text-lg font-medium text-white mb-6">Video Encoding</h3>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Resolution</label>
                <select class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>1080P (1920x1080)</option>
                  <option>4MP (2560x1440)</option>
                  <option>4K (3840x2160)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Codec</label>
                <select class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>H.265</option>
                  <option>H.264</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 class="text-lg font-medium text-white mb-6">Image Processing</h3>
            <div class="space-y-4">
              <label class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-white">Day/Night Mode (IR)</div>
                  <div class="text-sm text-slate-400">Automatically switch to infrared at night.</div>
                </div>
                <input type="checkbox" checked class="w-5 h-5 accent-indigo-500 rounded border-slate-600 bg-slate-700" />
              </label>
              <label class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-white">Wide Dynamic Range (WDR)</div>
                  <div class="text-sm text-slate-400">Balance extreme lighting conditions.</div>
                </div>
                <input type="checkbox" checked class="w-5 h-5 accent-indigo-500 rounded border-slate-600 bg-slate-700" />
              </label>
              <label class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-white">Privacy Masking</div>
                  <div class="text-sm text-slate-400">Black out specific regions of the video feed.</div>
                </div>
                <input type="checkbox" class="w-5 h-5 accent-indigo-500 rounded border-slate-600 bg-slate-700" />
              </label>
            </div>
            <div class="mt-6 flex justify-end">
              <button @click="saveSettings" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Apply Settings</button>
            </div>
          </div>
        </div>

        <!-- Alarms Tab -->
        <div v-if="currentTab === 'alarms'" class="max-w-4xl mx-auto text-center py-20 text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <h3 class="text-xl text-white font-medium mb-2">No Active Alarms</h3>
          <p>Motion detection and IVS alarms will appear here.</p>
        </div>

        <!-- Logs Tab -->
        <div v-if="currentTab === 'logs'" class="max-w-6xl mx-auto">
          <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 class="font-medium text-white">System Access Logs</h3>
              <button @click="fetchLogs" class="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Refresh
              </button>
            </div>
            
            <div v-if="logsPending" class="p-12 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            
            <table v-else class="w-full text-left text-sm text-slate-300">
              <thead class="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th class="px-6 py-4">ID</th>
                  <th class="px-6 py-4">Timestamp</th>
                  <th class="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-4 font-mono text-slate-500">#{{ log.id }}</td>
                  <td class="px-6 py-4">{{ new Date(log.timestamp).toLocaleString() }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-full text-xs font-medium border',
                      log.status === 'Granted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      log.status === 'Denied' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    ]">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="logs.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">No logs found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- Toast Notification -->
    <div v-if="toast" class="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 shadow-2xl rounded-lg p-4 flex items-center gap-3 text-white max-w-sm animate-fade-in-up">
      <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <p class="font-medium text-sm">{{ toast }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ middleware: 'auth' });
const router = useRouter();

const tabs = [
  { id: 'live', name: 'Live View', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>' },
  { id: 'playback', name: 'Playback & Records', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
  { id: 'settings', name: 'Camera Settings', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' },
  { id: 'alarms', name: 'Alarm & Notifications', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>' },
  { id: 'logs', name: 'Access Logs', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' }
];

const currentTab = ref('live');
const currentTabName = computed(() => tabs.find(t => t.id === currentTab.value)?.name || 'Dashboard');

const adminStreamUrl = ref('');
const streamPending = ref(true);

const logs = ref([]);
const logsPending = ref(true);

const toast = ref('');

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => toast.value = '', 3000);
}

async function fetchAdminStream() {
  streamPending.value = true;
  try {
    const res = await $fetch('/api/admin/stream');
    if (res.success) adminStreamUrl.value = res.streamUrl;
  } catch (err) {
    console.error(err);
  } finally {
    streamPending.value = false;
  }
}

async function fetchLogs() {
  logsPending.value = true;
  try {
    const res = await $fetch('/api/admin/logs');
    if (res.success) logs.value = res.logs;
  } catch (err) {
    console.error(err);
  } finally {
    logsPending.value = false;
  }
}

async function saveSettings() {
  try {
    await $fetch('/api/camera/settings', { method: 'POST', body: {} });
    showToast('Settings applied successfully');
  } catch (e) {
    console.error(e);
  }
}

async function ptzAction(action) {
  try {
    await $fetch('/api/camera/ptz', { method: 'POST', body: { action } });
    showToast(`${action} command sent`);
  } catch (e) {
    console.error(e);
  }
}

function triggerAction(action) {
  showToast(`${action} triggered locally`);
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' });
  router.push('/admin/login');
}

onMounted(() => {
  fetchAdminStream();
  fetchLogs();
});
</script>

<style scoped>
.btn-control {
  @apply flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>
