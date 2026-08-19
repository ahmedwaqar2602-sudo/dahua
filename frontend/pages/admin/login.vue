<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
      <div class="p-8">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h2 class="text-2xl font-semibold text-center text-white mb-2">Admin Access</h2>
        <p class="text-sm text-slate-400 text-center mb-8">Enter your credentials to manage the portal.</p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input 
              v-model="username" 
              type="text" 
              required 
              autofocus
              class="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              v-model="password" 
              type="password" 
              required 
              class="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            :disabled="isAuthenticating"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <span v-if="isAuthenticating" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
            {{ isAuthenticating ? 'Authenticating...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isAuthenticating = ref(false);
const router = useRouter();
const route = useRoute();

onMounted(() => {
  // Login disabled per user request, redirect straight to dashboard
  router.push('/admin/dashboard');
});

const handleLogin = async () => {
  isAuthenticating.value = true
  errorMessage.value = ''
  console.log('Sending login request for user:', username.value)
  
  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    console.log('Login response received:', res)
    if (res && res.success) {
      // Use window.location.href for a hard redirect so that the HttpOnly
      // cookie is properly sent to the server for the next page load,
      // avoiding client-side router middleware rejecting the navigation.
      window.location.href = '/admin/dashboard'
    } else {
      errorMessage.value = res?.message || res?.error || 'Invalid username or password'
      isAuthenticating.value = false // Ensure we stop loading on failure
    }
  } catch (err) {
    console.error('Login error:', err)
    errorMessage.value = err?.data?.message || err?.data?.error || err?.message || 'Connection failed'
    isAuthenticating.value = false // Ensure we stop loading on error
  }
}
</script>
