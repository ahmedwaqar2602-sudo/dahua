<template>
  <div class="viewer-page">
    <!-- Loading State -->
    <div v-if="pending" class="glass-panel state-card loading-state">
      <div class="spinner"></div>
      <p class="loading-text">Authenticating Cloudflare Edge Camera Stream...</p>
    </div>

    <!-- Access Granted: Stream View -->
    <div v-else-if="accessData && accessData.success" class="stream-container glass-panel">
      <!-- Camera Header Bar -->
      <div class="stream-header">
        <div class="cam-info">
          <div class="badge badge-granted">
            <span class="pulse-dot success"></span>
            LIVE FEED
          </div>
          <h1 class="cam-title">Dahua IP Camera (Front Entrance)</h1>
        </div>

        <div class="stream-meta">
          <span class="meta-tag">WebRTC</span>
          <span class="meta-tag">1080p HD</span>
          <span class="meta-tag timezone-tag">Asia/Karachi</span>
        </div>
      </div>

      <!-- Iframe Video Feed Player -->
      <div class="iframe-wrapper">
        <iframe
          :src="accessData.streamUrl"
          class="stream-iframe"
          allowfullscreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title="Dahua Live Stream"
        ></iframe>
      </div>

      <!-- Stream Control Bar -->
      <div class="stream-controls">
        <div class="stream-status">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Cloudflare Tunnel Connection Active</span>
        </div>

        <div class="control-actions">
          <button class="btn btn-secondary btn-sm" @click="refreshAccess">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            Refresh Stream
          </button>
        </div>
      </div>
    </div>

    <!-- Access Denied State -->
    <div v-else class="glass-panel state-card denied-state">
      <div class="lock-icon-wrapper">
        <div class="lock-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      <div class="badge badge-denied">
        <span class="pulse-dot danger"></span>
        ACCESS RESTRICTED
      </div>

      <h1 class="denied-title">Camera Feed Locked</h1>

      <p class="denied-message">
        {{ accessData?.message || 'Camera access is strictly restricted to 8:00 AM - 6:00 PM.' }}
      </p>

      <div class="schedule-box">
        <div class="schedule-item">
          <span class="sched-label">Allowed Access Hours</span>
          <span class="sched-value">08:00 AM - 06:00 PM</span>
        </div>
        <div class="schedule-divider"></div>
        <div class="schedule-item">
          <span class="sched-label">Timezone Evaluated</span>
          <span class="sched-value">Asia/Karachi (PKT)</span>
        </div>
        <div class="schedule-divider" v-if="accessData?.timestamp"></div>
        <div class="schedule-item" v-if="accessData?.timestamp">
          <span class="sched-label">Server Attempt Time</span>
          <span class="sched-value">{{ accessData.timestamp }}</span>
        </div>
      </div>

      <div class="denied-actions">
        <button class="btn btn-primary" @click="refreshAccess">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          Re-check Access Permission
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: accessData, pending, refresh: refreshAccess } = await useFetch('/api/access');
</script>

<style scoped>
.viewer-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.state-card {
  width: 100%;
  max-width: 600px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 2rem auto;
}

.loading-state {
  gap: 1.5rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(56, 189, 248, 0.15);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

/* Stream Layout */
.stream-container {
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: var(--bg-card);
}

.stream-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.cam-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cam-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stream-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-tag {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid var(--border-color);
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--text-secondary);
}

.timezone-tag {
  color: var(--accent-blue);
  border-color: rgba(56, 189, 248, 0.3);
}

/* Iframe Wrapper */
.iframe-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  background: #000000;
}

.stream-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.stream-controls {
  padding: 1rem 1.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stream-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8125rem;
}

/* Access Denied Card */
.denied-state {
  gap: 1.25rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lock-icon-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.05) 70%);
  border: 1px solid rgba(244, 63, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  box-shadow: 0 0 30px rgba(244, 63, 94, 0.2);
}

.lock-icon {
  color: #fb7185;
}

.denied-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.denied-message {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 460px;
  line-height: 1.6;
}

.schedule-box {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.sched-label {
  color: var(--text-muted);
}

.sched-value {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-primary);
}

.schedule-divider {
  height: 1px;
  background: var(--border-color);
  width: 100%;
}

.denied-actions {
  margin-top: 0.5rem;
}
</style>
