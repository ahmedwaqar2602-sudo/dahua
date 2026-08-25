<template>
  <div class="flex-1 w-full h-full bg-app flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="h-14 bg-surface border-b border-default flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-bold text-primary tracking-wide">System Users</h1>
      </div>
      <div class="flex items-center gap-3">
        <button @click="showAddUserModal = true" class="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-accent/20">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add User
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30">
      <div class="max-w-5xl mx-auto">
        <!-- Users Table/List -->
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-left text-sm text-secondary">
            <thead class="bg-elevated text-xs uppercase text-muted border-b border-default">
              <tr>
                <th class="px-6 py-4 font-bold">User</th>
                <th class="px-6 py-4 font-bold">Role</th>
                <th class="px-6 py-4 font-bold">Status</th>
                <th class="px-6 py-4 font-bold">Last Active</th>
                <th class="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="(user, index) in users" :key="index" class="hover:bg-elevated/50 transition-colors">
                <td class="px-6 py-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0" :class="user.colorClass">
                    {{ user.initials }}
                  </div>
                  <div>
                    <div class="font-bold text-primary">{{ user.name }}</div>
                    <div class="text-[11px] text-muted">{{ user.email }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border" :class="user.roleClass">{{ user.role }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="user.online ? 'bg-success shadow-[0_0_6px_#34d399]' : 'bg-muted'"></span>
                    <span class="text-xs font-semibold" :class="user.online ? 'text-primary' : 'text-muted'">{{ user.online ? 'Online' : 'Offline' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-xs font-mono" :class="!user.online ? 'text-muted' : ''">{{ user.lastActive }}</td>
                <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button class="text-muted hover:text-primary transition-colors p-1" title="Edit">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button v-if="user.role !== 'Administrator'" @click="removeUser(index)" class="text-muted hover:text-danger transition-colors p-1" title="Revoke Access">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-surface border border-default rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-primary mb-1">Add New User</h3>
        <p class="text-secondary text-sm mb-6">Create a new user account and assign permissions.</p>
        
        <form @submit.prevent="handleAddUser" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-muted mb-1.5">Full Name</label>
            <input v-model="newUser.name" required type="text" class="w-full bg-elevated border border-default rounded-lg px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label class="block text-xs font-bold text-muted mb-1.5">Email Address</label>
            <input v-model="newUser.email" required type="email" class="w-full bg-elevated border border-default rounded-lg px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors" placeholder="e.g. john@flexnook.local" />
          </div>
          <div>
            <label class="block text-xs font-bold text-muted mb-1.5">Role</label>
            <select v-model="newUser.role" class="w-full bg-elevated border border-default rounded-lg px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors">
              <option value="Viewer">Viewer (Read Only)</option>
              <option value="Operator">Operator (PTZ & Playback)</option>
              <option value="Administrator">Administrator (Full Access)</option>
            </select>
          </div>
          
          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-default">
            <button type="button" @click="showAddUserModal = false" class="px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-elevated hover:bg-border-default border border-default transition-colors">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-colors">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showAddUserModal = ref(false)

const newUser = ref({
  name: '',
  email: '',
  role: 'Viewer'
})

const users = ref([
  {
    name: 'Admin',
    email: 'admin@flexnook.local',
    initials: 'A',
    role: 'Administrator',
    online: true,
    lastActive: 'Just now',
    colorClass: 'bg-accent/20 border-accent/30 text-accent',
    roleClass: 'bg-accent/10 text-accent border-accent/20'
  },
  {
    name: 'User 1',
    email: 'user1@flexnook.local',
    initials: 'U1',
    role: 'Viewer',
    online: true,
    lastActive: '2 mins ago',
    colorClass: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
    roleClass: 'bg-border-default text-secondary border-default'
  },
  {
    name: 'User 2',
    email: 'user2@flexnook.local',
    initials: 'U2',
    role: 'Operator',
    online: false,
    lastActive: '3 hours ago',
    colorClass: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    roleClass: 'bg-border-default text-secondary border-default'
  }
])

const handleAddUser = () => {
  const initials = newUser.value.name.substring(0, 2).toUpperCase()
  
  let roleClass = 'bg-border-default text-secondary border-default'
  if (newUser.value.role === 'Administrator') {
    roleClass = 'bg-accent/10 text-accent border-accent/20'
  }

  // Generate a random color for the new user avatar
  const colors = [
    'bg-amber-500/20 border-amber-500/30 text-amber-400',
    'bg-rose-500/20 border-rose-500/30 text-rose-400',
    'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    'bg-purple-500/20 border-purple-500/30 text-purple-400'
  ]
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  users.value.push({
    name: newUser.value.name,
    email: newUser.value.email,
    initials,
    role: newUser.value.role,
    online: false,
    lastActive: 'Never',
    colorClass: randomColor,
    roleClass
  })

  showAddUserModal.value = false
  newUser.value = { name: '', email: '', role: 'Viewer' }
}

const removeUser = (index: number) => {
  if (confirm('Are you sure you want to revoke access for this user?')) {
    users.value.splice(index, 1)
  }
}
</script>
