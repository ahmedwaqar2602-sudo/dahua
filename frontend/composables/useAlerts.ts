import { ref, computed, watch, onMounted } from 'vue'

export interface AppAlert {
  id: string
  message: string
  time: string
  read: boolean
}

// Global state using Vue's reactivity outside component scope (singleton pattern)
const alerts = ref<AppAlert[]>([])

export const useAlerts = () => {
  // Load from localStorage only on client-side and only once
  if (process.client && alerts.value.length === 0) {
    const stored = localStorage.getItem('flexnook_alerts')
    if (stored) {
      try {
        alerts.value = JSON.parse(stored)
      } catch(e) {
        console.error('Failed to parse alerts from localStorage', e)
      }
    }

    // Watch for changes and save to localStorage
    watch(alerts, (newAlerts) => {
      localStorage.setItem('flexnook_alerts', JSON.stringify(newAlerts))
    }, { deep: true })
  }

  const addAlert = (message: string) => {
    alerts.value.unshift({
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      message,
      time: new Date().toLocaleString(),
      read: false
    })
  }

  const markAllRead = () => {
    alerts.value.forEach(a => a.read = true)
  }

  const clearAlerts = () => {
    alerts.value = []
  }

  const unreadCount = computed(() => alerts.value.filter(a => !a.read).length)

  return {
    alerts,
    addAlert,
    markAllRead,
    clearAlerts,
    unreadCount
  }
}
