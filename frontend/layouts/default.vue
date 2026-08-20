<template>
  <div class="h-screen w-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden selection:bg-cyan-500/30">
    <!-- 1. Primary Navigation Sidebar -->
    <nav class="w-16 lg:w-20 bg-[#1e2330] flex flex-col items-center py-6 border-r border-slate-800 z-30 flex-shrink-0">
      <!-- Logo -->
      <div class="mb-10 text-cyan-400">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          <circle cx="12" cy="14" r="2" class="text-rose-500"/>
        </svg>
      </div>

      <!-- Nav Items -->
      <div class="flex flex-col gap-6 w-full px-2">
        <!-- Live -->
        <NuxtLink to="/" class="relative flex flex-col items-center justify-center p-2 group transition-colors text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Live</span>
        </NuxtLink>
        <!-- Notifications -->
        <NuxtLink to="/notifications" class="relative flex flex-col items-center justify-center p-2 group transition-colors text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Notifications</span>
        </NuxtLink>
      </div>
    </nav>
    <slot />
  </div>
</template>

<style scoped>
.router-link-exact-active > div {
  opacity: 1 !important;
}
</style>
