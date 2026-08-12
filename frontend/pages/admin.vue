<template>
  <div class="admin-page">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Security Access Audit Dashboard</h1>
        <p class="page-subtitle">Historical log records for all camera access attempts (Cloudflare D1 Database)</p>
      </div>

      <button class="btn btn-secondary" :disabled="pending" @click="refreshLogs">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
        <span>{{ pending ? 'Refreshing...' : 'Refresh Logs' }}</span>
      </button>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="metrics-grid">
      <div class="glass-panel metric-card">
        <div class="metric-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div class="metric-data">
          <span class="metric-label">Total Access Attempts</span>
          <span class="metric-value">{{ logsList.length }}</span>
        </div>
      </div>

      <div class="glass-panel metric-card">
        <div class="metric-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="metric-data">
          <span class="metric-label">Granted Attempts</span>
          <span class="metric-value text-success">{{ grantedCount }}</span>
        </div>
      </div>

      <div class="glass-panel metric-card">
        <div class="metric-icon danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="metric-data">
          <span class="metric-label">Denied Attempts</span>
          <span class="metric-value text-danger">{{ deniedCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="glass-panel table-container">
      <div class="table-toolbar">
        <div class="filter-tabs">
          <button 
            class="filter-btn" 
            :class="{ active: currentFilter === 'ALL' }" 
            @click="currentFilter = 'ALL'"
          >
            All Attempts ({{ logsList.length }})
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: currentFilter === 'Granted' }" 
            @click="currentFilter = 'Granted'"
          >
            Granted ({{ grantedCount }})
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: currentFilter === 'Denied' }" 
            @click="currentFilter = 'Denied'"
          >
            Denied ({{ deniedCount }})
          </button>
        </div>

        <div class="tz-notice">
          <span>Target Timezone: Asia/Karachi (08:00 - 18:00 PKT)</span>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp (UTC / Server)</th>
              <th>Access Status</th>
              <th>Security Evaluation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending && logsList.length === 0">
              <td colspan="4" class="empty-cell">
                <div class="table-loading">
                  <div class="mini-spinner"></div>
                  <span>Fetching access logs from Cloudflare D1...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="filteredLogs.length === 0">
              <td colspan="4" class="empty-cell">
                <div class="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                  <p class="empty-title">No Access Logs Recorded Yet</p>
                  <p class="empty-sub">Attempts made on the viewer page will automatically populate this table once Cloudflare D1 is linked.</p>
                </div>
              </td>
            </tr>

            <tr v-for="log in filteredLogs" :key="log.id" class="table-row">
              <td class="id-col">#{{ log.id }}</td>
              <td class="time-col">
                <div class="time-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ formatTimestamp(log.timestamp) }}</span>
                </div>
              </td>
              <td class="status-col">
                <span :class="['badge', log.status === 'Granted' ? 'badge-granted' : 'badge-denied']">
                  <span :class="['pulse-dot', log.status === 'Granted' ? 'success' : 'danger']"></span>
                  {{ log.status }}
                </span>
              </td>
              <td class="eval-col">
                <span class="eval-text" v-if="log.status === 'Granted'">
                  Authorised within 08:00 - 18:00 PKT window
                </span>
                <span class="eval-text text-muted-red" v-else>
                  Denied: Attempt outside permitted schedule
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { data: logsData, pending, refresh: refreshLogs } = await useFetch('/api/logs');

const currentFilter = ref('ALL');

const logsList = computed(() => {
  if (!logsData.value) return [];
  if (Array.isArray(logsData.value)) return logsData.value;
  if (Array.isArray(logsData.value.logs)) return logsData.value.logs;
  return [];
});

const grantedCount = computed(() => {
  return logsList.value.filter(item => item.status === 'Granted').length;
});

const deniedCount = computed(() => {
  return logsList.value.filter(item => item.status === 'Denied').length;
});

const filteredLogs = computed(() => {
  if (currentFilter.value === 'ALL') return logsList.value;
  return logsList.value.filter(item => item.status === currentFilter.value);
});

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return ts;
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.spin-icon {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Metric Cards Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.total {
  background: rgba(56, 189, 248, 0.12);
  color: var(--accent-blue);
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.metric-icon.success {
  background: rgba(16, 185, 129, 0.12);
  color: var(--status-success);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.metric-icon.danger {
  background: rgba(244, 63, 94, 0.12);
  color: var(--status-danger);
  border: 1px solid rgba(244, 63, 94, 0.25);
}

.metric-data {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.text-success { color: #34d399; }
.text-danger { color: #fb7185; }

/* Table Container */
.table-container {
  overflow: hidden;
  border-radius: 16px;
}

.table-toolbar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: rgba(15, 23, 42, 0.4);
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(9, 13, 22, 0.6);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.filter-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(30, 41, 59, 0.9);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.tz-notice {
  font-size: 0.8125rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* Table */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.logs-table th {
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: rgba(9, 13, 22, 0.5);
  border-bottom: 1px solid var(--border-color);
}

.logs-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.table-row:hover {
  background: rgba(30, 41, 59, 0.4);
}

.id-col {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent-blue);
  width: 90px;
}

.time-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.eval-text {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.text-muted-red {
  color: rgba(251, 113, 133, 0.7);
}

.empty-cell {
  padding: 4rem 1.5rem !important;
  text-align: center;
}

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-sub {
  font-size: 0.875rem;
  max-width: 420px;
  line-height: 1.5;
}
</style>
