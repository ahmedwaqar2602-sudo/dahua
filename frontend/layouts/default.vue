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
        
        <!-- Events -->
        <NuxtLink to="/events" class="relative flex flex-col items-center justify-center p-2 group transition-colors text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Events</span>
        </NuxtLink>
        
        <!-- Playback -->
        <NuxtLink to="/playback" class="relative flex flex-col items-center justify-center p-2 group transition-colors text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Playback</span>
        </NuxtLink>
        
        <!-- Dashboard -->
        <NuxtLink to="/dashboard" class="relative flex flex-col items-center justify-center p-2 group transition-colors text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Dashboard</span>
        </NuxtLink>
        
        <!-- Settings -->
        <NuxtLink to="/settings" class="relative flex flex-col items-center justify-center p-2 group transition-colors mt-auto text-slate-400 hover:text-slate-200" exact-active-class="!text-cyan-400">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] opacity-0 transition-opacity"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Settings</span>
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
