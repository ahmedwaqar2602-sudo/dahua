<template>
  <div class="admin-page">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Session Audit Dashboard</h1>
        <p class="page-subtitle">Historical viewer sessions and video recordings.</p>
      </div>
      <button class="btn btn-secondary" @click="refreshLogs">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
        Refresh Data
      </button>
    </div>

    <!-- Analytics Cards -->
    <div class="analytics-grid">
      <div class="stat-card glass-panel">
        <div class="stat-icon info">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Total Sessions</h3>
          <p class="stat-value">{{ totalSessions }}</p>
        </div>
      </div>
      
      <div class="stat-card glass-panel">
        <div class="stat-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Granted Access</h3>
          <p class="stat-value">{{ grantedSessions }}</p>
        </div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-icon danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Denied Attempts</h3>
          <p class="stat-value">{{ deniedSessions }}</p>
        </div>
      </div>
    </div>

    <!-- Data Table Section -->
    <div class="table-container glass-panel">
      <div class="table-header">
        <h2 class="table-title">Recent Viewer Sessions</h2>
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Search by camera or token..." class="search-input" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Camera</th>
              <th>Token</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Recording</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending">
              <td colspan="7" class="text-center py-8">
                <div class="spinner-small"></div>
                <span class="ml-2 text-muted">Loading session data...</span>
              </td>
            </tr>
            <tr v-else-if="filteredLogs.length === 0">
              <td colspan="7" class="text-center py-8 text-muted">
                No sessions found matching your criteria.
              </td>
            </tr>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="font-medium">{{ log.camera_name || 'Unknown Camera' }}</td>
              <td class="font-mono text-sm text-muted">{{ log.share_link_token || 'N/A' }}</td>
              <td>{{ formatDate(log.opened_at) }}</td>
              <td>{{ log.closed_at ? formatDate(log.closed_at) : 'Active / Unclosed' }}</td>
              <td>{{ calculateDuration(log.opened_at, log.closed_at) }}</td>
              <td>
                <span :class="['status-badge', log.status === 'Granted' ? 'badge-success' : 'badge-danger']">
                  {{ log.status }}
                </span>
              </td>
              <td>
                <button v-if="log.recording_path" class="btn btn-sm btn-primary" @click="playVideo(log.recording_path)">
                  Play Clip
                </button>
                <span v-else class="text-muted text-sm">No clip</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Video Player Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click.self="showVideoModal = false">
      <div class="modal-content glass-panel video-modal">
        <div class="video-header">
          <h2>Session Recording Playback</h2>
          <button class="close-btn" @click="showVideoModal = false">✕</button>
        </div>
        <video controls :src="currentVideoUrl" class="playback-video" autoplay></video>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({ middleware: 'auth' });

const { data: logsData, pending, refresh } = await useFetch('/api/admin/logs');
const searchQuery = ref('');

const showVideoModal = ref(false);
const currentVideoUrl = ref('');

const refreshLogs = () => { refresh(); };

const logs = computed(() => logsData.value?.logs || []);

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value;
  const q = searchQuery.value.toLowerCase();
  return logs.value.filter(log => 
    (log.camera_name && log.camera_name.toLowerCase().includes(q)) ||
    (log.share_link_token && log.share_link_token.toLowerCase().includes(q)) ||
    (log.status && log.status.toLowerCase().includes(q))
  );
});

const totalSessions = computed(() => logs.value.length);
const grantedSessions = computed(() => logs.value.filter(l => l.status === 'Granted').length);
const deniedSessions = computed(() => logs.value.filter(l => l.status === 'Denied').length);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('en-PK', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

const calculateDuration = (start, end) => {
  if (!start || !end) return '-';
  const diffMs = new Date(end) - new Date(start);
  if (diffMs < 0) return '-';
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const playVideo = (url) => {
  currentVideoUrl.value = url;
  showVideoModal.value = true;
};
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
}

.page-subtitle {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.info {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.stat-icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.stat-icon.danger {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.stat-content h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
}

.table-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #38bdf8;
  background: rgba(0, 0, 0, 0.4);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 1rem;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}

.data-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: var(--font-mono);
}

.text-muted {
  color: var(--text-muted);
}

.text-sm {
  font-size: 0.8125rem;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-danger {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.ml-2 { margin-left: 0.5rem; }

.btn-sm { padding: 4px 10px; font-size: 0.75rem; }

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.video-modal { max-width: 900px; padding: 0; overflow: hidden; }
.video-header { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;}
.close-btn { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
.playback-video { width: 100%; aspect-ratio: 16/9; background: #000; outline: none; }
</style>
