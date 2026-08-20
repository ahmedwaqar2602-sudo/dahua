<template>
  <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 class="text-xl font-bold text-white flex items-center gap-3">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            {{ camera?.display_name || camera?.name }} Recordings
          </h2>
          <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 text-white text-center">
          <p class="text-slate-400">Recording timeline panel coming soon...</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  camera: Object
})
defineEmits(['close'])
</script>
