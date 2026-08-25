<template>
  <div class="h-screen w-screen bg-app text-primary font-sans flex overflow-hidden selection:bg-accent/30">
    
    <!-- Primary Left Sidebar -->
    <aside class="w-64 bg-surface flex flex-col justify-between border-r border-default z-30 flex-shrink-0 select-none shadow-xl transition-all duration-300 hidden md:flex">
      
      <!-- Top Section -->
      <div class="flex flex-col">
        <!-- Flexnook Brand Logo -->
        <div class="h-14 border-b border-default flex items-center justify-center">
          <div class="text-xl font-black text-primary tracking-widest leading-tight uppercase">FLEXNOOK</div>
        </div>

        <!-- Main Navigation Items -->
        <nav class="p-3 space-y-1 text-sm font-medium">
          <!-- Cameras (Active) -->
          <NuxtLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary bg-accent/10 transition-colors" exact-active-class="bg-accent/10 text-accent font-bold">
            <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>Cameras</span>
          </NuxtLink>



          <!-- Alerts -->
          <NuxtLink to="/alerts" class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors" exact-active-class="bg-accent/10 text-accent font-bold" :class="$route.path === '/alerts' ? '' : 'text-muted hover:text-primary hover:bg-elevated'">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" :class="$route.path === '/alerts' ? 'text-accent' : 'text-muted'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span>Alerts</span>
            </div>
            <span v-if="unreadCount > 0" class="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ unreadCount }}</span>
          </NuxtLink>

          <!-- Users -->
          <NuxtLink to="/users" class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors" exact-active-class="bg-accent/10 text-accent font-bold" :class="$route.path === '/users' ? 'text-accent' : 'text-muted hover:text-primary hover:bg-elevated'">
            <svg class="w-5 h-5" :class="$route.path === '/users' ? 'text-accent' : 'text-muted'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Users</span>
          </NuxtLink>



          <!-- Divider -->
          <div class="h-px bg-border-default my-3"></div>

          <!-- Logout -->
          <button @click="showLogoutModal = true" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-danger hover:text-white hover:bg-danger/10 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Log Out</span>
          </button>
        </nav>
      </div>

      <!-- Bottom System Info Section -->
      <div class="p-4 border-t border-default bg-elevated/50">
        <div class="text-[11px] text-muted font-mono leading-relaxed">
          <div>Powered by <strong class="text-secondary font-medium">Flexnook</strong></div>
        </div>
      </div>
    </aside>

    <slot />
    
    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-surface border border-default rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-bold text-primary mb-2">Confirm Logout</h3>
        <p class="text-secondary text-sm mb-6">Are you sure you want to log out? You will need to sign in again to access the dashboard.</p>
        <div class="flex items-center justify-end gap-3">
          <button @click="showLogoutModal = false" class="px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-elevated hover:bg-border-default border border-default transition-colors">
            Cancel
          </button>
          <button @click="handleLogout" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-danger hover:bg-danger/80 shadow-lg shadow-danger/20 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#imports'

const router = useRouter()
const route = useRoute()
const { unreadCount } = useAlerts()

const showLogoutModal = ref(false)

const handleLogout = () => {
  const token = useCookie('auth_token')
  token.value = null // Clear the cookie
  router.push('/login')
}
</script>
