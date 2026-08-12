<template>
  <div class="login-page">
    <div class="login-card glass-panel">
      <div class="brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <h1 class="title">Admin Login</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="username" class="form-input" required autofocus />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" class="form-input" required />
        </div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ layout: 'viewer' }); // Use the minimal layout

const username = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    });
    
    if (res.success) {
      router.push('/admin');
    } else {
      errorMsg.value = res.message || 'Login failed';
    }
  } catch (err) {
    errorMsg.value = err.response?._data?.message || 'Authentication error';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.7);
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.login-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
}

.error-msg {
  color: #f43f5e;
  font-size: 0.875rem;
  text-align: center;
  background: rgba(244, 63, 94, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
}
</style>
