<template>
  <div class="h-screen w-screen bg-[#14171f] text-slate-200 font-sans flex overflow-hidden selection:bg-cyan-500/30">
    
    <!-- Flussonic Watcher Primary Left Sidebar -->
    <aside class="w-56 bg-[#252936] flex flex-col justify-between border-r border-[#1a1e28] z-30 flex-shrink-0 select-none shadow-2xl">
      
      <!-- Top Section -->
      <div class="flex flex-col">
        <!-- Flussonic WATCHER Brand Logo -->
        <div class="p-4 border-b border-[#1d212c] flex items-center gap-2.5">
          <!-- Flussonic Atom Molecule Icon -->
          <div class="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <svg class="w-4 h-4 text-slate-100" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(30 12 12)" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-30 12 12)" />
            </svg>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 font-medium tracking-wider leading-none">flussonic</div>
            <div class="text-sm font-black text-white tracking-widest leading-tight">WATCHER</div>
          </div>
        </div>

        <!-- Main Navigation Items -->
        <nav class="p-2 space-y-0.5 text-xs font-medium">
          <!-- Cameras -->
          <NuxtLink to="/" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#313647] transition-colors" exact-active-class="!bg-[#363c4e] !text-white !font-bold">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>Cameras</span>
          </NuxtLink>

          <!-- Favorites -->
          <NuxtLink to="/?filter=favorites" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>Favorites</span>
          </NuxtLink>

          <!-- Mosaics -->
          <NuxtLink to="/?view=mosaic" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Mosaics</span>
          </NuxtLink>

          <!-- Agents -->
          <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span>Agents</span>
          </a>

          <!-- Map -->
          <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
            <span>Map</span>
          </a>

          <!-- Events -->
          <NuxtLink to="/notifications" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#313647] transition-colors" exact-active-class="!bg-[#363c4e] !text-white !font-bold">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <span>Events</span>
          </NuxtLink>

          <!-- Users -->
          <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Users</span>
          </a>

          <!-- Organizations -->
          <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Organizations</span>
          </a>

          <!-- Camera presets -->
          <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span>Camera presets</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Settings & System Info Section -->
      <div class="p-3 border-t border-[#1d212c] space-y-1">
        <!-- Settings -->
        <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
          <span>Settings</span>
        </a>

        <!-- Health (1) -->
        <a href="#" @click.prevent class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Health</span>
          </div>
          <span class="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">1</span>
        </a>

        <!-- Access log -->
        <a href="#" @click.prevent class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#313647] transition-colors">
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Access log</span>
        </a>

        <!-- Version & Operator ID Footer -->
        <div class="pt-2 text-[10px] text-slate-500 font-mono leading-tight px-1 border-t border-[#1d212c]/60">
          <div>Powered by <strong class="text-slate-400">Flussonic</strong></div>
          <div>Version: 21.05.1</div>
          <div>Operator ID: 44766</div>
        </div>
      </div>

    </aside>

    <slot />
  </div>
</template>

