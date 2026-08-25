<template>
  <div class="flex-1 w-full h-full bg-app flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="h-14 bg-surface border-b border-default flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-bold text-primary tracking-wide">System Alerts</h1>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="alerts.length > 0" @click="markAllRead" class="px-3 py-1.5 rounded-md bg-elevated hover:bg-border-default text-primary text-xs font-semibold transition-colors border border-default shadow-sm">
          Mark All Read
        </button>
        <button v-if="alerts.length > 0" @click="clearAlerts" class="px-3 py-1.5 rounded-md bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold transition-colors border border-danger/20 shadow-sm">
          Clear All
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30">
      <div class="max-w-4xl mx-auto">
        <!-- Empty State -->
        <div v-if="alerts.length === 0" class="flex flex-col items-center justify-center py-20 text-muted opacity-80">
          <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <p class="text-lg font-bold text-primary">No Alerts Found</p>
          <p class="text-sm mt-1">You're all caught up. New notifications will appear here.</p>
        </div>

        <!-- Alert List -->
        <div v-else class="space-y-3">
          <div v-for="alert in alerts" :key="alert.id" class="p-4 rounded-xl border flex gap-4 transition-all" :class="alert.read ? 'bg-surface border-default opacity-70' : 'bg-elevated border-accent/40 shadow-sm'">
            <!-- Icon -->
            <div class="mt-0.5 shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="alert.read ? 'bg-border-default text-muted' : 'bg-accent/20 text-accent'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold uppercase tracking-wider" :class="alert.read ? 'text-muted' : 'text-accent'">System Event</span>
                <span class="text-[11px] text-muted">{{ alert.time }}</span>
                <span v-if="!alert.read" class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-auto"></span>
              </div>
              <p class="text-sm font-medium" :class="alert.read ? 'text-secondary' : 'text-primary'">{{ alert.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlerts } from '~/composables/useAlerts'

const { alerts, markAllRead, clearAlerts } = useAlerts()

// Optionally, mark all as read when opening the page
onMounted(() => {
  // markAllRead()
})
</script>
