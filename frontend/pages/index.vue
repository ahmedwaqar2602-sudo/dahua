<template>
  <div class="flex-1 flex flex-col h-full bg-[#14171f] overflow-hidden">
    <!-- Top Toast Notification -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-[-20px]" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-[-20px]">
      <div v-if="toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 backdrop-blur-md border border-emerald-400 font-medium text-xs">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        {{ toastMessage }}
      </div>
    </transition>

    <!-- 1. Top Subheader / App Bar (Flussonic Watcher Header) -->
    <header class="h-12 bg-[#1b1f2b] border-b border-[#252936] flex items-center justify-between px-4 shrink-0 z-20 select-none">
      <!-- Left: Breadcrumbs & DVR Button -->
      <div class="flex items-center gap-3">




        <!-- Share & Add Quick Actions -->
        <button @click="openShareModal" class="px-2.5 py-1 rounded bg-[#252936] hover:bg-[#31374a] text-indigo-300 text-[11px] font-semibold border border-[#2f3546] transition-colors flex items-center gap-1">
          <svg class="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          Share
        </button>

        <button @click="showVlcModal = true" class="px-2.5 py-1 rounded bg-[#252936] hover:bg-[#31374a] text-amber-300 text-[11px] font-semibold border border-[#2f3546] transition-colors flex items-center gap-1">
          <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          4G URLs
        </button>
      </div>

      <!-- Right: View Mode Switcher, Language & Profile (Flussonic Header Icons) -->
      <div class="flex items-center gap-4">
        <!-- View Mode Switcher (Highlighted in Red in Screenshot 2) -->
        <div class="flex items-center gap-1 bg-[#14171f] p-0.5 rounded border border-[#252936]">
          <!-- 1. Cards View -->
          <button @click="viewMode = 'cards'" class="p-1.5 rounded transition-colors" :class="viewMode === 'cards' ? 'bg-[#2f3649] text-cyan-400' : 'text-slate-400 hover:text-white'" title="Large Cards View">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>
          </button>
          <!-- 2. Small Cards / Dense Tiles -->
          <button @click="viewMode = 'compact'" class="p-1.5 rounded transition-colors" :class="viewMode === 'compact' ? 'bg-[#2f3649] text-cyan-400' : 'text-slate-400 hover:text-white'" title="Small Cards / Grid Tiles">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h3v3H3zm5 0h3v3H8zm5 0h3v3h-3zm5 0h3v3h-3zM3 9h3v3H3zm5 0h3v3H8zm5 0h3v3h-3zm5 0h3v3h-3zM3 14h3v3H3zm5 0h3v3H8zm5 0h3v3h-3zm5 0h3v3h-3zM3 19h3v3H3zm5 0h3v3H8zm5 0h3v3h-3zm5 0h3v3h-3z"/></svg>
          </button>
          <!-- 3. List Mode -->
          <button @click="viewMode = 'list'" class="p-1.5 rounded transition-colors" :class="viewMode === 'list' ? 'bg-[#2f3649] text-cyan-400' : 'text-slate-400 hover:text-white'" title="List View">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/></svg>
          </button>
          <!-- 4. Mosaic Mode (2x2 Quad / Multi Layout - Highlighted in Red in Screenshot 2) -->
          <button @click="viewMode = 'mosaic'" class="p-1.5 rounded border transition-colors" :class="viewMode === 'mosaic' ? 'bg-[#2f3649] text-cyan-400 border-cyan-500/50 shadow-sm' : 'text-slate-400 border-transparent hover:text-white'" title="Mosaic Quad Surveillance (Screenshot 2)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v18H3zm10 0h8v8h-8zm0 10h8v8h-8z"/></svg>
          </button>
        </div>

        <div class="h-4 w-px bg-[#252936]"></div>



        <!-- Admin Profile -->
        <div class="flex items-center gap-2 text-xs text-slate-300 font-bold bg-[#252936] px-2.5 py-1 rounded border border-[#2f3546] cursor-pointer hover:bg-[#31374a]">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span>ADMIN</span>
        </div>
      </div>
    </header>

    <!-- 2. Workspace Body: Left Center Stage + Right Cameras Panel -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Center Main Workspace Area -->
      <main class="flex-1 flex flex-col bg-[#14171f] overflow-hidden relative">
        
        <!-- View 1: Mosaic Surveillance Grid (Screenshot 2 exact 2x2 with drag-and-drop slots) -->
        <div v-if="viewMode === 'mosaic'" class="flex-1 p-3.5 overflow-hidden flex flex-col bg-[#14171f]">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start content-start">
            
            <!-- Slot 0 -->
            <div class="relative bg-black rounded-lg overflow-hidden border border-[#252936] shadow-xl group aspect-video">
              <template v-if="mosaicSlots[0]">
                <div class="absolute inset-0 z-10 cursor-pointer" @click="openCameraDetail(mosaicSlots[0])" title="Click to open PTZ & Audio settings"></div>
                
                <img v-if="streamSnapshots[mosaicSlots[0].id]" :src="streamSnapshots[mosaicSlots[0].id]" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]" />
                <iframe v-else :key="'iframe-' + mosaicSlots[0].id + '-' + (reloadKeys[mosaicSlots[0].id] || 0)" :id="'iframe-' + mosaicSlots[0].id" :src="'/player.html?v=3&src=' + getWsUrlPath(mosaicSlots[0]) + '&muted=' + (!isAudioOn(mosaicSlots[0]))" class="w-full h-full object-contain pointer-events-none border-none relative z-0 transition-transform duration-300" :class="[needsCssFlip(mosaicSlots[0]) ? 'scale-y-[-1]' : '', needsCssMirror(mosaicSlots[0]) ? 'scale-x-[-1]' : '']"></iframe>
                
                <!-- Top-Left Timestamp & Label -->
                <div class="absolute top-2.5 left-2.5 flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded text-xs text-white font-mono font-bold border border-white/10 z-20 pointer-events-none">
                  <span class="text-cyan-300">{{ mosaicSlots[0].displayTime || liveClock }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{{ mosaicSlots[0].display_name || mosaicSlots[0].name }}</span>
                </div>
                <!-- Top-Right Actions: Voice ON/OFF & Remove Slot -->
                <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                  <!-- Voice ON/OFF Button -->
                  <button @click.stop="toggleCameraAudio(mosaicSlots[0])" class="px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-md" :class="isAudioOn(mosaicSlots[0]) ? 'bg-emerald-600 text-white shadow-emerald-600/40' : 'bg-black/75 hover:bg-slate-800 text-slate-300 border border-white/10'" :title="isAudioOn(mosaicSlots[0]) ? 'Voice is ON (Click to Mute)' : 'Voice is OFF (Click to Listen)'">
                    <svg v-if="isAudioOn(mosaicSlots[0])" class="w-3.5 h-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
                    <svg v-else class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                    <span>{{ isAudioOn(mosaicSlots[0]) ? 'Voice ON' : 'Muted' }}</span>
                  </button>
                  <!-- Remove Camera From Slot -->
                  <button @click.stop="confirmRemoveSlot(0)" class="p-1 bg-black/80 hover:bg-rose-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Remove from slot">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </template>
              <div v-else @click="assignFirstAvailable(0)" class="w-full h-full flex flex-col items-center justify-center bg-[#181d28] border-2 border-dashed border-[#2b3345] hover:border-cyan-500/60 rounded-lg cursor-pointer transition-all group">
                <span class="text-slate-400 group-hover:text-cyan-300 font-semibold text-sm">Drag camera here</span>
                <span class="text-[11px] text-slate-500 mt-1">or click to place camera</span>
              </div>
            </div>

            <!-- Slot 1 (Highlighted with Blue Border in Screenshot 2) -->
            <div class="relative bg-black rounded-lg overflow-hidden border border-[#252936] shadow-xl group aspect-video" :class="!mosaicSlots[1] ? 'border-2 border-cyan-500/80 bg-[#121c2e]' : ''">
              <template v-if="mosaicSlots[1]">
                <div class="absolute inset-0 z-10 cursor-pointer" @click="openCameraDetail(mosaicSlots[1])" title="Click to open PTZ & Audio settings"></div>
                
                <img v-if="streamSnapshots[mosaicSlots[1].id]" :src="streamSnapshots[mosaicSlots[1].id]" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]" />
                <iframe v-else :key="'iframe-' + mosaicSlots[1].id + '-' + (reloadKeys[mosaicSlots[1].id] || 0)" :id="'iframe-' + mosaicSlots[1].id" :src="'/player.html?v=3&src=' + getWsUrlPath(mosaicSlots[1]) + '&muted=' + (!isAudioOn(mosaicSlots[1]))" class="w-full h-full object-contain pointer-events-none border-none relative z-0 transition-transform duration-300" :class="[needsCssFlip(mosaicSlots[1]) ? 'scale-y-[-1]' : '', needsCssMirror(mosaicSlots[1]) ? 'scale-x-[-1]' : '']"></iframe>
                
                <div class="absolute top-2.5 left-2.5 flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded text-xs text-white font-mono font-bold border border-white/10 z-20 pointer-events-none">
                  <span class="text-cyan-300">{{ mosaicSlots[1].displayTime || liveClock }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{{ mosaicSlots[1].display_name || mosaicSlots[1].name }}</span>
                </div>
                <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                  <button @click.stop="toggleCameraAudio(mosaicSlots[1])" class="px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-md" :class="isAudioOn(mosaicSlots[1]) ? 'bg-emerald-600 text-white shadow-emerald-600/40' : 'bg-black/75 hover:bg-slate-800 text-slate-300 border border-white/10'" :title="isAudioOn(mosaicSlots[1]) ? 'Voice is ON (Click to Mute)' : 'Voice is OFF (Click to Listen)'">
                    <svg v-if="isAudioOn(mosaicSlots[1])" class="w-3.5 h-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
                    <svg v-else class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                    <span>{{ isAudioOn(mosaicSlots[1]) ? 'Voice ON' : 'Muted' }}</span>
                  </button>
                  <button @click.stop="confirmRemoveSlot(1)" class="p-1 bg-black/80 hover:bg-rose-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Remove from slot">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </template>
              <div v-else @click="assignFirstAvailable(1)" class="w-full h-full flex flex-col items-center justify-center bg-[#121c2e] hover:bg-[#16243b] rounded-lg cursor-pointer transition-all">
                <span class="text-cyan-300 font-bold text-sm tracking-wide">Drag camera here</span>
                <span class="text-[11px] text-cyan-400/60 mt-1">Ready for drop</span>
              </div>
            </div>

          </div>
        </div>

        <!-- View 2: Cards View Mode -->
        <div v-else-if="viewMode === 'cards'" class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 bg-[#14171f]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="cam in filteredCameras" :key="cam.id" class="bg-[#1e2330] rounded-xl overflow-hidden shadow-2xl border border-[#282f40] group relative flex flex-col hover:border-cyan-500/50 transition-all">
              <div class="px-4 py-2.5 bg-[#252a3a] border-b border-[#2e364a] flex items-center justify-between z-20">
                <div class="flex items-center gap-2">
                  <button @click.stop="toggleFavorite(cam.id)" class="text-sm transition-colors" :class="favorites.includes(cam.id) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'">★</button>
                  <span class="w-2 h-2 rounded-full" :class="isOnline(cam) ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500'"></span>
                  <span class="text-xs font-bold text-white truncate max-w-[160px]">{{ cam.display_name || cam.name }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <!-- Header Voice Indicator / Toggle -->
                  <button @click.stop="toggleCameraAudio(cam)" class="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all" :class="isAudioOn(cam) ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'" :title="isAudioOn(cam) ? 'Voice ON' : 'Voice Muted'">
                    <svg v-if="isAudioOn(cam)" class="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
                    <svg v-else class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    <span>{{ isAudioOn(cam) ? 'Voice ON' : 'Muted' }}</span>
                  </button>
                  <span class="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{{ cam.camera_brand || 'IP CAM' }}</span>
                </div>
              </div>

              <!-- Stream Video Container -->
              <div class="relative aspect-video w-full bg-black overflow-hidden pointer-events-none">
                <img v-if="streamSnapshots[cam.id]" :src="streamSnapshots[cam.id]" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]" />
                <iframe v-else :key="'iframe-' + cam.id + '-' + (reloadKeys[cam.id] || 0)" :id="'iframe-' + cam.id" :src="'/player.html?v=3&src=' + getWsUrlPath(cam) + '&muted=' + (!isAudioOn(cam))" class="w-full h-full object-contain border-none transition-transform duration-300" :class="[needsCssFlip(cam) ? 'scale-y-[-1]' : '', needsCssMirror(cam) ? 'scale-x-[-1]' : '']"></iframe>
                
                <!-- Telemetry Badges Overlay on Hover -->
                <div class="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-mono text-slate-200 bg-black/80 px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                  <span class="text-emerald-400 font-bold">1080p</span>
                  <span>•</span>
                  <span>H.264</span>
                  <span>•</span>
                  <span>2.4M</span>
                  <span>•</span>
                  <span>25fps</span>
                </div>

                <!-- Open DVR & Voice Overlay Button -->
                <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="toggleCameraAudio(cam)" class="px-2.5 py-1 rounded text-[11px] font-bold shadow-lg transition-colors flex items-center gap-1" :class="isAudioOn(cam) ? 'bg-emerald-600 text-white' : 'bg-black/80 hover:bg-slate-800 text-slate-200 border border-white/10'">
                    <svg v-if="isAudioOn(cam)" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
                    <svg v-else class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    {{ isAudioOn(cam) ? 'Mute' : 'Voice ON' }}
                  </button>
                  <button @click.stop="activeRecordingCamera = cam" class="px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded text-[11px] font-bold shadow-lg transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    DVR
                  </button>
                  <button @click.stop="toggleInvert(cam.id)" class="px-2.5 py-1 rounded text-[11px] font-bold shadow-lg transition-colors flex items-center gap-1" :class="isInverted(cam.id) ? 'bg-indigo-600 text-white' : 'bg-black/80 hover:bg-slate-800 text-slate-200 border border-white/10'" title="Flip Upside">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    Flip Upside
                  </button>
                  <button @click.stop="toggleMirror(cam.id)" class="px-2.5 py-1 rounded text-[11px] font-bold shadow-lg transition-colors flex items-center gap-1" :class="isMirrored(cam.id) ? 'bg-teal-600 text-white' : 'bg-black/80 hover:bg-slate-800 text-slate-200 border border-white/10'" title="Mirror Flip">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 17h8M4 12h16m-4-4l4 4-4 4M8 8l-4 4 4 4" /></svg>
                    Mirror Flip
                  </button>
                  <button @click.stop="openCameraDetail(cam)" class="p-1 bg-black/80 hover:bg-cyan-600 text-white rounded border border-white/10 shadow-lg transition-colors" title="PTZ & Controls">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Card Bottom Bar: RTSP & DVR -->
              <div class="p-2.5 bg-[#1b202c] border-t border-[#262c3d] flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <button @click.stop="copyCameraRtsp(cam, 'local')" class="px-2 py-0.5 bg-[#252b3c] hover:bg-[#31394f] text-slate-300 text-[11px] rounded border border-[#31384e]">Local RTSP</button>
                  <button @click.stop="copyCameraRtsp(cam, 'public')" class="px-2 py-0.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-[11px] font-bold rounded border border-cyan-500/30">4G RTSP</button>
                </div>
                <button @click.stop="activeRecordingCamera = cam" class="text-emerald-400 font-bold text-xs flex items-center gap-1 hover:underline">
                  DVR Playback ➔
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- View 3: Compact Tiles Mode -->
        <div v-else-if="viewMode === 'compact'" class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 bg-[#14171f]">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div v-for="cam in filteredCameras" :key="cam.id" @click="openCameraDetail(cam)" class="bg-[#1e2330] rounded-lg overflow-hidden border border-[#282f40] hover:border-cyan-500 cursor-pointer shadow-lg group">
              <div class="relative aspect-video w-full bg-black">
                <img v-if="streamSnapshots[cam.id]" :src="streamSnapshots[cam.id]" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]" />
                <iframe v-else :key="'iframe-' + cam.id + '-' + (reloadKeys[cam.id] || 0)" :id="'iframe-' + cam.id" :src="'/player.html?v=3&src=' + getWsUrlPath(cam) + '&muted=' + (!isAudioOn(cam))" class="w-full h-full object-contain pointer-events-none border-none transition-transform duration-300" :class="[needsCssFlip(cam) ? 'scale-y-[-1]' : '', needsCssMirror(cam) ? 'scale-x-[-1]' : '']"></iframe>
                <div class="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </div>
              </div>
              <div class="p-2 bg-[#1a1e2a] flex items-center justify-between text-xs">
                <span class="font-bold text-white truncate">{{ cam.display_name || cam.name }}</span>
                <span class="text-[9px] text-cyan-400 font-mono">{{ cam.camera_brand || 'IP' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- View 4: List Table Mode -->
        <div v-else-if="viewMode === 'list'" class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 bg-[#14171f]">
          <div class="bg-[#1e2330] border border-[#282f40] rounded-xl overflow-hidden shadow-2xl">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-[#181c26] text-[11px] font-bold uppercase text-slate-400 border-b border-[#282f40]">
                <tr>
                  <th class="p-3 w-10 text-center">★</th>
                  <th class="p-3 w-16">Status</th>
                  <th class="p-3">Camera Name</th>
                  <th class="p-3">IP & Port</th>
                  <th class="p-3">Brand / Protocol</th>
                  <th class="p-3">Archive Depth</th>
                  <th class="p-3">Codec / Bitrate</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#282f40]/70">
                <tr v-for="cam in filteredCameras" :key="cam.id" class="hover:bg-[#252b3c] transition-colors">
                  <td class="p-3 text-center">
                    <button @click="toggleFavorite(cam.id)" class="text-sm" :class="favorites.includes(cam.id) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'">★</button>
                  </td>
                  <td class="p-3 font-bold" :class="isOnline(cam) ? 'text-emerald-400' : 'text-rose-400'">
                    {{ isOnline(cam) ? 'Online' : 'Offline' }}
                  </td>
                  <td class="p-3 font-bold text-white hover:text-cyan-400 cursor-pointer" @click="openCameraDetail(cam)">
                    {{ cam.display_name || cam.name }}
                  </td>
                  <td class="p-3 font-mono text-cyan-300">{{ getCameraIp(cam) }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#273042] text-cyan-300">{{ cam.camera_brand || 'ONVIF' }}</span>
                  </td>
                  <td class="p-3"><span class="text-emerald-400 font-bold">30 Days (24/7)</span></td>
                  <td class="p-3 font-mono text-slate-400">H.264 / 2.4 Mbps / 25 FPS</td>
                  <td class="p-3 text-right space-x-1">
                    <button @click="openCameraDetail(cam)" class="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded text-xs font-bold transition-colors">View</button>
                    <button @click="activeRecordingCamera = cam" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-xs font-bold transition-colors">DVR</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- 4. Right Side Panel: Cameras Tree & Drag-and-Drop (Screenshot 2 exact design) -->
      <aside class="w-64 bg-[#1b1f2b] border-l border-[#252936] flex flex-col justify-between shrink-0 z-20 select-none">
        
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- Header: Cameras with ⋮ menu -->
          <div class="p-3 border-b border-[#252936] flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
              Cameras
            </h3>
            <button @click="showAddCameraModal = true" class="text-slate-400 hover:text-white p-1 rounded hover:bg-[#252936] transition-colors" title="Add Camera">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>

          <!-- Search Box -->
          <div class="p-2.5 border-b border-[#252936] flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <div class="relative flex-1">
              <svg class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" v-model="cameraSearch" placeholder="Search" class="w-full bg-[#14171f] border border-[#252936] rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>

          <!-- Collapsible Category Trees (ONLINE, OFFLINE) -->
          <div class="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
            
            <!-- Category: ONLINE -->
            <div>
              <div @click="groupOnlineOpen = !groupOnlineOpen" class="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer rounded hover:bg-[#252936]">
                <div class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-slate-400 transition-transform" :class="groupOnlineOpen ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  <span>ONLINE</span>
                </div>
                <div class="flex items-center gap-1 bg-[#252936] px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                  <svg class="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  <span>{{ onlineCameras.length }}</span>
                </div>
              </div>

              <!-- Camera Items -->
              <div v-if="groupOnlineOpen" class="pt-1 space-y-1">
                <div 
                  v-for="cam in onlineCameras" 
                  :key="cam.id" 
                  @click="assignToSlot(cam)"
                  class="flex items-center justify-between p-2 rounded-md bg-[#252a3a] hover:bg-[#32394e] border border-[#2e3547] cursor-pointer text-xs group transition-all shadow-sm"
                  title="Click to place in Mosaic slot"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 group-hover:text-slate-300 cursor-grab">⋮⋮</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span class="text-slate-200 group-hover:text-cyan-300 font-semibold truncate max-w-[120px]">{{ cam.display_name || cam.name }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button @click.stop="openCameraDetail(cam)" class="text-slate-500 hover:text-white p-0.5" title="PTZ & Audio">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category: OFFLINE -->
            <div>
              <div @click="groupOfflineOpen = !groupOfflineOpen" class="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer rounded hover:bg-[#252936]">
                <div class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-slate-400 transition-transform" :class="groupOfflineOpen ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  <span>OFFLINE</span>
                </div>
                <div class="flex items-center gap-1 bg-[#252936] px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                  <svg class="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  <span>{{ offlineCameras.length }}</span>
                </div>
              </div>

              <!-- Camera Items -->
              <div v-if="groupOfflineOpen" class="pt-1 space-y-1">
                <div 
                  v-for="cam in offlineCameras" 
                  :key="cam.id" 
                  @click="assignToSlot(cam)"
                  class="flex items-center justify-between p-2 rounded-md bg-[#252a3a] hover:bg-[#32394e] border border-[#2e3547] cursor-pointer text-xs group transition-all shadow-sm"
                  title="Click to place in Mosaic slot"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 group-hover:text-slate-300 cursor-grab">⋮⋮</span>
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span class="text-slate-200 group-hover:text-cyan-300 font-semibold truncate max-w-[120px]">{{ cam.display_name || cam.name }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button @click.stop="openCameraDetail(cam)" class="text-slate-500 hover:text-white p-0.5" title="PTZ & Audio">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Add Camera Action at bottom of Right Panel -->
        <div class="p-3 border-t border-[#252936]">
          <button @click="showAddCameraModal = true" class="w-full py-2 bg-[#252a3a] hover:bg-cyan-600/20 text-cyan-400 border border-[#2f3546] hover:border-cyan-500/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Camera
          </button>
        </div>

      </aside>

    </div>

    <!-- Focused Camera Overlay with PTZ Controls & Voice -->
    <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="selectedCamera" ref="focusOverlayRef" class="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex flex-col">
        <!-- Header -->
        <div class="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
              {{ selectedCamera.display_name || selectedCamera.name }}
            </h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">{{ selectedCamera.camera_brand || 'IP CAMERA' }}</span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Audio / Voice Toggle in Overlay -->
            <button @click="toggleCameraAudio(selectedCamera)" class="px-3.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all shadow-md" :class="isAudioOn(selectedCamera) ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'">
              <svg v-if="isAudioOn(selectedCamera)" class="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z"/></svg>
              <svg v-else class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
              <span>{{ isAudioOn(selectedCamera) ? 'Voice: ON' : 'Voice: OFF (Muted)' }}</span>
            </button>

            <button @click="toggleOverlayFullscreen" class="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800" title="Toggle Fullscreen">

              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </button>
            <button @click="confirmDeleteCamera(selectedCamera)" class="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-900/30" title="Delete Camera">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
              <button @click="closeCameraDetail" class="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800" title="Close Overlay">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <!-- Main Player & PTZ Controller Row -->
        <div class="flex-1 relative bg-black flex overflow-hidden min-h-0">
          <div class="flex-1 relative flex items-center justify-center overflow-hidden">
            <!-- Stream Iframe with ePTZ and Digital Zoom Transform -->
            <img v-if="streamSnapshots[selectedCamera.id]" :src="streamSnapshots[selectedCamera.id]" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]" :style="{ transform: (needsCssFlip(selectedCamera) ? 'scaleY(-1) ' : '') + (needsCssMirror(selectedCamera) ? 'scaleX(-1) ' : '') + `scale(${getCamZoom(selectedCamera.id)}) translate(${getCamPanX(selectedCamera.id)}px, ${getCamPanY(selectedCamera.id)}px)` }" />
            <iframe v-else :key="'iframe-' + selectedCamera.id + '-' + (reloadKeys[selectedCamera.id] || 0)" :id="'iframe-' + selectedCamera.id" :src="'/player.html?v=3&src=' + getWsUrlPath(selectedCamera, 'main') + '&muted=' + (!isAudioOn(selectedCamera))" class="w-full h-full object-contain origin-center transition-transform duration-300 border-none" :style="{ transform: (needsCssFlip(selectedCamera) ? 'scaleY(-1) ' : '') + (needsCssMirror(selectedCamera) ? 'scaleX(-1) ' : '') + `scale(${getCamZoom(selectedCamera.id)}) translate(${getCamPanX(selectedCamera.id)}px, ${getCamPanY(selectedCamera.id)}px)` }"></iframe>

            <!-- Digital Zoom Badge Overlay -->
            <div v-if="getCamZoom(selectedCamera.id) > 1" class="absolute top-4 left-4 bg-cyan-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 z-20 border border-cyan-400/30">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              <span>{{ getCamZoom(selectedCamera.id) }}x Digital Zoom</span>
              <button @click="resetZoomCam(selectedCamera.id)" class="px-1.5 py-0.5 bg-black/40 hover:bg-rose-600 text-white rounded text-[10px] transition-colors ml-1" title="Reset Zoom">Reset 1x</button>
            </div>
          </div>


          <!-- Integrated Admin PTZ Control Sidebar Panel -->
          <div class="w-80 bg-slate-900/90 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-20">
            <div>
              <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </h3>
                <span class="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
              </div>

              <!-- PTZ Direction Joystick Pad -->
              <div v-if="selectedCamera.camera_brand !== 'Dahua'" class="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner my-3">
                <!-- UP -->
                <button @pointerdown="triggerPtz(selectedCamera.id, 'UP', 1.0)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="w-12 h-12 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all mb-2 select-none" title="Tilt Up">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                </button>
                
                <div class="flex items-center justify-center gap-3 w-full">
                  <!-- LEFT -->
                  <button @pointerdown="triggerPtz(selectedCamera.id, 'LEFT', 1.0)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="w-12 h-12 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all select-none" title="Pan Left">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
                  </button>

                  <!-- CENTER / STOP -->
                  <button @click="triggerPtz(selectedCamera.id, 'STOP', 0)" class="w-12 h-12 bg-slate-900 border border-slate-700 hover:bg-rose-600 active:scale-95 text-slate-300 hover:text-white rounded-xl flex items-center justify-center shadow-lg transition-all font-bold text-xs" title="Stop Movement">
                    STOP
                  </button>

                  <!-- RIGHT -->
                  <button @pointerdown="triggerPtz(selectedCamera.id, 'RIGHT', 1.0)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="w-12 h-12 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all select-none" title="Pan Right">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <!-- DOWN -->
                <button @pointerdown="triggerPtz(selectedCamera.id, 'DOWN', 1.0)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="w-12 h-12 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg transition-all mt-2 select-none" title="Tilt Down">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>

              <!-- Zoom Controls -->
              <div class="grid grid-cols-2 gap-3 mt-4">
                <button @pointerdown="triggerPtz(selectedCamera.id, 'ZOOM_IN', 0.6)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="py-2.5 bg-slate-950 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Zoom In (+)
                </button>
                <button @pointerdown="triggerPtz(selectedCamera.id, 'ZOOM_OUT', 0.6)" @pointerup="triggerPtz(selectedCamera.id, 'STOP', 0)" @pointerleave="triggerPtz(selectedCamera.id, 'STOP', 0)" class="py-2.5 bg-slate-950 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  Zoom Out (-)
                </button>
              </div>

              <!-- Invert Control -->
              <div class="mt-4">
                <button @click="toggleInvert(selectedCamera.id)" class="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none border" :class="isInverted(selectedCamera.id) ? 'bg-indigo-600/50 hover:bg-indigo-600/70 text-indigo-300 border-indigo-500/50' : 'bg-slate-950 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  Flip Upside
                </button>
                <button @click="toggleMirror(selectedCamera.id)" class="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none border mt-2" :class="isMirrored(selectedCamera.id) ? 'bg-teal-600/50 hover:bg-teal-600/70 text-teal-300 border-teal-500/50' : 'bg-slate-950 hover:bg-teal-600/30 text-teal-300 border-teal-500/30'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 17h8M4 12h16m-4-4l4 4-4 4M8 8l-4 4 4 4" /></svg>
                  Mirror Flip
                </button>
              </div>

              <!-- Preset Positions -->
              <div class="mt-6">
                <div class="flex items-center justify-between mb-2">
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <button @click="triggerPtz(selectedCamera.id, 'UP', 0.5)" class="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition-colors">Door</button>
                  <button @click="triggerPtz(selectedCamera.id, 'LEFT', 0.5)" class="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition-colors">Desk</button>
                  <button @click="triggerPtz(selectedCamera.id, 'RIGHT', 0.5)" class="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition-colors">Street</button>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-800">
              <button @click="activeRecordingCamera = selectedCamera" class="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                Open DVR Playback
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Share Link Modal with Time Restrictions and PTZ & Recording Permissions -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showShareModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
          <div class="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Generate Time-Restricted Share Link
            </h3>
            <button @click="showShareModal = false" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          
          <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">User / Recipient Label</label>
              <input v-model="shareLabel" type="text" placeholder="e.g. Guard Desk, Client View, Guest" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500">
            </div>

            <!-- Combined Streams Toggle -->
            <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-emerald-400 block">Combine into Single Stream</span>
                <span class="text-[10px] text-slate-400">Combine 2-9 cameras into a single grid RTSP link</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="shareIsCombined" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Select Allowed Cameras <span v-if="shareIsCombined" class="text-emerald-400">({{selectedCamerasForLink.length}} selected, max 9)</span></label>
              <div class="max-h-36 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                <label v-for="cam in cameras" :key="cam.id" class="flex items-center gap-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors" :class="{'opacity-50 pointer-events-none': shareIsCombined && selectedCamerasForLink.length >= 9 && !selectedCamerasForLink.includes(cam.id)}">
                  <input type="checkbox" :value="cam.id" v-model="selectedCamerasForLink" class="w-4 h-4 rounded border-slate-700 text-indigo-500 bg-slate-900 focus:ring-indigo-500">
                  <span class="text-sm font-medium text-slate-200">{{ cam.display_name || cam.name }}</span>
                  <span class="ml-auto text-[10px] text-slate-500 font-mono">{{ cam.camera_brand || 'IP CAM' }}</span>
                </label>
              </div>
            </div>

            <!-- Grid Visualizer for Combined Mode -->
            <div v-if="shareIsCombined && selectedCamerasForLink.length > 0" class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span class="text-xs font-bold text-slate-300 block">Layout Preview:</span>
              <div class="w-full max-w-[240px] mx-auto aspect-video bg-black rounded overflow-hidden border border-slate-700 grid gap-0.5 p-0.5" :style="getGridPreviewStyle()">
                <div v-for="(id, i) in getGridPreviewTiles()" :key="'tile-'+i" class="bg-slate-800 flex items-center justify-center relative border border-slate-700/50">
                  <span v-if="id" class="text-[9px] font-bold text-white text-center px-1 truncate w-full">{{ getCameraName(id) }}</span>
                  <span v-else class="text-[10px] text-slate-600 font-bold">BLANK</span>
                </div>
              </div>
            </div>

            <!-- Permission Rights Section -->
            <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span class="text-xs font-bold text-indigo-300 block">User Access Rights & Permissions:</span>
              
              <!-- PTZ Rights Toggle -->
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-semibold text-slate-200 block">Camera Movement (PTZ) Rights</span>
                  <span class="text-[10px] text-slate-400">Allow user to pan, tilt & zoom camera in given time</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="shareAllowPtz" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <!-- Recording Rights Toggle -->
              <div class="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                <div>
                  <span class="text-xs font-semibold text-slate-200 block">DVR Recording & Playback Rights</span>
                  <span class="text-[10px] text-slate-400">Allow user to view timeline recordings and extract clips</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="shareAllowRecording" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <!-- Audio Rights Toggle -->
              <div class="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                <div>
                  <span class="text-xs font-semibold text-slate-200 block">Live Voice / Audio Listen</span>
                  <span class="text-[10px] text-slate-400">Allow user to hear microphone/voice audio</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="shareAllowAudio" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>

            <!-- Daily Schedule Options -->
            <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span class="text-xs font-bold text-amber-300 block">Daily Schedule:</span>

              <!-- Daily Start & End (Optional) -->
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-400 mb-1">Daily Start (Opt)</label>
                  <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5">
                    <input v-model="shareStartHour" @blur="padTime('start', 'hour')" type="text" maxlength="2" placeholder="HH" class="w-7 bg-transparent text-center text-xs font-medium text-slate-200 focus:outline-none">
                    <span class="text-slate-500 font-bold">:</span>
                    <input v-model="shareStartMin" @blur="padTime('start', 'min')" type="text" maxlength="2" placeholder="MM" class="w-7 bg-transparent text-center text-xs font-medium text-slate-200 focus:outline-none">
                    <button type="button" @click="shareStartPeriod = shareStartPeriod === 'AM' ? 'PM' : 'AM'" class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" :class="shareStartPeriod === 'AM' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'">{{ shareStartPeriod }}</button>
                  </div>
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-400 mb-1">Daily End (Opt)</label>
                  <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5">
                    <input v-model="shareEndHour" @blur="padTime('end', 'hour')" type="text" maxlength="2" placeholder="HH" class="w-7 bg-transparent text-center text-xs font-medium text-slate-200 focus:outline-none">
                    <span class="text-slate-500 font-bold">:</span>
                    <input v-model="shareEndMin" @blur="padTime('end', 'min')" type="text" maxlength="2" placeholder="MM" class="w-7 bg-transparent text-center text-xs font-medium text-slate-200 focus:outline-none">
                    <button type="button" @click="shareEndPeriod = shareEndPeriod === 'AM' ? 'PM' : 'AM'" class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" :class="shareEndPeriod === 'AM' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'">{{ shareEndPeriod }}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Result Link Section -->
            <div v-if="generatedLinks && generatedLinks.length > 0" class="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Share RTSP Links Ready
                </span>
                <span v-if="generatedExpiresAt" class="text-[10px] text-amber-300 font-mono">Expires: {{ new Date(generatedExpiresAt).toLocaleTimeString() }}</span>
              </div>
              
              <div v-for="(link, idx) in generatedLinks" :key="idx" class="flex items-center gap-2 mt-2">
                <input :value="link" readonly class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none select-all" />
                <button @click="copyText(link, 'Share link copied!')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shrink-0">
                  Copy Link
                </button>
              </div>

              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <span :class="shareAllowPtz ? 'text-cyan-400' : 'text-slate-500'">• PTZ: {{ shareAllowPtz ? 'Allowed' : 'Disabled' }}</span>
                <span :class="shareAllowRecording ? 'text-emerald-400' : 'text-slate-500'">• Recording: {{ shareAllowRecording ? 'Allowed' : 'Disabled' }}</span>
                <span :class="shareAllowAudio ? 'text-indigo-400' : 'text-slate-500'">• Voice: {{ shareAllowAudio ? 'Allowed' : 'Disabled' }}</span>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-3">
            <button @click="showShareModal = false" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all">Close</button>
            <button @click="generateShareLink" :disabled="isGeneratingLink" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30">
              {{ isGeneratingLink ? 'Generating...' : 'Generate Share Link' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Remove Slot Confirmation Modal -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showRemoveSlotModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <transition enter-active-class="transition ease-out duration-300 transform" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="showRemoveSlotModal" class="bg-[#1e2330] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-500/30">
            <div class="px-6 py-5 border-b border-[#2e364a] bg-rose-500/10">
              <h3 class="text-lg font-bold text-rose-400 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Remove Camera
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <p class="text-sm text-slate-300">Are you sure you want to remove this camera from the view?</p>
              <p class="text-xs text-slate-500">The camera will remain in your sidebar and can be dragged back at any time.</p>
            </div>
            <div class="px-6 py-4 bg-[#1a1e2a] border-t border-[#2e364a] flex items-center justify-end gap-3">
              <button @click="showRemoveSlotModal = false" class="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">Cancel</button>
              <button @click="executeRemoveSlot" class="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-600/20">Remove</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showDeleteModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <transition enter-active-class="transition ease-out duration-300 transform" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="showDeleteModal" class="bg-[#1e2330] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-500/30">
            <div class="px-6 py-5 border-b border-[#2e364a] bg-rose-500/10">
              <h3 class="text-lg font-bold text-rose-400 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Delete Camera
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <p class="text-sm text-slate-300">Are you sure you want to completely remove <strong class="text-white">{{ cameraToDelete?.display_name || cameraToDelete?.name }}</strong>?</p>
              <p class="text-xs text-slate-500">This action cannot be undone. All configuration and routing for this camera will be permanently lost.</p>
            </div>
            <div class="px-6 py-4 bg-[#1a1e2a] border-t border-[#2e364a] flex items-center justify-end gap-3">
              <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">Cancel</button>
              <button @click="executeDeleteCamera" class="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-600/20">Yes, Delete Camera</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Add Camera Modal -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showAddCameraModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <transition enter-active-class="transition ease-out duration-300 transform" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="showAddCameraModal" class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl relative overflow-hidden">
            
            <div class="flex flex-col gap-6 relative z-10 p-8">
              <div class="flex items-center justify-between mb-2 border-b border-slate-800 pb-4">
                <h3 class="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <div class="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  {{ showAddSuccessView ? 'Camera Connected' : 'Add New Camera' }}
                </h3>
                <button type="button" @click="resetAddCameraModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form v-if="!showAddSuccessView" @submit.prevent="addCamera" class="flex flex-col gap-5">
                <!-- Brand Presets One-Click Buttons -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1.5">Quick Brand Preset Autofill:</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button type="button" @click="applyCameraPreset('dahua')" class="p-2.5 bg-slate-950 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all group">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span class="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Dahua Preset</span>
                      </div>
                      <span class="text-[10px] text-slate-500 font-mono block mt-0.5">192.168.18.101 (Sub: 1)</span>
                    </button>

                    <button type="button" @click="applyCameraPreset('ezviz')" class="p-2.5 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="text-xs font-bold text-slate-200 group-hover:text-emerald-300">EZVIZ Preset</span>
                      </div>
                      <span class="text-[10px] text-slate-500 font-mono block mt-0.5">192.168.18.102 (Ch: 102)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Camera Name (No Spaces)</label>
                  <input v-model="newCameraName" type="text" placeholder="e.g. dahua_cam or ezviz_cam" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-500">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Local RTSP URL</label>
                  <input v-model="newCameraUrl" type="text" placeholder="rtsp://user:pass@ip:port/path" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500 font-mono text-xs text-slate-200">
                </div>

                <div class="flex items-center gap-3 mt-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="generatePublicLink" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                  <span class="text-sm font-medium text-slate-300">Generate External / Public RTSP Details</span>
                </div>

                <div class="flex justify-end mt-4">
                  <button type="submit" :disabled="isAddingCamera" class="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="!isAddingCamera" class="flex items-center justify-center gap-2">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Connect & Add Camera
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                      Validating...
                    </span>
                  </button>
                </div>
                
                <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                  <div v-if="addCameraError" class="p-4 mt-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
                    <div class="p-2 bg-rose-500/20 rounded-full">
                      <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p class="text-sm text-rose-200 font-medium">{{ addCameraError }}</p>
                  </div>
                </transition>
              </form>

              <div v-else class="flex flex-col gap-5">
                <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                  <div class="p-1.5 bg-emerald-500/20 rounded-full mt-0.5">
                    <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 class="text-emerald-400 font-semibold text-sm">Camera added and verified!</h4>
                    <p class="text-emerald-200/70 text-xs mt-1">Configure your external routing below to generate the public RTSP link for the Institute.</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Public IP Address</label>
                    <input v-model="newCameraPublicIp" type="text" placeholder="e.g. 203.0.113.5" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-600">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">External Port</label>
                    <input v-model="newCameraExternalPort" type="number" placeholder="8554" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-600">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Proxy Username</label>
                    <input v-model="newCameraProxyUser" type="text" placeholder="admin" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-600">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Proxy Password</label>
                    <input v-model="newCameraProxyPass" type="password" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-600">
                  </div>
                </div>

                <div class="mt-2">
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Generated Institute Link</label>
                  <div class="flex items-stretch rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <div class="flex-1 px-4 py-3 font-mono text-xs text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-700">
                      rtsp://{{ newCameraProxyUser ? newCameraProxyUser + ':' : '' }}{{ newCameraProxyPass ? newCameraProxyPass + '@' : '' }}{{ newCameraPublicIp || '[PUBLIC_IP]' }}:{{ newCameraExternalPort || 8554 }}/{{ newCameraName }}
                    </div>
                    <button @click="async () => { const url = `rtsp://${newCameraProxyUser ? newCameraProxyUser + ':' : ''}${newCameraProxyPass ? newCameraProxyPass + '@' : ''}${newCameraPublicIp || '[PUBLIC_IP]'}:${newCameraExternalPort || 8554}/${newCameraName}`; await navigator.clipboard.writeText(url); showToast('Link copied to clipboard!'); }" class="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 px-4 transition-colors font-semibold text-xs border-l border-slate-700 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                      Copy
                    </button>
                  </div>
                </div>

                 <div class="flex justify-end mt-4">
                  <button type="button" @click="resetAddCameraModal()" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-700">
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- VLC 4G / External RTSP Info Modal -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showVlcModal" class="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" @click.self="showVlcModal = false">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <!-- Header -->
          <div class="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <svg class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-100">VLC (4G) & Central Video Wall URLs</h3>
                <p class="text-xs text-slate-400">Exact working RTSP streams for 4G mobile testing and external monitoring</p>
              </div>
            </div>
            <button @click="showVlcModal = false" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            <!-- Quick Summary Card -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span class="text-[10px] text-slate-500 block">Public IP</span>
                <span class="text-xs font-mono font-bold text-cyan-300">202.163.103.241</span>
              </div>
              <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span class="text-[10px] text-slate-500 block">Dahua RTSP Port</span>
                <span class="text-xs font-mono font-bold text-emerald-300">8554 (Internal 554)</span>
              </div>
              <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span class="text-[10px] text-slate-500 block">EZVIZ RTSP Port</span>
                <span class="text-xs font-mono font-bold text-amber-300">8555 (Internal 554)</span>
              </div>
            </div>

            <!-- Stream 1: Dahua Camera -->
            <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">DAHUA</span>
                  <span class="text-xs font-semibold text-slate-200">Dahua Stream (Sub-Stream / 4G)</span>
                </div>
                <button @click="copyText('rtsp://admin:admin123@202.163.103.241:8554/cam/realmonitor?channel=1&subtype=1', 'Dahua 4G RTSP URL Copied!')" class="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 rounded-lg text-xs font-bold transition-all border border-cyan-500/30 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy URL
                </button>
              </div>
              <code class="block text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all">
                rtsp://admin:admin123@202.163.103.241:8554/cam/realmonitor?channel=1&subtype=1
              </code>
            </div>

            <!-- Stream 2: EZVIZ Camera -->
            <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">EZVIZ</span>
                  <span class="text-xs font-semibold text-slate-200">EZVIZ Stream (Sub-Stream / 4G)</span>
                </div>
                <button @click="copyText('rtsp://admin:Khan1234%23@202.163.103.241:8555/Streaming/Channels/102', 'EZVIZ 4G RTSP URL Copied!')" class="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy URL
                </button>
              </div>
              <code class="block text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all">
                rtsp://admin:Khan1234%23@202.163.103.241:8555/Streaming/Channels/102
              </code>
            </div>

            <!-- Testing Instructions in VLC -->
            <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 class="text-xs font-bold text-slate-200 flex items-center gap-2">
                <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Mobile 4G VLC Testing Guide
              </h4>
              <ol class="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Turn off Wi-Fi on your smartphone and connect to <strong>Mobile Data (4G)</strong>.</li>
                <li>Open <strong>VLC App</strong> ➔ Tap <strong>More / Streams</strong> ➔ <strong>New Stream</strong>.</li>
                <li>Paste the copied RTSP URL above and hit <strong>Play</strong>.</li>
              </ol>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-end">
            <button @click="showVlcModal = false" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all">
              Close
            </button>
          </div>

        </div>
      </div>
    </transition>

    <CameraSettingsModal :show="!!activeSettingsCamera" :camera="activeSettingsCamera" @close="activeSettingsCamera = null" />
    <CameraRecordingModal :show="!!activeRecordingCamera" :camera="activeRecordingCamera" @close="activeRecordingCamera = null" />
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import CameraSettingsModal from '~/components/CameraSettingsModal.vue'
import CameraRecordingModal from '~/components/CameraRecordingModal.vue'

const router = useRouter()
const route = useRoute()

// Camera List & Selections (Declared first to avoid TDZ error)
const cameras = ref([])
  const isGo2RtcReady = ref(false)
const activeShares = ref([])
const userSessions = ref([])
const continuousArchives = ref([])
const selectedCameraIds = ref([])
const selectedCamerasForShare = ref([])
const selectedCamerasForLink = ref([])
const cameraSearch = ref('')
const selectedCamera = ref(null)

// UI and Navigation State (Flussonic Watcher Standard)
const viewMode = ref(route?.query?.view === 'cards' ? 'cards' : 'mosaic') // Default to 'mosaic' (Flussonic Screenshot 2)
const cameraFilter = ref(route?.query?.filter === 'favorites' ? 'favorites' : 'all')
const mosaicLayout = ref('2x2')
const favorites = ref([])

// Flussonic Watcher Category Trees & DVR State
const showDvrBottomDeck = ref(true)
const dvrIsPlaying = ref(true)
const dvrSelectedDate = ref(new Date().toISOString().split('T')[0])
const groupOnlineOpen = ref(true)
const groupOfflineOpen = ref(true)

// 4 Mosaic Slots (Screenshot 2: Slot 0 = live, Slot 1 = empty drop target, Slot 2 = live, Slot 3 = empty)
const mosaicSlots = ref([null, null])

const assignToSlot = (cam) => {
  if (!cam) return
  // Find first empty slot, or replace slot 1
  const emptyIdx = mosaicSlots.value.findIndex(s => s === null)
  if (emptyIdx !== -1) {
    mosaicSlots.value[emptyIdx] = cam
    showToast(`Assigned ${cam.display_name || cam.name} to Slot ${emptyIdx + 1}`)
  } else {
    mosaicSlots.value[1] = cam
    showToast(`Assigned ${cam.display_name || cam.name} to Slot 2`)
  }
}

const assignFirstAvailable = (slotIdx) => {
  const availableCam = cameras.value.find(c => !mosaicSlots.value.includes(c)) || cameras.value[0]
  if (availableCam) {
    mosaicSlots.value[slotIdx] = availableCam
    showToast(`Placed ${availableCam.display_name || availableCam.name} in Slot ${slotIdx + 1}`)
  }
}

onMounted(() => {
  try {
    const savedFavs = localStorage.getItem('vms_favorites')
    if (savedFavs) favorites.value = JSON.parse(savedFavs)
  } catch(e) {}
})

watch(cameras, (newCams) => {
  if (newCams && newCams.length > 0 && !mosaicSlots.value[0]) {
    mosaicSlots.value[0] = newCams[0] || null
    mosaicSlots.value[1] = newCams[1] || newCams[0] || null
  }
}, { immediate: true })

const toggleFavorite = (id) => {
  if (favorites.value.includes(id)) {
    favorites.value = favorites.value.filter(f => f !== id)
    showToast('Removed from favorites')
  } else {
    favorites.value.push(id)
    showToast('Added to ★ Favorites')
  }
  try {
    localStorage.setItem('vms_favorites', JSON.stringify(favorites.value))
  } catch(e) {}
}

const showVlcModal = ref(false)
const showShareModal = ref(false)
const showAddCameraModal = ref(false)
const showAddSuccessView = ref(false)
const showCameraNames = ref(true)
const activeTab = ref('grid')
const activeSettingsCamera = ref(null)
const activeRecordingCamera = ref(null)
const showCameraMenu = ref(null)
const toastMessage = ref('')
const liveClock = ref('')
let clockInterval
let fetchCamerasInterval
const focusOverlayRef = ref(null)

const scrubValue = ref(100)
const scrubStartValue = ref(0)
const presets = ref([])
const newPresetName = ref('')


const onlineCameras = computed(() => filteredCameras.value.filter(c => isOnline(c)))
  const offlineCameras = computed(() => filteredCameras.value.filter(c => !isOnline(c)))

  const filteredCameras = computed(() => {
  return cameras.value.filter(cam => {
    // Search query filter
    const nameMatch = (cam.display_name || cam.name || '').toLowerCase().includes(cameraSearch.value.toLowerCase()) ||
                      (cam.camera_ip || '').includes(cameraSearch.value)
    if (!nameMatch) return false

    // Filter pill
    if (cameraFilter.value === 'favorites') return favorites.value.includes(cam.id)
    if (cameraFilter.value === 'online') return isOnline(cam)
    if (cameraFilter.value === 'dahua') return cam.camera_brand === 'Dahua' || cam.name.includes('dahua') || cam.name.includes('101')
    if (cameraFilter.value === 'ezviz') return cam.camera_brand === 'EZVIZ' || cam.name.includes('ezviz') || cam.name.includes('102')
    return true
  })
})


// Playback & Scrubber State
const isScrubbing = ref(false)
const isDragging = ref(false)
const scrubPercentage = ref(100)

// Modals & UI extras
const showSessionVideoModal = ref(false)
const sessionVideoSrc = ref('')
const showArchiveModal = ref(false)
const showRemoveSlotModal = ref(false)
const slotToRemove = ref(null)
const showDeleteModal = ref(false)
const cameraToDelete = ref(null)
const archiveVideoSrc = ref('')
const showEditNameModal = ref(false)
const editCameraId = ref(null)
const editCameraDisplayName = ref('')
const dvrSegments = ref([])
const gridContainer = ref(null)
const isFullscreen = ref(false)
const notifications = ref([])

// Add Camera Form State
const newCameraName = ref('')
const newCameraDisplayName = ref('')
const newCameraUrl = ref('')
const newCameraIp = ref('')
const newCameraPort = ref('')
const newCameraUsername = ref('')
const newCameraPassword = ref('')
const newCameraBrand = ref('Dahua')
const newCameraStreamType = ref('sub')
const newCameraProtocol = ref('onvif')
const newCameraPublicIp = ref('')
const newCameraExternalPort = ref('')
const newCameraProxyUser = ref('')
const newCameraProxyPass = ref('')
const generatePublicLink = ref(false)
const generatedPublicUrl = ref('')
const isAddingCamera = ref(false)
const addCameraError = ref('')
const isTestingConnection = ref(false)
const testConnectionResult = ref('')
const newCameraForwardedPort = ref('')

// Digital Zoom & ePTZ State
const cameraZoom = ref({})
const cameraPan = ref({})

const getCamZoom = (id) => cameraZoom.value[id] || 1.0
const getCamPanX = (id) => cameraPan.value[id]?.x || 0
const getCamPanY = (id) => cameraPan.value[id]?.y || 0

const zoomInCam = (id) => {
  const cur = getCamZoom(id)
  const next = Math.min(4.0, Math.round((cur + 0.35) * 100) / 100)
  cameraZoom.value = { ...cameraZoom.value, [id]: next }
  showToast(`Digital Zoom: ${next}x`)
}

const zoomOutCam = (id) => {
  const cur = getCamZoom(id)
  const next = Math.max(1.0, Math.round((cur - 0.35) * 100) / 100)
  cameraZoom.value = { ...cameraZoom.value, [id]: next }
  if (next === 1.0) {
    cameraPan.value = { ...cameraPan.value, [id]: { x: 0, y: 0 } }
  }
  showToast(`Digital Zoom: ${next}x`)
}

const resetZoomCam = (id) => {
  cameraZoom.value = { ...cameraZoom.value, [id]: 1.0 }
  cameraPan.value = { ...cameraPan.value, [id]: { x: 0, y: 0 } }
  showToast('Zoom reset to 1.0x')
}

const panCam = (id, dir) => {
  const curPan = cameraPan.value[id] || { x: 0, y: 0 }
  const step = 40
  const nextPan = { ...curPan }
  if (dir === 'LEFT') nextPan.x += step
  if (dir === 'RIGHT') nextPan.x -= step
  if (dir === 'UP') nextPan.y += step
  if (dir === 'DOWN') nextPan.y -= step
  cameraPan.value = { ...cameraPan.value, [id]: nextPan }
}

// Share Modal State
const shareIsCombined = ref(false)
const shareLabel = ref('')
const sharePublicIp = ref('')
const shareStartHour = ref('')
const shareStartMin = ref('')
const shareStartPeriod = ref('AM')
const shareEndHour = ref('')
const shareEndMin = ref('')
const shareEndPeriod = ref('PM')
const shareAllowPtz = ref(true)
const shareAllowRecording = ref(true)
const shareAllowAudio = ref(true)
const shareExpiryHours = ref('4')
const generatedViewerUrl = ref('')
const generatedExpiresAt = ref('')
const generatedLinks = ref([])
const generatedUserLabel = ref('')
const dailyStartTime = ref('')
const dailyEndTime = ref('')
const disablePtz = ref(false)
const isGeneratingLink = ref(false)

// Combined Stream Helpers
const getGridPreviewStyle = () => {
  const n = selectedCamerasForLink.value.length;
  if (n === 0) return 'grid-template-columns: 1fr;';
  if (n <= 2) return 'grid-template-columns: repeat(2, 1fr);';
  if (n <= 4) return 'grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);';
  if (n <= 6) return 'grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr);';
  return 'grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);';
};

const getGridPreviewTiles = () => {
  const n = selectedCamerasForLink.value.length;
  let totalTiles = 1;
  if (n === 2) totalTiles = 2;
  else if (n > 2 && n <= 4) totalTiles = 4;
  else if (n > 4 && n <= 6) totalTiles = 6;
  else if (n > 6 && n <= 9) totalTiles = 9;
  
  const tiles = [];
  for (let i = 0; i < totalTiles; i++) {
    tiles.push(selectedCamerasForLink.value[i] || null);
  }
  return tiles;
};

const getCameraName = (id) => {
  const cam = cameras.value.find(c => c.id === id);
  return cam ? (cam.display_name || cam.name) : 'Unknown';
};



const padTime = (type, field) => {
  if (type === 'start') {
    if (field === 'hour' && shareStartHour.value) shareStartHour.value = shareStartHour.value.padStart(2, '0');
    if (field === 'min' && shareStartMin.value) shareStartMin.value = shareStartMin.value.padStart(2, '0');
  } else {
    if (field === 'hour' && shareEndHour.value) shareEndHour.value = shareEndHour.value.padStart(2, '0');
    if (field === 'min' && shareEndMin.value) shareEndMin.value = shareEndMin.value.padStart(2, '0');
  }
}

const shareDailyStart = computed(() => {
  if (!shareStartHour.value || !shareStartMin.value) return '';
  let h = parseInt(shareStartHour.value);
  if (shareStartPeriod.value === 'PM' && h < 12) h += 12;
  if (shareStartPeriod.value === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${shareStartMin.value}`;
});

const shareDailyEnd = computed(() => {
  if (!shareEndHour.value || !shareEndMin.value) return '';
  let h = parseInt(shareEndHour.value);
  if (shareEndPeriod.value === 'PM' && h < 12) h += 12;
  if (shareEndPeriod.value === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${shareEndMin.value}`;
});

const updateClock = () => {
  const formatter = new Intl.DateTimeFormat('en-US', { 
    timeZone: 'Asia/Karachi', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  });
  const currentTime = formatter.format(new Date());
  liveClock.value = currentTime;
  
  if (cameras.value) {
    cameras.value.forEach(cam => {
      if (isOnline(cam)) {
        cam.displayTime = currentTime;
      } else if (!cam.displayTime) {
        cam.displayTime = currentTime;
      }
    });
  }
}

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

// Live Voice / Audio State Management (Per-camera Voice Toggle)
const cameraAudio = ref({})

const isAudioOn = (cam) => {
  if (!cam) return false
  return !!cameraAudio.value[cam.id]
}

const toggleCameraAudio = (cam) => {
    if (!cam) return
    const current = !!cameraAudio.value[cam.id]
    const nextState = !current
    cameraAudio.value = { ...cameraAudio.value, [cam.id]: nextState }
    
    // Post message to the iframe to mute/unmute
    const iframe = document.getElementById('iframe-' + cam.id)
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(nextState ? 'unmute' : 'mute', '*')
    }

    if (nextState) {
      showToast(`🎙️ Voice ON for ${cam.display_name || cam.name}`)
    } else {
      showToast(`🔇 Voice Muted for ${cam.display_name || cam.name}`)
    }
  }


  
  const setStreamSrc = (el, url) => {
    if (!el || !url) return;
    // Vue might call this multiple times, avoid setting if unchanged
    if (el._currentSrc === url) return;
    el._currentSrc = url;
    
    // Fix property shadowing in Web Components
    if (Object.prototype.hasOwnProperty.call(el, 'src')) {
      delete el.src;
    }
    el.src = url;
  }

  
  const getWsUrlPath = (cam, quality = 'sub') => {
    if (!cam) return '';
    let baseName = cam.name || 'dahua_cam';
    if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '');
    return quality === 'sub' ? `${baseName}_sub` : baseName;
  }

  const getWsUrl = (cam, quality = 'sub') => {
    if (!cam) return '';
    const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
    let baseName = cam.name || 'dahua_cam';
    if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '');
    const src = quality === 'sub' ? `${baseName}_sub` : baseName;
    return `ws://${host}:1984/api/ws?src=${encodeURIComponent(src)}`;
  }

  const getStreamPlayerUrl = (cam, quality = 'sub') => {
  if (!cam) return '';
  const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
  let baseName = cam.name || 'dahua_cam';
  if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '');
  const src = quality === 'sub' ? `${baseName}_sub` : baseName;
  const audioParam = isAudioOn(cam) ? '&media=video,audio' : '&media=video';
  return `http://${host}:1984/stream.html?src=${encodeURIComponent(src)}&mode=webrtc,mse${audioParam}`;
}

const openCameraAudio = (cam) => {
  if (!cam) return;
  const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
  let baseName = cam.name || 'dahua_cam';
  if (baseName.endsWith('_sub')) baseName = baseName.replace(/_sub$/, '');
  const url = `http://${host}:1984/stream.html?src=${encodeURIComponent(baseName)}&media=video,audio`;
  window.open(url, '_blank', 'width=800,height=500');
  showToast(`Voice stream opened for ${cam.display_name || cam.name}`);
}


const copyText = async (text, msg = 'Copied to clipboard!') => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg);
  } catch (e) {
    prompt('Copy this URL:', text);
  }
}

const getCameraIp = (cam) => {
  if (cam.rtsp_url) {
    const match = cam.rtsp_url.match(/@([^:/]+)/);
    if (match) return match[1];
  }
  return cam.public_ip || '192.168.18.x';
}

const copyCameraRtsp = (cam, type = 'local') => {
  if (type === 'local') {
    const url = cam.sub_stream_url || cam.rtsp_url;
    copyText(url, `${cam.display_name || cam.name} Local RTSP Copied!`);
  } else {
    // 4G Public RTSP URL
    const isDahua = cam.camera_brand === 'Dahua' || cam.name.includes('dahua') || cam.name.includes('cam1');
    const port = cam.forwarded_port || (isDahua ? 8554 : 8555);
    const pubIp = cam.public_ip || '202.163.103.241';
    let url = '';
    if (isDahua) {
      url = `rtsp://${cam.username || 'admin'}:${cam.password || 'admin123'}@${pubIp}:${port}/cam/realmonitor?channel=1&subtype=1`;
    } else {
      url = `rtsp://${cam.username || 'admin'}:${cam.password ? encodeURIComponent(cam.password) : 'Khan1234%23'}@${pubIp}:${port}/Streaming/Channels/102`;
    }
    copyText(url, `${cam.display_name || cam.name} 4G Public RTSP Copied!`);
  }
}

const applyCameraPreset = (brand) => {
  if (brand === 'dahua') {
    newCameraName.value = 'dahua_cam';
    newCameraDisplayName.value = 'Dahua Camera (Switch 101)';
    newCameraBrand.value = 'Dahua';
    newCameraIp.value = '192.168.50.101';
    newCameraPort.value = '554';
    newCameraUsername.value = 'admin';
    newCameraPassword.value = 'admin123';
    newCameraUrl.value = 'rtsp://admin:admin123@192.168.50.101:554/cam/realmonitor?channel=1&subtype=1#video=copy#audio=copy';
    newCameraPublicIp.value = '202.163.103.241';
    newCameraExternalPort.value = 8554;
    showToast('Dahua Switch preset loaded!');
  } else if (brand === 'ezviz') {
    newCameraName.value = 'ezviz_cam';
    newCameraDisplayName.value = 'EZVIZ Camera (Switch 102)';
    newCameraBrand.value = 'EZVIZ';
    newCameraIp.value = '192.168.50.102';
    newCameraPort.value = '554';
    newCameraUsername.value = 'admin';
    newCameraPassword.value = 'Khan1234#';
    newCameraUrl.value = 'rtsp://admin:Khan1234%23@192.168.50.102:554/Streaming/Channels/102#video=copy#audio=copy';
    newCameraPublicIp.value = '202.163.103.241';
    newCameraExternalPort.value = 8555;
    showToast('EZVIZ Switch preset loaded (Voice Enabled)!');
  }
}

const resetAddCameraModal = () => {
  showAddCameraModal.value = false;
  showAddSuccessView.value = false;
  newCameraName.value = '';
  newCameraDisplayName.value = '';
  newCameraUrl.value = '';
  addCameraError.value = '';
  isAddingCamera.value = false;
}

const addCamera = async () => {
  isAddingCamera.value = true;
  addCameraError.value = '';
  try {
    const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
    const baseName = (newCameraName.value || 'custom_cam').trim().replace(/_sub$/, '');
    
    // Register stream with go2rtc engine directly
    await fetch(`http://${host}:1984/api/streams?name=${baseName}&src=${encodeURIComponent(newCameraUrl.value)}`, { method: 'PUT' });
    await fetch(`http://${host}:1984/api/streams?name=${baseName}_sub&src=${encodeURIComponent(newCameraUrl.value)}`, { method: 'PUT' });
    
    // Also save to backend database
    try {
      await $fetch('/api/admin/cameras', {
        method: 'POST',
        body: {
          name: baseName,
          display_name: newCameraDisplayName.value || baseName,
          rtsp_url: newCameraUrl.value,
          sub_stream_url: newCameraUrl.value,
          camera_brand: newCameraBrand.value || 'RTSP',
          public_ip: newCameraPublicIp.value || '202.163.103.241',
          forwarded_port: parseInt(newCameraExternalPort.value) || 8554,
          username: newCameraUsername.value || 'admin',
          password: newCameraPassword.value || ''
        }
      });
    } catch(dbErr) {
      console.warn('Backend DB sync skipped:', dbErr);
    }
    
    showToast('Camera added successfully!');
    await fetchCameras();
    showAddSuccessView.value = true;
  } catch(e) {
    addCameraError.value = e.message || 'Failed to connect camera';
  } finally {
    isAddingCamera.value = false;
  }
}

const openShareModal = () => {
  shareLabel.value = ''
  sharePublicIp.value = ''
  shareStartHour.value = ''
  shareStartMin.value = ''
  shareStartPeriod.value = 'AM'
  shareEndHour.value = ''
  shareEndMin.value = ''
  shareEndPeriod.value = 'PM'
  shareAllowPtz.value = true
  shareAllowRecording.value = true
  shareAllowAudio.value = true
  shareExpiryHours.value = '4'
  generatedViewerUrl.value = ''
  generatedExpiresAt.value = ''
  generatedLinks.value = []
  selectedCamerasForLink.value = [...selectedCameraIds.value]
  showShareModal.value = true
}

const triggerPtz = async (id, cmd, speed = 0.5) => {
  const cam = cameras.value.find(c => c.id === id) || selectedCamera.value;
  const isDahua = cam?.camera_brand === 'Dahua' || cam?.name?.includes('dahua') || cam?.name?.includes('101');

  // 1. Digital Zoom In / Out handling for all cameras (Dahua & EZVIZ)
  if (cmd === 'ZOOM_IN') {
    zoomInCam(id);
  } else if (cmd === 'ZOOM_OUT') {
    zoomOutCam(id);
  }

  // 2. Digital Pan / Tilt handling for Dahua (or when zoomed in)
  if (isDahua && ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(cmd)) {
    panCam(id, cmd);
    showToast(`Dahua Pan ${cmd}`);
  }

  // 3. Dispatch hardware command to backend / local agent (drives EZVIZ motor & sends Dahua CGI)
  try {
    await $fetch('/api/camera/ptz', {
      method: 'POST',
      body: { cameraId: id, command: cmd, speed: speed }
    });
    if (cmd !== 'STOP' && cmd !== 'ZOOM_IN' && cmd !== 'ZOOM_OUT') {
      setTimeout(async () => {
        await $fetch('/api/camera/ptz', { method: 'POST', body: { cameraId: id, command: 'STOP', speed: 0 } }).catch(() => {});
      }, 600);
    }
  } catch(e) {
    console.error('PTZ Error:', e);
  }
}


const generateShareLink = async () => {
  if (selectedCamerasForLink.value.length === 0) {
    alert('Please select at least one camera first.')
    return
  }
  isGeneratingLink.value = true
  try {
    const res = await $fetch('/api/admin/generate-link', {
      method: 'POST',
      body: {
        userLabel: shareLabel.value || 'Viewer',
        cameraIds: selectedCamerasForLink.value,
        dailyLimitMinutes: 0,
        daily_start_time: shareDailyStart.value || null,
        daily_end_time: shareDailyEnd.value || null,
        allow_ptz: shareAllowPtz.value,
        allow_recording: shareAllowRecording.value,
        allow_audio: shareAllowAudio.value,
        public_ip: sharePublicIp.value || null,
        is_combined: shareIsCombined.value
      }
    })
    
    if (res.success) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      generatedViewerUrl.value = `${origin}/viewer/${res.token}`;
      generatedExpiresAt.value = res.expires_at || null;
      generatedLinks.value = res.rtspLinks || [];
      showToast('Time-restricted Share Link Generated!');
    } else {
      alert(res.error || 'Failed to generate link')
    }
  } catch(e) {
    alert('Network error while generating link')
  } finally {
    isGeneratingLink.value = false
  }
}

const invertedCameras = ref({})
const mirroredCameras = ref({})

const isInverted = (camId) => {
  return invertedCameras.value[camId] || false
}
const isMirrored = (camId) => {
  return mirroredCameras.value[camId] || false
}

const needsCssFlip = (cam) => {
  if (!cam) return false
  return !!invertedCameras.value[cam.id] && cam.camera_brand !== 'Dahua'
}

const needsCssMirror = (cam) => {
  if (!cam) return false
  return !!mirroredCameras.value[cam.id] && cam.camera_brand !== 'Dahua'
}

const toggleInvert = async (camId) => {
  if (!camId) return
  const isNowInverted = !invertedCameras.value[camId]
  invertedCameras.value[camId] = isNowInverted
  localStorage.setItem('invertedCameras', JSON.stringify(invertedCameras.value))
  
  try {
    await $fetch('/api/camera/ptz', {
      method: 'POST',
      body: { 
        cameraId: camId, 
        command: 'SET_FLIP_MIRROR', 
        speed: 0.5, 
        flip: isNowInverted, 
        mirror: !!mirroredCameras.value[camId] 
      }
    })
    // Force iframe reload to drop buffered frames and fetch flipped stream faster
    setTimeout(() => {
      reloadKeys.value[camId] = (reloadKeys.value[camId] || 0) + 1
      delete streamSnapshots.value[camId]
    }, 800)
  } catch (e) {
    console.error('Failed to flip hardware view', e)
  }
}

const toggleMirror = async (camId) => {
  if (!camId) return
  const isNowMirrored = !mirroredCameras.value[camId]
  mirroredCameras.value[camId] = isNowMirrored
  localStorage.setItem('mirroredCameras', JSON.stringify(mirroredCameras.value))
  
  try {
    await $fetch('/api/camera/ptz', {
      method: 'POST',
      body: { 
        cameraId: camId, 
        command: 'SET_FLIP_MIRROR', 
        speed: 0.5, 
        flip: !!invertedCameras.value[camId], 
        mirror: isNowMirrored 
      }
    })
    setTimeout(() => {
      reloadKeys.value[camId] = (reloadKeys.value[camId] || 0) + 1
      delete streamSnapshots.value[camId]
    }, 800)
  } catch (e) {
    console.error('Failed to mirror hardware view', e)
  }
}

const simulatedPlaybackTime = computed(() => {
  if (scrubPercentage.value >= 99) return 'LIVE'
  const totalMinutes = Math.floor((scrubPercentage.value / 100) * 1440)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
})

const simulatedPlaybackDate = computed(() => {
  const d = new Date()
  const dateStr = d.toISOString().split('T')[0]
  return `${dateStr} ${simulatedPlaybackTime.value}`
})

const startScrub = (e) => {
  isDragging.value = true
  isScrubbing.value = true
  onScrub(e)
}

const onScrub = (e) => {
  if (!isDragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  let x = e.clientX - rect.left
  if (x < 0) x = 0
  if (x > rect.width) x = rect.width
  scrubPercentage.value = (x / rect.width) * 100
}

const endScrub = () => {
  isDragging.value = false
}

const resetToLive = () => {
  scrubPercentage.value = 100
  isScrubbing.value = false
}

const toggleOverlayFullscreen = () => {
  if (!document.fullscreenElement) {
    if (focusOverlayRef.value?.requestFullscreen) {
      focusOverlayRef.value.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const toggleCameraSelection = (camId) => {
  const idx = selectedCameraIds.value.indexOf(camId)
  if (idx > -1) {
    selectedCameraIds.value.splice(idx, 1)
  } else {
    selectedCameraIds.value.push(camId)
  }
}

const toggleAllCameras = () => {
  if (selectedCameraIds.value.length === cameras.value.length) {
    selectedCameraIds.value = []
  } else {
    selectedCameraIds.value = cameras.value.map(c => c.id)
  }
}

const filteredSidebarCameras = computed(() => {
  if (!cameraSearch.value) return cameras.value
  return cameras.value.filter(c => (c.display_name || c.name).toLowerCase().includes(cameraSearch.value.toLowerCase()))
})

const visibleGridCameras = computed(() => {
  return cameras.value.filter(c => selectedCameraIds.value.includes(c.id)).slice(0, 4)
})

// Watch for initial camera load to select all by default
watch(cameras, (newCams) => {
  if (newCams && newCams.length > 0 && selectedCameraIds.value.length === 0) {
    selectedCameraIds.value = newCams.map(c => c.id)
  }
}, { immediate: true })

const reloadKeys = ref({})

const isOnline = (cam) => {
  if (!cam) return false
  if (!cam.last_seen) return true
  return (Date.now() - new Date(cam.last_seen).getTime()) < 20000
}

const fetchPresets = async (cameraId) => {
  try {
    const res = await $fetch(`/api/camera/${cameraId}/presets`)
    if (res.success) presets.value = res.presets
  } catch(e) {}
}

const savePreset = async () => {
  if (!newPresetName.value || !selectedCamera.value) return
  try {
    await $fetch(`/api/camera/${selectedCamera.value.id}/presets`, {
      method: 'POST',
      body: { action: 'set', presetName: newPresetName.value }
    })
    newPresetName.value = ''
    await fetchPresets(selectedCamera.value.id)
  } catch(e) {}
}

const gotoPreset = async (token) => {
  if (!selectedCamera.value) return
  try {
    await $fetch(`/api/camera/${selectedCamera.value.id}/presets`, {
      method: 'POST',
      body: { action: 'goto', presetToken: token }
    })
  } catch(e) {}
}

const openPatrolConfig = () => {
  alert('Patrol config UI is under construction, but API is ready.')
}

const saveDayNight = async () => {
  if (!selectedCamera.value) return
  try {
    const res = await $fetch(`/api/admin/cameras/${selectedCamera.value.id}/daynight`, {
      method: 'PUT',
      body: { day_mode_start: selectedCamera.value.day_mode_start, night_mode_start: selectedCamera.value.night_mode_start }
    })
    if (res.success) alert('Day/Night schedule updated')
  } catch(e) {
    console.error(e)
  }
}

const downloadExport = () => {
  if (continuousArchives.value.length === 0) return
  // scrubStartValue is Left, scrubValue is Right
  const lVal = Math.min(scrubStartValue.value, scrubValue.value)
  const rVal = Math.max(scrubStartValue.value, scrubValue.value)
  
  const startIndex = Math.floor((lVal / 100) * (continuousArchives.value.length - 1))
  const endIndex = Math.floor((rVal / 100) * (continuousArchives.value.length - 1))
  
  // Array is sorted newest to oldest.
  // Left is older, right is newer on a standard timeline. But here 0 is oldest?
  // Let's assume startFile is at endIndex, endFile is at startIndex
  const startFile = continuousArchives.value[continuousArchives.value.length - 1 - lVal > 0 ? lVal : 0]
  const endFile = continuousArchives.value[continuousArchives.value.length - 1 - rVal > 0 ? rVal : 0]
  
  if (!startFile || !endFile) return

  // Using a simplified offset assuming start of first file to end of second file
  const startIso = new Date(startFile.timestamp - 3600000).toISOString()
  const endIso = new Date(endFile.timestamp).toISOString()

  window.open(`http://localhost:4000/api/dvr/extract?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}&camera=${encodeURIComponent(selectedCamera.value.name)}`, '_blank')
}

const fetchCameras = async () => {
  try {
    const res = await $fetch('/api/admin/cameras')
    if (res.success) {
      const oldCameras = cameras.value || []
      const newCameras = res.cameras.map(c => {
        try {
          return { ...c, capabilities: c.capabilities ? JSON.parse(c.capabilities) : null }
        } catch(e) {
          return { ...c, capabilities: null }
        }
      })

      newCameras.forEach(newCam => {
        const oldCam = oldCameras.find(old => old.id === newCam.id)
        if (oldCam && !isOnline(oldCam) && isOnline(newCam)) {
          // Camera came back online, increment reload key to force iframe remount
          reloadKeys.value[newCam.id] = (reloadKeys.value[newCam.id] || 0) + 1
          delete streamSnapshots.value[newCam.id]
        }
      })

      cameras.value = newCameras
    }
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

const fetchArchives = async (cameraName) => {
  try {
    const res = await $fetch(`http://localhost:4000/api/dvr/continuous?camera=${encodeURIComponent(cameraName)}`)
    if (res.success) continuousArchives.value = res.files
  } catch (e) {
    console.warn('Could not fetch archives from DVR API', e)
    continuousArchives.value = []
  }
}

const formatTime12h = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Karachi' 
  }).format(new Date(timestamp))
}

const ptzCommand = async (cameraId, command) => {
  try {
    await $fetch('/api/camera/ptz', {
      method: 'POST',
      body: { cameraId, command, speed: 0.5 }
    })
  } catch (err) {
    console.error('PTZ error', err)
  }
}


const testConnection = async () => {
  if (!newCameraPublicIp.value || !newCameraUsername.value || !newCameraPassword.value) {
    testConnectionResult.value = 'Please fill IP, Username, and Password first.'
    return
  }
  isTestingConnection.value = true
  testConnectionResult.value = ''
  try {
    const fport = newCameraForwardedPort.value || 554;
    const subtype = newCameraStreamType.value === 'sub' ? '1' : '0';
    let url = '';
    if (newCameraBrand.value === 'Dahua') {
      url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/cam/realmonitor?channel=1&subtype=${subtype}`;
    } else if (newCameraBrand.value === 'EZVIZ') {
      url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/Streaming/Channels/10${subtype === '0' ? '1' : '2'}`;
    } else {
      url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/`;
    }

    const res = await $fetch('/api/admin/cameras/verify', {
      method: 'POST',
      body: { rtsp_url: url }
    })
    testConnectionResult.value = res.success ? 'Connection Successful!' : 'Failed'
  } catch(e) {
    testConnectionResult.value = e.data?.error || 'Connection Failed / Timeout'
  } finally {
    isTestingConnection.value = false
  }
}

const copyTestUrl = () => {
  const fport = newCameraForwardedPort.value || 554;
  const subtype = newCameraStreamType.value === 'sub' ? '1' : '0';
  let url = '';
  if (newCameraBrand.value === 'Dahua') {
    url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/cam/realmonitor?channel=1&subtype=${subtype}`;
  } else if (newCameraBrand.value === 'EZVIZ') {
    url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/Streaming/Channels/10${subtype === '0' ? '1' : '2'}`;
  } else {
    url = `rtsp://${newCameraUsername.value}:${newCameraPassword.value}@${newCameraPublicIp.value}:${fport}/`;
  }
  navigator.clipboard.writeText(url)
  alert('URL copied to clipboard! Test it in VLC.')
}

const copyGeneratedLink = async () => {
  if (typeof generatedPublicUrl !== 'undefined' && generatedPublicUrl.value) {
    await navigator.clipboard.writeText(generatedPublicUrl.value)
    showToast('Link copied to clipboard!')
  }
}


const copyLinkString = async (str) => {
  if (str) {
    await navigator.clipboard.writeText(str)
    alert('Link copied to clipboard!')
  }
}

const openSessionVideo = (session) => {
  const start = session.startTime
  const end = session.endTime
  const camera = (session.cameraIds && session.cameraIds.length > 0) ? session.cameraIds[0] : 'dahua_cam'
  const camObj = cameras.value.find(c => c.id === camera) || cameras.value[0]
  const camName = camObj ? camObj.name : 'dahua_cam'

  sessionVideoSrc.value = `http://localhost:4000/api/dvr/extract?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&camera=${encodeURIComponent(camName)}`
  showSessionVideoModal.value = true
}

const closeSessionVideo = () => {
  showSessionVideoModal.value = false
  sessionVideoSrc.value = ''
}
const playArchive = (file) => {
  archiveVideoSrc.value = file.url
  showArchiveModal.value = true
}

const scrubTimeline = () => {
  if (continuousArchives.value.length === 0) return;
  const index = Math.floor((scrubValue.value / 100) * (continuousArchives.value.length - 1));
  const targetFile = continuousArchives.value[continuousArchives.value.length - 1 - index];
  if (targetFile) playArchive(targetFile);
}

const archivesStartLabel = computed(() => {
  if (continuousArchives.value.length === 0) return 'No Archives'
  return new Date(continuousArchives.value[continuousArchives.value.length - 1].timestamp).toLocaleString()
})
const archivesEndLabel = computed(() => {
  if (continuousArchives.value.length === 0) return 'No Archives'
  return new Date(continuousArchives.value[0].timestamp).toLocaleString()
})

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

const openCameraDetail = async (cam) => {
  selectedCamera.value = cam
  continuousArchives.value = []
  scrubValue.value = 100
  scrubStartValue.value = 0
  
  // Log camera access
  try {
    await $fetch('/api/notifications/log', {
      method: 'POST',
      body: {
        camera_name: cam.name,
        user_label: 'Admin',
        action: 'Stream Opened'
      }
    })
  } catch(e) { console.error('Failed to log access', e) }

  await fetchArchives(cam.name)
  await fetchDvrTimeline(cam.name)
  if (hasCapability('ptz')) {
    await fetchPresets(cam.id)
  }
}

const closeCameraDetail = () => {
  selectedCamera.value = null
  continuousArchives.value = []
}

const hasCapability = (serviceKey) => {
  return selectedCamera.value && selectedCamera.value.capabilities && selectedCamera.value.capabilities[serviceKey]
}


const extractVideo = async (notif) => {
  try {
    const res = await $fetch('http://localhost:4000/api/dvr/extract', {
      method: 'POST',
      body: {
        cameraId: 'all',
        start: notif.timestamp,
        end: new Date().toISOString(),
        userLabel: notif.user_label
      }
    })
    if(res.success) {
      alert(`DVR Extraction Complete:\n${res.downloadUrl}`)
    }
  } catch(e) {
    alert('Extraction failed. Is local-dvr.js running on port 4000?')
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

const confirmRemoveSlot = (slotIdx) => {
  slotToRemove.value = slotIdx
  showRemoveSlotModal.value = true
}

const executeRemoveSlot = () => {
  if (slotToRemove.value !== null) {
    mosaicSlots.value[slotToRemove.value] = null
    showRemoveSlotModal.value = false
    slotToRemove.value = null
  }
}

const confirmDeleteCamera = (cam) => {
  cameraToDelete.value = cam
  showDeleteModal.value = true
}

const executeDeleteCamera = async () => {
  if (!cameraToDelete.value) return
  try {
    const res = await $fetch(`/api/admin/cameras/${cameraToDelete.value.id}`, { method: 'DELETE' })
    if (res.success) {
      showToast('Camera deleted successfully.')
      showDeleteModal.value = false
      if (selectedCamera.value?.id === cameraToDelete.value.id) {
        closeCameraDetail()
      }
      cameraToDelete.value = null
      await fetchCameras()
    } else {
      alert(res.error || 'Failed to delete camera')
    }
  } catch(e) {
    console.error(e)
    alert('Failed to delete camera')
  }
}







const fetchDvrTimeline = async (camName = 'all') => {
  try {
    const res = await $fetch(`http://localhost:4000/api/dvr/continuous?cameraId=${camName}&date=today`)
    if (res.success) {
      dvrSegments.value = res.segments.map(seg => {
        const [sH, sM] = seg.start.split(':').map(Number)
        const [eH, eM] = seg.end.split(':').map(Number)
        const sPercent = ((sH * 60 + sM) / 1440) * 100
        const ePercent = ((eH * 60 + eM) / 1440) * 100
        return {
          left: sPercent + '%',
          width: (ePercent - sPercent) + '%'
        }
      })
    }
  } catch(e) {}
}

const fetchNotifications = async () => {
  try {
    const res = await $fetch('/api/admin/audit_logs')
    if (res.success) {
      notifications.value = res.logs
    }
  } catch(e) {}
}


const streamSnapshots = ref({})

const handleStreamMessage = (event) => {
  if (event.data && event.data.type === 'stream_error') {
    const { src, snapshot } = event.data;
    if (snapshot) {
      const cam = cameras.value.find(c => getWsUrlPath(c) === src || getWsUrlPath(c, 'main') === src);
      if (cam && !streamSnapshots.value[cam.id]) {
        streamSnapshots.value[cam.id] = snapshot;
        showToast(`Camera ${cam.name || cam.id} has stopped!`);
      }
    }
  } else if (event.data && event.data.type === 'stream_playing') {
    const { src } = event.data;
    const cam = cameras.value.find(c => getWsUrlPath(c) === src || getWsUrlPath(c, 'main') === src);
    if (cam) {
      if (streamSnapshots.value[cam.id]) {
        delete streamSnapshots.value[cam.id];
        showToast(`Camera ${cam.name || cam.id} has recovered!`);
      }
      cam.last_seen = new Date().toISOString();
    }
  }
}

onMounted(async () => {
  try {
    const savedInvert = localStorage.getItem('invertedCameras')
    if (savedInvert) invertedCameras.value = JSON.parse(savedInvert)
    const savedMirror = localStorage.getItem('mirroredCameras')
    if (savedMirror) mirroredCameras.value = JSON.parse(savedMirror)
  } catch(e) {}

  window.addEventListener('message', handleStreamMessage)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  fetchCamerasInterval = setInterval(fetchCameras, 5000)
  // Login page is bypassed, load data directly
  try {
    await Promise.all([fetchCameras(), fetchDvrTimeline()])
    
  } catch (e) {
    console.error('Failed to load dashboard data:', e)
  }
})

onUnmounted(() => {
  window.removeEventListener('message', handleStreamMessage)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (clockInterval) clearInterval(clockInterval)
  if (fetchCamerasInterval) clearInterval(fetchCamerasInterval)
})


const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    if (gridContainer.value?.requestFullscreen) {
      gridContainer.value.requestFullscreen()
      isFullscreen.value = true
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

const downloadSnapshot = () => {
  if (selectedCameraIds.value.length === 0) {
    alert("Please select a camera to snapshot")
    return
  }
  const camId = selectedCameraIds.value[0]
  const cam = cameras.value.find(c => c.id === camId)
  if (cam) {
    const a = document.createElement('a')
    a.href = `http://localhost:1984/api/frame.jpeg?src=${cam.name}`
    a.download = `snapshot_${cam.name}_${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

const extractVideoFromTimeline = () => {
  if (selectedCameraIds.value.length === 0) {
    alert("Please select a camera for extraction")
    return
  }
  // Base off the scrub percentage (which corresponds to simulatedPlaybackTime)
  const d = new Date()
  d.setHours(0,0,0,0)
  const totalMinutes = Math.floor((scrubPercentage.value / 100) * 1440)
  const startTimestamp = new Date(d.getTime() + totalMinutes * 60000).toISOString()
  const endTimestamp = new Date(d.getTime() + (totalMinutes + 5) * 60000).toISOString() // Extract 5 min window
  
  extractVideo({
    timestamp: startTimestamp,
    user_label: 'Timeline Export'
  })
}

</script>
