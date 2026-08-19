<template>
  <div class="min-h-screen bg-[#050B14] text-slate-200 font-sans p-4 md:p-8 selection:bg-indigo-500/30 relative overflow-hidden">
    <!-- Ambient Background Gradients -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-10 relative z-10">
      <!-- Header -->
      <header class="flex items-center justify-between bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-2xl shadow-xl">
        <div>
          <h1 class="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Flexnook Edge Gateway
          </h1>
          <p class="text-slate-400 mt-2 font-medium text-sm">Premium video access, DVR, and ONVIF session management.</p>
        </div>
      </header>

      <div class="space-y-8">
        
        <!-- Cameras Multi-Grid View Section -->
        <section class="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10">
            <h2 class="text-2xl font-bold flex items-center gap-3 text-slate-100 tracking-tight">
              <div class="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              Live Monitor (Multi-Grid)
            </h2>
            <span class="mt-3 sm:mt-0 text-xs font-medium text-indigo-300/80 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-inner">Click a camera for DVR & Settings</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10 relative z-10">
            <div v-for="cam in cameras" :key="cam.id" class="flex flex-col bg-slate-950/80 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-400/60 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group" @click="openCameraDetail(cam)">
              
              <!-- Camera Header -->
              <div class="p-4 bg-slate-900/90 border-b border-slate-800/80 flex justify-between items-center group-hover:bg-slate-800 transition-colors backdrop-blur-md">
                <div class="flex items-center gap-3">
                  <span class="relative flex h-3 w-3">
                    <span v-if="isOnline(cam)" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3" :class="isOnline(cam) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]'"></span>
                  </span>
                  <h3 class="font-bold text-sm text-slate-100 tracking-wide">{{ cam.display_name || cam.name }}</h3>
                  <span class="text-[9px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider" :class="isOnline(cam) ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' : 'text-rose-300 bg-rose-500/20 border border-rose-500/30'">{{ isOnline(cam) ? 'Online' : 'Offline' }}</span>
                  <span v-if="cam.public_ip" class="text-[9px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20" title="Public RTSP Stream">EXT: {{cam.public_ip}}:{{cam.forwarded_port || 554}}</span>
                </div>
                <button @click.stop="openEditNameModal(cam)" class="text-slate-400 hover:text-indigo-400 bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-md transition-all border border-transparent hover:border-indigo-500/30" title="Edit Display Name">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>

              <!-- Live View Iframe -->
              <div class="aspect-video bg-black relative pointer-events-none">
                <iframe :src="`http://localhost:1984/stream.html?src=${encodeURIComponent(cam.name + '_sub')}`" class="w-full h-full border-none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
            
            <div v-if="cameras.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
              <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span class="text-sm">No cameras configured.</span>
            </div>
          </div>

          <!-- Add Camera Form -->
          <form @submit.prevent="addCamera" class="flex flex-col gap-4 mt-4 pt-8 border-t border-slate-800/60 relative z-10">
            <h3 class="text-base font-bold text-slate-200 mb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Add New Camera
            </h3>
            
            <div class="flex flex-col md:flex-row gap-4">
              <input v-model="newCameraName" type="text" placeholder="Camera Proxy Name (e.g. cam_1)" required class="flex-1 bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-slate-200 placeholder-slate-500 shadow-inner">
              <input v-model="newCameraDisplayName" type="text" placeholder="Display Name (e.g. Lobby)" class="flex-1 bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner">
              <select v-model="newCameraProtocol" class="bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-slate-200 cursor-pointer shadow-inner">
                <option value="onvif">ONVIF (Recommended)</option>
                <option value="rtsp">Local RTSP (Raw)</option>
                <option value="public_rtsp">Public / Port-Forwarded Network</option>
              </select>
            </div>

            <!-- ONVIF Fields -->
            <div v-if="newCameraProtocol === 'onvif'" class="flex flex-col md:flex-row gap-4 p-5 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl">
              <input v-model="newCameraIp" type="text" placeholder="IP Address (e.g. 192.168.50.101)" required class="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner">
              <input v-model="newCameraPort" type="number" placeholder="Port (80)" class="w-full md:w-28 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner">
              <input v-model="newCameraUsername" type="text" placeholder="Username" required class="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner">
              <input v-model="newCameraPassword" type="password" placeholder="Password" required class="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner">
            </div>

            <!-- RTSP Field -->
            <div v-if="newCameraProtocol === 'rtsp'" class="flex flex-col md:flex-row gap-4 p-5 bg-slate-900/30 border border-slate-700/30 rounded-2xl">
              <input v-model="newCameraUrl" type="text" placeholder="rtsp://user:pass@ip:port/path" required class="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-500 shadow-inner font-mono text-xs">
            </div>

            <div class="flex justify-end mt-2">
              <button type="submit" :disabled="isAddingCamera" class="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0">
                <span v-if="!isAddingCamera" class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Connect & Add Camera
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                  Validating...
                </span>
              </button>
            </div>
            
            <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
              <div v-if="addCameraError" class="p-4 mt-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                <div class="p-2 bg-rose-500/20 rounded-full">
                  <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p class="text-sm text-rose-200 font-medium">{{ addCameraError }}</p>
              </div>
            </transition>
          </form>
        </section>

        <!-- Access Management & Audit Split -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Access Control -->
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Share Granular Access
            </h2>
            
            <div class="flex-1 space-y-5">
              <div>
                <label class="block text-sm text-slate-400 font-medium mb-2">Select Cameras</label>
                <div v-if="cameras.length > 0" class="flex flex-wrap gap-3">
                  <label v-for="cam in cameras" :key="cam.id" class="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 px-4 py-2 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                    <input type="checkbox" :value="cam.id" v-model="selectedCamerasForShare" class="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900">
                    <span class="text-sm text-slate-300">{{ cam.display_name || cam.name }}</span>
                  </label>
                </div>
                <div v-else class="text-sm text-slate-500 italic">No cameras available to share.</div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-slate-400 font-medium mb-2">Daily Start (Opt)</label>
                  <input v-model="dailyStartTime" type="time" step="60" class="w-full bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200">
                </div>
                <div>
                  <label class="block text-sm text-slate-400 font-medium mb-2">Daily End (Opt)</label>
                  <input v-model="dailyEndTime" type="time" step="60" class="w-full bg-slate-950/50 border border-slate-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200">
                </div>
              </div>

              <div>
                <label class="flex items-center gap-2 cursor-pointer bg-slate-950/30 p-3 rounded-lg border border-slate-800/30 w-fit">
                  <input type="checkbox" v-model="disablePtz" class="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900">
                  <span class="text-sm text-slate-300 font-medium">Disable PTZ Controls for this link</span>
                </label>
              </div>

              <button @click="generateLink" :disabled="selectedCamerasForShare.length === 0" class="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/20 mt-4">
                Generate Viewer Link
              </button>

              <div v-if="generatedLink" class="mt-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl flex items-center justify-between">
                <code class="text-xs text-cyan-300 break-all">{{ generatedLink }}</code>
                <button @click="copyLink" class="ml-4 p-2 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20 flex-shrink-0">
                  Copy
                </button>
              </div>
            </div>
          </section>

          <!-- User Sessions Audit -->
          <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col h-full">
            <h2 class="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Session Audit & Playback
            </h2>
            <div class="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div v-for="session in userSessions" :key="session.sessionId" class="p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:border-amber-500/30 transition-all flex flex-col justify-between group">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-slate-200">{{ session.userLabel }}</span>
                  <span class="text-xs text-slate-500 font-mono">{{ session.token.substring(0,8) }}</span>
                </div>
                <div class="text-xs text-slate-400 mb-3 flex items-center gap-2">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {{ formatTime12h(session.startTime) }} - {{ formatTime12h(session.endTime) }}
                </div>
                <button @click="openSessionVideo(session)" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2 group-hover:border-amber-500/30">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  View DVR Extraction
                </button>
              </div>
              <div v-if="userSessions.length === 0" class="text-center flex flex-col items-center justify-center text-slate-500 py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <svg class="w-10 h-10 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-sm">No completed sessions found.</span>
              </div>
            </div>
          </section>
        </div>
        
      </div>
    </div>

    <!-- Modals -->

    <!-- Camera Detail Modal -->
    <div v-if="selectedCamera" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl relative my-auto flex flex-col lg:flex-row overflow-hidden">
        
        <!-- Left: Live View & Timeline -->
        <div class="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
          <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full" :class="isOnline(selectedCamera) ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'"></span>
              <h3 class="text-lg font-bold text-slate-100">{{ selectedCamera.display_name || selectedCamera.name }}</h3>
              <span class="text-xs px-2 py-0.5 rounded-md font-mono" :class="selectedCamera.rtsp_url.startsWith('onvif://') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'">{{ selectedCamera.rtsp_url.startsWith('onvif://') ? 'ONVIF' : 'RTSP' }}</span>
            </div>
            <!-- Close button for mobile inside left panel if stacked -->
            <button @click="closeCameraDetail" class="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="aspect-video bg-black relative pointer-events-none">
            <iframe :src="`http://localhost:1984/stream.html?src=${encodeURIComponent(selectedCamera.name)}`" class="w-full h-full border-none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
          </div>

          <!-- Per-Camera Timeline -->
          <div class="p-6 bg-slate-900/30 flex-1">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-semibold text-fuchsia-400 flex items-center gap-2 uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Continuous Archive
              </h4>
              <button @click="downloadExport" class="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-lg text-xs font-medium hover:bg-fuchsia-500/30 transition-colors flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export Exact Range
              </button>
            </div>
            
            <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800/50 mb-6 relative">
              <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Start Scrub (Range L)</span>
                <span>End Scrub (Range R)</span>
              </div>
              <!-- Simulated Drag Select with two inputs for range -->
              <div class="relative h-6 w-full mb-2">
                <input type="range" min="0" max="100" v-model="scrubStartValue" @change="scrubTimeline" class="absolute w-full h-2 top-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 pointer-events-auto z-10 opacity-50">
                <input type="range" min="0" max="100" v-model="scrubValue" @change="scrubTimeline" class="absolute w-full h-2 top-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-cyan-500 pointer-events-auto z-20">
              </div>
              <div class="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>{{ archivesEndLabel }} (Oldest)</span>
                <span>{{ archivesStartLabel }} (Newest)</span>
              </div>
            </div>

            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div v-for="file in continuousArchives" :key="file.name" class="flex-none w-48 p-3 bg-slate-950/80 border border-slate-800/50 rounded-xl hover:border-fuchsia-500/50 transition-all group cursor-pointer" @click="playArchive(file)">
                <div class="aspect-video bg-black rounded-lg mb-2 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-800 transition-colors">
                  <svg class="w-6 h-6 text-slate-500 group-hover:text-fuchsia-400 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                </div>
                <div class="text-xs text-slate-400 truncate" :title="file.name">{{ file.name }}</div>
              </div>
              <div v-if="continuousArchives.length === 0" class="text-slate-500 text-sm w-full text-center py-6 border border-dashed border-slate-800 rounded-xl">
                No continuous archives found for this camera.
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Dynamic Capabilities Panel -->
        <div class="w-full lg:w-80 bg-slate-900 flex flex-col">
          <div class="hidden lg:flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Control Panel</h3>
            <button @click="closeCameraDetail" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
            
            <div v-if="!selectedCamera.capabilities" class="text-center text-slate-500 text-sm py-8 border border-dashed border-slate-800 rounded-xl">
              Camera reported no ONVIF capabilities or is an RTSP stream.
            </div>
            
            <!-- PTZ Capabilities -->
            <div v-if="hasCapability('ptz')" class="space-y-4">
              <h4 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                Pan / Tilt / Zoom
              </h4>
              <div class="flex gap-2 justify-center bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <div class="grid grid-cols-3 gap-1">
                  <div></div>
                  <button @mousedown="ptzCommand(selectedCamera.id, 'UP')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button>
                  <div></div>
                  <button @mousedown="ptzCommand(selectedCamera.id, 'LEFT')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                  <button @mousedown="ptzCommand(selectedCamera.id, 'DOWN')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                  <button @mousedown="ptzCommand(selectedCamera.id, 'RIGHT')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
                <div class="flex flex-col gap-1 ml-4 justify-center">
                  <button @mousedown="ptzCommand(selectedCamera.id, 'ZOOM_IN')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 px-3 text-xs font-bold bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors">+</button>
                  <button @mousedown="ptzCommand(selectedCamera.id, 'ZOOM_OUT')" @mouseup="ptzCommand(selectedCamera.id, 'STOP')" @mouseleave="ptzCommand(selectedCamera.id, 'STOP')" class="p-2 px-3 text-xs font-bold bg-slate-800 hover:bg-indigo-600 rounded-md transition-colors">-</button>
                </div>
              </div>
              
              <!-- Presets & Patrol -->
              <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                <div class="flex gap-2">
                  <input v-model="newPresetName" type="text" placeholder="Preset name..." class="w-full bg-slate-900 border border-slate-700 rounded text-xs px-2 focus:outline-none focus:border-indigo-500/50">
                  <button @click="savePreset" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium transition-colors flex-shrink-0">Save</button>
                </div>
                <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  <button v-for="p in presets" :key="p.token" @click="gotoPreset(p.token)" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] text-slate-300 transition-colors truncate max-w-[100px]" :title="p.Name">
                    {{ p.Name || p.token }}
                  </button>
                </div>
                <div class="pt-2 border-t border-slate-800">
                  <button @click="openPatrolConfig" class="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 font-medium transition-colors flex items-center justify-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Configure Scheduled Patrol
                  </button>
                </div>
              </div>
            </div>

            <!-- Device Capabilities -->
            <div v-if="hasCapability('device')" class="space-y-4">
              <h4 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Device & System</h4>
              <div class="grid grid-cols-2 gap-2">
                <button class="bg-slate-950 hover:bg-slate-800 border border-slate-800 py-2 rounded-lg text-xs font-medium text-slate-300 transition-colors">Reboot Device</button>
                <button class="bg-slate-950 hover:bg-slate-800 border border-slate-800 py-2 rounded-lg text-xs font-medium text-slate-300 transition-colors">Sync Time</button>
              </div>
            </div>

            <!-- Media Capabilities -->
            <div v-if="hasCapability('media')" class="space-y-4">
              <h4 class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Media Profiles</h4>
              <select class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-slate-300">
                <option>Main Stream (H.265)</option>
                <option>Sub Stream (H.264)</option>
              </select>
            </div>

            <!-- Imaging Capabilities -->
            <div v-if="hasCapability('imaging')" class="space-y-4">
              <h4 class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Imaging & Schedules</h4>
              <div class="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <div class="space-y-2">
                  <h5 class="text-[10px] text-slate-500 font-semibold uppercase">Auto Day/Night Mode</h5>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] text-slate-400 mb-1">Day Start (HH:MM)</label>
                      <input v-model="selectedCamera.day_mode_start" type="time" class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500/50 text-slate-300">
                    </div>
                    <div>
                      <label class="block text-[10px] text-slate-400 mb-1">Night Start (HH:MM)</label>
                      <input v-model="selectedCamera.night_mode_start" type="time" class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500/50 text-slate-300">
                    </div>
                  </div>
                  <button @click="saveDayNight" class="w-full px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded text-[10px] font-medium transition-colors">Apply Schedule</button>
                </div>
              </div>
            </div>

            <!-- Events Capabilities -->
            <div v-if="hasCapability('events')" class="space-y-4">
              <h4 class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Events</h4>
              <label class="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div class="w-8 h-4 bg-slate-800 rounded-full relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                <span class="text-xs text-slate-300">Motion Detection</span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <!-- User Session Video Modal -->
    <div v-if="showSessionVideoModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl relative">
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 class="text-lg font-semibold text-slate-200">Extracted Session Recording</h3>
          <button @click="closeSessionVideo" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="aspect-video bg-black relative flex items-center justify-center">
          <video :src="sessionVideoSrc" class="w-full h-full" controls autoplay playsinline></video>
        </div>
      </div>
    </div>

    <!-- Continuous Archive Modal -->
    <div v-if="showArchiveModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl relative">
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 class="text-lg font-semibold text-slate-200">Archive Playback</h3>
          <button @click="showArchiveModal = false; archiveVideoSrc = ''" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="aspect-video bg-black relative flex items-center justify-center">
          <video :src="archiveVideoSrc" class="w-full h-full" controls autoplay playsinline></video>
        </div>
      </div>
    </div>

    <!-- Edit Camera Name Modal -->
    <div v-if="showEditNameModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
import { ref, onMounted, computed } from 'vue'
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
const disablePtz = ref(false)

const newCameraName = ref('')
const newCameraDisplayName = ref('')
const newCameraProtocol = ref('onvif')
const newCameraUrl = ref('')
const newCameraIp = ref('')
const newCameraPort = ref('')
const newCameraUsername = ref('')
const newCameraPassword = ref('')
const newCameraPublicIp = ref('')
const newCameraForwardedPort = ref('')
const newCameraBrand = ref('Dahua')
const newCameraStreamType = ref('sub')
const isTestingConnection = ref(false)
const testConnectionResult = ref('')
const addCameraError = ref('')
const isAddingCamera = ref(false)

const scrubValue = ref(100)
const scrubStartValue = ref(0)
const selectedCamera = ref(null)

const isOnline = (cam) => {
  if (!cam || !cam.last_seen) return false
  return (Date.now() - new Date(cam.last_seen).getTime()) < 90000
}

const presets = ref([])
const newPresetName = ref('')

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
      cameras.value = res.cameras.map(c => {
        try {
          return { ...c, capabilities: c.capabilities ? JSON.parse(c.capabilities) : null }
        } catch(e) {
          return { ...c, capabilities: null }
        }
      })
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

const addCamera = async () => {
  addCameraError.value = ''
  isAddingCamera.value = true
  try {
    const payload = {
      name: newCameraName.value,
      display_name: newCameraDisplayName.value,
      protocol: newCameraProtocol.value
    }
    
    if (newCameraProtocol.value === 'onvif') {
      payload.ip = newCameraIp.value
      payload.port = newCameraPort.value || 80
      payload.username = newCameraUsername.value
      payload.password = newCameraPassword.value
    } else if (newCameraProtocol.value === 'rtsp') {
      payload.rtsp_url = newCameraUrl.value
    } else if (newCameraProtocol.value === 'public_rtsp') {
      payload.public_ip = newCameraPublicIp.value
      payload.forwarded_port = newCameraForwardedPort.value
      payload.camera_brand = newCameraBrand.value
      payload.username = newCameraUsername.value
      payload.password = newCameraPassword.value
      payload.stream_type = newCameraStreamType.value
    }
    
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 8000)

    try {
      const res = await $fetch('/api/admin/cameras', {
        method: 'POST',
        body: payload,
        signal: abortController.signal
      })
      clearTimeout(timeoutId)
      
      if (res.success) {
        newCameraName.value = ''
        newCameraDisplayName.value = ''
        newCameraProtocol.value = 'onvif'
        newCameraUrl.value = ''
        newCameraIp.value = ''
        newCameraPort.value = ''
        newCameraUsername.value = ''
        newCameraPassword.value = ''
        newCameraPublicIp.value = ''
        newCameraForwardedPort.value = ''
        testConnectionResult.value = ''
        await fetchCameras()
      } else {
        addCameraError.value = res.error || 'Failed to add camera.'
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        addCameraError.value = 'Request timed out — no response from the camera.'
      } else {
        throw err
      }
    }
  } catch (error) {
    console.error('Failed to add camera:', error)
    if (!addCameraError.value) {
      addCameraError.value = error.data?.error || 'Failed to connect/add camera.'
    }
  } finally {
    isAddingCamera.value = false
  }
}

const generateLink = async () => {
  try {
    const res = await $fetch('/api/admin/generate-link', {
      method: 'POST',
      body: { 
        cameraIds: selectedCamerasForShare.value,
        daily_start_time: dailyStartTime.value,
        daily_end_time: dailyEndTime.value,
        disable_ptz: disablePtz.value
      }
    })
    if (res.success) {
      const baseUrl = window.location.origin
      generatedLink.value = `${baseUrl}/view?token=${res.token}`
      generatedUserLabel.value = res.user_label
      selectedCamerasForShare.value = []
      dailyStartTime.value = ''
      dailyEndTime.value = ''
      disablePtz.value = false
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

const showSessionVideoModal = ref(false)
const sessionVideoSrc = ref('')
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

const showArchiveModal = ref(false)
const archiveVideoSrc = ref('')
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

const openCameraDetail = async (cam) => {
  selectedCamera.value = cam
  continuousArchives.value = []
  scrubValue.value = 100
  scrubStartValue.value = 0
  await fetchArchives(cam.name)
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

const logout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  // Login page is bypassed, load data directly
  try {
    await Promise.all([fetchCameras(), fetchShares(), fetchSessions()])
  } catch (e) {
    console.error('Failed to load dashboard data:', e)
  }
})
</script>
