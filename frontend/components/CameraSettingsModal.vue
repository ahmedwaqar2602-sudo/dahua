<template>
  <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="$emit('close')">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-100">{{ camera?.display_name || camera?.name }} Settings</h2>
              <p class="text-xs text-slate-400">Configure Camera IP, RTSP credentials, and Subnet</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="saveSettings" class="p-6 space-y-4 text-slate-200">
          
          <!-- Camera Display Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
            <input v-model="editDisplayName" type="text" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-100">
          </div>

          <!-- Camera IP Address -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Camera IP Address (Local Network)</label>
            <div class="flex gap-2">
              <input v-model="editIp" type="text" placeholder="192.168.50.101 or 192.168.18.101" required class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 text-slate-100">
              <!-- Quick Subnet Toggle Buttons -->
              <button type="button" @click="toggleSubnet('18')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300">
                .18.x
              </button>
              <button type="button" @click="toggleSubnet('50')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300">
                .50.x
              </button>
            </div>
          </div>

          <!-- Username & Password -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Username</label>
              <input v-model="editUsername" type="text" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 text-slate-100">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Password / Verification Code</label>
              <input v-model="editPassword" type="text" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 text-slate-100">
            </div>
          </div>

          <!-- Full RTSP Stream URL Preview -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Generated Local RTSP URL</label>
            <code class="block text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
              {{ computedRtspUrl }}
            </code>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <button type="button" @click="testDirectStream" :disabled="isTesting" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
              <svg v-if="!isTesting" class="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
              <svg v-else class="w-3.5 h-3.5 animate-spin text-cyan-400" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ isTesting ? 'Testing...' : 'Test Connection' }}
            </button>

            <button type="submit" :disabled="isSaving" class="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  camera: Object
})

const emit = defineEmits(['close'])

const editDisplayName = ref('')
const editIp = ref('')
const editUsername = ref('admin')
const editPassword = ref('')
const isSaving = ref(false)
const isTesting = ref(false)

watch(() => props.camera, (newCam) => {
  if (newCam) {
    editDisplayName.value = newCam.display_name || newCam.name || '';
    editUsername.value = newCam.username || 'admin';
    editPassword.value = newCam.password || '';
    
    if (newCam.rtsp_url) {
      const match = newCam.rtsp_url.match(/@([^:/]+)/);
      if (match) editIp.value = match[1];
    } else {
      editIp.value = newCam.public_ip || '192.168.18.101';
    }
  }
}, { immediate: true })

const toggleSubnet = (sub) => {
  if (!editIp.value) return;
  const parts = editIp.value.split('.');
  if (parts.length === 4) {
    parts[2] = sub;
    editIp.value = parts.join('.');
  }
}

const computedRtspUrl = computed(() => {
  const isDahua = props.camera?.camera_brand === 'Dahua' || props.camera?.name?.includes('dahua') || props.camera?.name?.includes('cam1');
  const user = editUsername.value || 'admin';
  const pass = editPassword.value ? encodeURIComponent(editPassword.value) : '';
  const ip = editIp.value || '192.168.18.101';
  
  if (isDahua) {
    return `rtsp://${user}:${pass}@${ip}:554/cam/realmonitor?channel=1&subtype=1`;
  } else {
    return `rtsp://${user}:${pass}@${ip}:554/Streaming/Channels/102`;
  }
})

const saveSettings = async () => {
  if (!props.camera) return;
  isSaving.value = true;
  try {
    const isDahua = props.camera?.camera_brand === 'Dahua' || props.camera?.name?.includes('dahua') || props.camera?.name?.includes('cam1');
    const mainUrl = isDahua 
      ? `rtsp://${editUsername.value}:${encodeURIComponent(editPassword.value)}@${editIp.value}:554/cam/realmonitor?channel=1&subtype=0`
      : `rtsp://${editUsername.value}:${encodeURIComponent(editPassword.value)}@${editIp.value}:554/Streaming/Channels/101`;
    const subUrl = isDahua
      ? `rtsp://${editUsername.value}:${encodeURIComponent(editPassword.value)}@${editIp.value}:554/cam/realmonitor?channel=1&subtype=1`
      : `rtsp://${editUsername.value}:${encodeURIComponent(editPassword.value)}@${editIp.value}:554/Streaming/Channels/102`;

    // Register with local go2rtc directly
    const host = window.location.hostname || '127.0.0.1';
    const baseName = props.camera.name.replace(/_sub$/, '');
    await fetch(`http://${host}:1984/api/streams?name=${baseName}&src=${encodeURIComponent(mainUrl)}`, { method: 'PUT' });
    await fetch(`http://${host}:1984/api/streams?name=${baseName}_sub&src=${encodeURIComponent(subUrl)}`, { method: 'PUT' });

    alert('Settings updated successfully! Stream will now reload.');
    emit('close');
    window.location.reload();
  } catch (e) {
    alert('Failed to save settings: ' + e.message);
  } finally {
    isSaving.value = false;
  }
}

const testDirectStream = async () => {
  isTesting.value = true;
  try {
    const host = window.location.hostname || '127.0.0.1';
    const res = await fetch(`http://${host}:1984/api/streams?src=${encodeURIComponent(computedRtspUrl.value)}`, { method: 'PUT' });
    if (res.ok) {
      alert('✅ Connection Successful! Camera is reachable.');
    } else {
      const txt = await res.text();
      alert('❌ Camera unreachable: ' + txt);
    }
  } catch (e) {
    alert('Test failed: ' + e.message);
  } finally {
    isTesting.value = false;
  }
}
</script>
