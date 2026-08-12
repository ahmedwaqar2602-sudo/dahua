<template>
  <div class="h-screen w-screen bg-black overflow-hidden relative">
    <div v-if="pending" class="absolute inset-0 flex items-center justify-center bg-slate-900">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
    </div>
    
    <div v-else-if="!accessData?.success" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center px-4">
      <svg class="w-16 h-16 text-slate-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
      </svg>
      <h2 class="text-2xl font-light text-slate-300 max-w-lg leading-relaxed">
        {{ accessData?.message || 'Camera feed is currently offline. Operational viewing hours are 08:00 - 18:00 PKT.' }}
      </h2>
    </div>

    <iframe
      v-else
      :src="accessData.streamUrl"
      class="absolute inset-0 w-full h-full border-none"
      allowfullscreen
      allow="autoplay; encrypted-media; picture-in-picture"
      title="Live Stream"
    ></iframe>

    <!-- Subtle Refresh Button -->
    <button 
      @click="refreshStream"
      class="absolute bottom-6 right-6 p-3 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all duration-300 z-10"
      title="Refresh Stream"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const pending = ref(true);
const accessData = ref(null);

const fetchAccess = async () => {
  pending.value = true;
  try {
    accessData.value = await $fetch('/api/access');
  } catch (err) {
    accessData.value = err.response?._data || { success: false };
  } finally {
    pending.value = false;
  }
};

const refreshStream = () => {
  fetchAccess();
};

onMounted(() => {
  fetchAccess();
});
</script>
