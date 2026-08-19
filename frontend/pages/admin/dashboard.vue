<template>
  <div class="h-screen w-screen bg-[#111827] text-slate-200 font-sans flex overflow-hidden selection:bg-cyan-500/30">
    
    <!-- 1. Primary Navigation Sidebar -->
    <nav class="w-16 lg:w-20 bg-[#1e2330] flex flex-col items-center py-6 border-r border-[#2d3345] z-30 flex-shrink-0">
      <!-- Logo -->
      <div class="mb-10 text-cyan-400">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          <circle cx="12" cy="14" r="2" class="text-rose-500"/>
        </svg>
      </div>

      <!-- Nav Items -->
      <div class="flex flex-col gap-6 w-full px-2">
        <!-- Live (Active) -->
        <button class="relative flex flex-col items-center justify-center p-2 text-cyan-400 group">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]"></div>
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Live</span>
        </button>
        <!-- Events -->
        <button class="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Events</span>
        </button>
        <!-- Playback -->
        <button class="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Playback</span>
        </button>
        <!-- Dashboard -->
        <button class="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Dashboard</span>
        </button>
        <!-- Settings -->
        <button class="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-200 transition-colors mt-auto">
          <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span class="text-[10px] font-medium tracking-wide">Settings</span>
        </button>
      </div>
    </nav>

    <!-- 2. Secondary Sidebar (Cameras Tree) -->
    <aside class="w-72 bg-[#212735] flex flex-col border-r border-[#2d3345] z-20 flex-shrink-0 shadow-[10px_0_20px_rgba(0,0,0,0.15)]">
      <div class="p-5 flex items-center justify-between border-b border-[#2d3345]">
        <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
          Cameras <span class="text-slate-400 text-xs font-normal">({{ cameras.length }})</span>
        </h2>
        <button @click="showAddCameraModal = true" class="text-cyan-400 hover:text-cyan-300 p-1 rounded transition-colors" title="Add Camera">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>
      
      <div class="p-4 border-b border-[#2d3345]">
        <div class="relative">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Search" class="w-full bg-[#161a22] border border-[#3b4255] rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder-slate-500">
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#3b4255] scrollbar-track-transparent">
        <div class="flex items-center justify-between mb-4">
          <label class="flex items-center gap-2 cursor-pointer group">
            <div class="w-3.5 h-3.5 rounded-sm border border-cyan-500 bg-cyan-500 flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Select all</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400">Preview</span>
            <div class="w-6 h-3.5 bg-cyan-500 rounded-full relative cursor-pointer">
              <div class="w-2.5 h-2.5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>

        <!-- Simulated "Group" - We'll just group all dynamically fetched cameras under "Network Cameras" -->
        <div class="mb-4">
          <div class="flex items-center gap-1.5 mb-2 cursor-pointer group">
            <svg class="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            <span class="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Network Cameras</span>
          </div>
          <div class="pl-5 space-y-2">
            <div v-for="cam in cameras" :key="cam.id" class="flex items-center justify-between group cursor-pointer">
              <div class="flex items-center gap-2">
                <div class="w-3.5 h-3.5 rounded-sm border border-cyan-500 bg-cyan-500 flex items-center justify-center">
                  <svg class="w-2.5 h-2.5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-xs text-slate-300 group-hover:text-white transition-colors truncate max-w-[120px]" :title="cam.display_name || cam.name">
                  {{ cam.display_name || cam.name }}
                </span>
              </div>
              <span class="w-1.5 h-1.5 rounded-full" :class="isOnline(cam) ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-rose-500'"></span>
            </div>
            
            <div v-if="cameras.length === 0" class="text-xs text-slate-500 italic py-2">
              No cameras found.
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 3. Main Content Area & Timeline -->
    <main class="flex-1 flex flex-col relative z-10 bg-[#111827]">
      
      <!-- Top Navigation Tabs -->
      <div class="h-14 border-b border-[#2d3345] bg-[#161a22] flex items-end px-4 gap-8">
        <button class="px-6 py-3 text-sm font-semibold text-cyan-400 relative">
          Grid View
          <div class="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
        </button>
        <button class="px-6 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
          Layouts
        </button>
        <button class="px-6 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
          Presentation View
        </button>
      </div>

      <!-- Filters & Toolbar -->
      <div class="p-4 bg-[#111827] flex items-center justify-between border-b border-[#2d3345]">
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c212b] border border-[#3b4255] rounded-full text-xs text-slate-300 hover:bg-[#252b38] transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Owner <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c212b] border border-[#3b4255] rounded-full text-xs text-slate-300 hover:bg-[#252b38] transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Status <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c212b] border border-[#3b4255] rounded-full text-xs text-slate-300 hover:bg-[#252b38] transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            Tags <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c212b] border border-[#3b4255] rounded-full text-xs text-slate-300 hover:bg-[#252b38] transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analytics <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          
          <button class="ml-2 w-6 h-6 rounded-full border border-[#3b4255] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div class="flex items-center gap-1.5 ml-2 font-semibold text-sm">
            <svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
            {{ cameras.length }} Cameras
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex bg-[#1c212b] rounded-lg p-0.5 border border-[#3b4255]">
            <button class="px-4 py-1.5 text-[10px] font-semibold bg-white text-[#111827] rounded-md shadow">Live Stills</button>
            <button class="px-4 py-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-200">Live Video</button>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400 font-medium">Camera names</span>
            <div class="w-3.5 h-3.5 rounded-sm border border-cyan-500 bg-cyan-500 flex items-center justify-center cursor-pointer">
              <svg class="w-2.5 h-2.5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
          
          <button class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
          </button>
        </div>
      </div>

      <!-- Camera Grid Viewport -->
      <div class="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3b4255] scrollbar-track-transparent pb-32">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          <div v-for="cam in cameras" :key="cam.id" class="bg-[#1c212b] rounded-md overflow-hidden shadow-lg border border-[#2d3345] group relative aspect-video cursor-pointer" @click="openCameraDetail(cam)">
            <!-- Stream Iframe -->
            <iframe :src="`http://localhost:1984/stream.html?src=${encodeURIComponent(cam.name + '_sub')}`" class="w-full h-full border-none pointer-events-none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
            
            <!-- Controls Overlay (Hover) -->
            <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button class="p-1 bg-black/50 text-white rounded hover:bg-cyan-500/80 transition-colors backdrop-blur"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></button>
              <button class="p-1 bg-black/50 text-white rounded hover:bg-cyan-500/80 transition-colors backdrop-blur"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button>
            </div>
            
            <!-- Camera Name Tag Overlay -->
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 pointer-events-none">
              <span class="text-white text-xs font-semibold drop-shadow-md flex items-center gap-2">
                Network Cameras - {{ cam.display_name || cam.name }}
                <span v-if="cam.public_ip" class="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/30 text-cyan-200 border border-cyan-500/50">EXT</span>
              </span>
            </div>
          </div>
          
          <div v-if="cameras.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-[#3b4255] rounded-xl text-slate-500">
            <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="text-sm font-medium">No cameras configured.</span>
            <button @click="showAddCameraModal = true" class="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">Add Camera</button>
          </div>
        </div>
      </div>
      
      <!-- 4. Playback Timeline (Fixed Bottom) -->
      <div class="absolute bottom-4 left-4 right-4 bg-[#1c212b]/95 backdrop-blur-xl border border-[#3b4255] rounded-xl shadow-2xl p-4 flex flex-col z-20">
        <!-- Playback Controls Row -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-1 bg-[#2d3345] hover:bg-[#3b4255] px-3 py-1.5 rounded text-xs font-semibold text-slate-300 transition-colors">
              x1 <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <button class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button>
            <button class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg></button>
          </div>
        </div>
        
        <!-- Timeline Track Mockup -->
        <div class="relative h-12 w-full flex items-center justify-between text-[10px] text-slate-500 font-medium px-2 border-t border-[#2d3345] pt-4">
          <div class="flex flex-col items-center"><span class="mb-1">00:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">04:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">08:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">12:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">16:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">20:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          <div class="flex flex-col items-center"><span class="mb-1">24:00</span><div class="h-1.5 w-0.5 bg-slate-700"></div></div>
          
          <!-- Event Bars -->
          <div class="absolute top-8 left-[15%] w-[10%] h-1.5 bg-cyan-500 rounded-full"></div>
          <div class="absolute top-8 left-[35%] w-[20%] h-1.5 bg-amber-500 rounded-full"></div>
          <div class="absolute top-8 right-[10%] w-[15%] h-1.5 bg-amber-500 rounded-full"></div>
          <div class="absolute top-8 right-[12%] w-[25%] h-1.5 bg-cyan-500 rounded-full"></div>
          
          <!-- Center Time Indicator / Scrubber Pill -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[60%] bg-white text-[#111827] px-4 py-1.5 rounded shadow-[0_4px_15px_rgba(0,0,0,0.3)] font-bold text-xs whitespace-nowrap">
            07:19:27 - 07:19:49
            <div class="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
            <!-- Scrubber Line -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-[-1]"></div>
          </div>
        </div>

        <!-- Timeline Footer Tools -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-4 text-[10px] font-semibold text-slate-300">
            <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-300"></div> Person</span>
            <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-500"></div> Vehicle</span>
            <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-cyan-500"></div> All motion</span>
          </div>
          
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-white rounded-full p-0.5 px-1 shadow-lg">
              <button class="p-1 hover:bg-slate-200 rounded-full"><svg class="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
              <span class="px-3 text-xs font-bold text-slate-800 whitespace-nowrap">Thu, 11 Dec 2025 | 07:19:49</span>
              <button class="p-1 hover:bg-slate-200 rounded-full"><svg class="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
            </div>
            <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">Today</button>
          </div>
        </div>
      </div>
      
    </main>

    <!-- Add Camera Modal -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showAddCameraModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <transition enter-active-class="transition ease-out duration-300 transform" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="showAddCameraModal" class="bg-[#161a22] border border-[#2d3345] rounded-2xl shadow-2xl w-full max-w-xl relative overflow-hidden">
            
            <form @submit.prevent="addCamera" class="flex flex-col gap-6 relative z-10 p-8">
              <div class="flex items-center justify-between mb-2 border-b border-[#2d3345] pb-4">
                <h3 class="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <div class="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  Add New Camera
                </h3>
                <button type="button" @click="showAddCameraModal = false" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#2d3345] transition-colors">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div class="flex flex-col gap-5">
                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Camera Protocol</label>
                  <div class="flex gap-4">
                    <label class="flex-1 relative cursor-pointer group">
                      <input type="radio" v-model="newCameraProtocol" value="onvif" class="peer sr-only" name="protocol">
                      <div class="p-4 rounded-xl border border-[#3b4255] bg-[#1c212b] peer-checked:bg-cyan-500/10 peer-checked:border-cyan-500/50 transition-all text-center">
                        <span class="block text-sm font-bold text-slate-400 peer-checked:text-cyan-400 group-hover:text-slate-200">ONVIF URL</span>
                      </div>
                    </label>
                    <label class="flex-1 relative cursor-pointer group">
                      <input type="radio" v-model="newCameraProtocol" value="rtsp" class="peer sr-only" name="protocol">
                      <div class="p-4 rounded-xl border border-[#3b4255] bg-[#1c212b] peer-checked:bg-cyan-500/10 peer-checked:border-cyan-500/50 transition-all text-center">
                        <span class="block text-sm font-bold text-slate-400 peer-checked:text-cyan-400 group-hover:text-slate-200">RTSP URL</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Camera Name (No Spaces)</label>
                  <input v-model="newCameraName" type="text" placeholder="e.g. lobby_cam" required class="w-full bg-[#111827] border border-[#3b4255] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-500">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">Stream Link (ONVIF or RTSP)</label>
                  <input v-model="newCameraUrl" type="text" :placeholder="newCameraProtocol === 'onvif' ? 'onvif://user:pass@ip:port' : 'rtsp://user:pass@ip:port/path'" required class="w-full bg-[#111827] border border-[#3b4255] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500 font-mono text-xs text-slate-200">
                </div>
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
          </div>
        </transition>
      </div>
    </transition>
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
const showAddCameraModal = ref(false)

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
