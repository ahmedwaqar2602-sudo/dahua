<template>
  <div class="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center">
    <div class="text-cyan-400 mb-4">
      <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    </div>
    <h1 class="text-2xl font-bold text-slate-200">Events Viewer</h1>
    <p class="text-slate-500 mt-2">Motion and Alarm logs will appear here.</p>
    <NuxtLink to="/admin/dashboard" class="mt-6 text-cyan-400 hover:text-cyan-300 text-sm font-semibold">&larr; Back to Dashboard</NuxtLink>
  </div>
</template>
