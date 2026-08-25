<template>
  <div class="min-h-screen bg-[#14171f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-200">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Flexnook Logo -->
      <div class="flex justify-center mb-6">
        <div class="text-3xl font-black text-white tracking-widest leading-tight uppercase">FLEXNOOK</div>
      </div>
      <h2 class="mt-2 text-center text-xl font-bold tracking-tight text-white">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-[#1b1f2b] py-8 px-4 shadow-2xl border border-[#252936] sm:rounded-xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-sm font-medium text-slate-300">
              Username
            </label>
            <div class="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                v-model="username"
                class="block w-full appearance-none rounded-md border border-[#2f3546] bg-[#12151e] px-3 py-2 text-slate-200 placeholder-slate-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm transition-colors"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-300">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                v-model="password"
                class="block w-full appearance-none rounded-md border border-[#2f3546] bg-[#12151e] px-3 py-2 text-slate-200 placeholder-slate-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="text-rose-500 text-sm font-medium text-center bg-rose-500/10 py-2 rounded-md border border-rose-500/20">
            {{ errorMsg }}
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-cyan-600 py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#1b1f2b] transition-all"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#imports'

definePageMeta({
  layout: false // Don't use the default layout with the sidebar for the login page
})

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')

const handleLogin = () => {
  errorMsg.value = ''
  
  if (username.value === 'admin' && password.value === 'admin123') {
    // Set authentication token cookie
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }) // 7 days
    token.value = 'authenticated_admin_session'
    
    // Redirect to home
    router.push('/')
  } else {
    errorMsg.value = 'Invalid username or password'
  }
}
</script>
