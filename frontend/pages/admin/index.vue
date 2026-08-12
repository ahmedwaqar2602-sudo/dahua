<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Camera Management</h1>
        <p class="page-subtitle">Manage your cameras, generate share links, and preview feeds securely.</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">+ Add Camera</button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Loading cameras...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="cameras.length === 0" class="glass-panel empty-state">
      <div class="empty-icon">📷</div>
      <h3>No Cameras Configured</h3>
      <p>Add your first ONVIF/RTSP camera to get started.</p>
      <button class="btn btn-primary mt-4" @click="showAddModal = true">Add Camera</button>
    </div>

    <!-- Camera Grid -->
    <div v-else class="camera-grid">
      <div v-for="cam in cameras" :key="cam.id" class="glass-panel camera-card">
        <div class="card-header">
          <h3 class="cam-name">{{ cam.name }}</h3>
          <span class="status-indicator online"></span>
        </div>
        <div class="card-body">
          <div class="cam-detail"><span>IP:</span> {{ cam.ip_address }}:{{ cam.onvif_port }}</div>
          <div class="cam-detail stream-truncate" :title="cam.stream_url"><span>Stream:</span> {{ cam.stream_url }}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" @click="viewLive(cam)">Preview</button>
          <button class="btn btn-sm btn-secondary" @click="openShareModal(cam)">Share</button>
          <button class="btn btn-sm btn-danger" @click="deleteCamera(cam.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add Camera Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content glass-panel">
        <h2>Add New Camera</h2>
        <form @submit.prevent="saveCamera" class="modal-form">
          <div class="form-group">
            <label>Camera Name</label>
            <input v-model="newCam.name" type="text" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group flex-2">
              <label>IP Address</label>
              <input v-model="newCam.ip_address" type="text" required class="form-input" placeholder="192.168.1.100" />
            </div>
            <div class="form-group flex-1">
              <label>ONVIF Port</label>
              <input v-model="newCam.onvif_port" type="number" required class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Username</label>
              <input v-model="newCam.username" type="text" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Password</label>
              <input v-model="newCam.password" type="password" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Stream URL (go2rtc config stream name or direct RTSP)</label>
            <input v-model="newCam.stream_url" type="text" required class="form-input" placeholder="http://localhost:1984/stream.html?src=dahua_cam" />
          </div>

          <div class="test-results" v-if="testResult">
            <span :class="testResult.success ? 'text-success' : 'text-danger'">{{ testResult.message }}</span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="testConnection" :disabled="testing">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <div class="right-actions">
              <button type="button" class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Camera</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-content glass-panel share-modal">
        <h2>Share: {{ selectedCam?.name }}</h2>
        
        <div class="share-links-list">
          <h4>Active Share Links</h4>
          <div v-if="shareLinks.length === 0" class="text-muted text-sm my-2">No active links for this camera.</div>
          <div v-else class="link-item" v-for="link in shareLinks" :key="link.token">
            <div class="link-info">
              <span class="link-url">{{ generatePublicUrl(link.token) }}</span>
              <span class="link-expires">Expires: {{ link.expires_at ? new Date(link.expires_at).toLocaleString() : 'Never' }}</span>
            </div>
            <button class="btn btn-sm btn-danger" @click="revokeLink(link.token)">Revoke</button>
          </div>
        </div>

        <div class="create-link-section">
          <h4>Create New Link</h4>
          <div class="form-row mt-2">
            <div class="form-group flex-1">
              <label>Expiration (Optional)</label>
              <input v-model="newLinkExpiry" type="datetime-local" class="form-input" />
            </div>
            <button class="btn btn-primary self-end" @click="createShareLink">Generate Link</button>
          </div>
        </div>

        <div class="modal-actions mt-4">
          <button class="btn btn-secondary" @click="showShareModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- Admin Live Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay preview-overlay" @click.self="showPreviewModal = false">
      <div class="modal-content glass-panel preview-modal">
        <div class="preview-header">
          <h2>Live Preview: {{ selectedCam?.name }}</h2>
          <button class="close-btn" @click="showPreviewModal = false">✕</button>
        </div>
        <div class="preview-body">
          <AdminLivePreview :streamUrl="selectedCam?.stream_url" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
definePageMeta({ middleware: 'auth' });

const cameras = ref([]);
const pending = ref(true);

const showAddModal = ref(false);
const showShareModal = ref(false);
const showPreviewModal = ref(false);

const selectedCam = ref(null);
const shareLinks = ref([]);
const newLinkExpiry = ref('');

const newCam = ref({
  name: '', ip_address: '', onvif_port: 80, username: '', password: '', stream_url: ''
});

const testing = ref(false);
const testResult = ref(null);

async function fetchCameras() {
  pending.value = true;
  const res = await $fetch('/api/admin/cameras');
  if (res.success) cameras.value = res.cameras;
  pending.value = false;
}

onMounted(fetchCameras);

async function testConnection() {
  testing.value = true;
  testResult.value = null;
  try {
    const res = await $fetch('http://localhost:3005/test-onvif', {
      method: 'POST',
      body: { ip: newCam.value.ip_address, port: newCam.value.onvif_port }
    });
    testResult.value = res;
  } catch (err) {
    testResult.value = { success: false, message: 'Local agent unreachable.' };
  }
  testing.value = false;
}

async function saveCamera() {
  await $fetch('/api/admin/cameras', { method: 'POST', body: newCam.value });
  showAddModal.value = false;
  newCam.value = { name: '', ip_address: '', onvif_port: 80, username: '', password: '', stream_url: '' };
  testResult.value = null;
  fetchCameras();
}

async function deleteCamera(id) {
  if (confirm('Are you sure you want to delete this camera?')) {
    await $fetch(`/api/admin/cameras/${id}`, { method: 'DELETE' });
    fetchCameras();
  }
}

async function fetchLinksForCam(camId) {
  const res = await $fetch('/api/admin/share-links');
  if (res.success) {
    shareLinks.value = res.shareLinks.filter(l => l.camera_id === camId && l.is_active === 1);
  }
}

function openShareModal(cam) {
  selectedCam.value = cam;
  showShareModal.value = true;
  newLinkExpiry.value = '';
  fetchLinksForCam(cam.id);
}

function generatePublicUrl(token) {
  return `${window.location.origin}/?token=${token}`;
}

async function createShareLink() {
  const body = { camera_id: selectedCam.value.id };
  if (newLinkExpiry.value) body.expires_at = new Date(newLinkExpiry.value).toISOString();
  
  await $fetch('/api/admin/share-links', { method: 'POST', body });
  fetchLinksForCam(selectedCam.value.id);
}

async function revokeLink(token) {
  await $fetch(`/api/admin/share-links/${token}/revoke`, { method: 'POST' });
  fetchLinksForCam(selectedCam.value.id);
}

function viewLive(cam) {
  selectedCam.value = cam;
  showPreviewModal.value = true;
}
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
.page-title { font-size: 2rem; font-weight: 700; color: #f8fafc; }
.page-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.camera-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cam-name { font-size: 1.125rem; font-weight: 600; color: #fff; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; }
.status-indicator.online { background: #10b981; box-shadow: 0 0 8px #10b981; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.cam-detail span { color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase;}
.stream-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.btn-danger { background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
.btn-danger:hover { background: rgba(244, 63, 94, 0.2); }

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
  max-width: 500px;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.modal-content h2 { margin-bottom: 1.5rem; color: #fff; }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; gap: 1rem; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.875rem; color: var(--text-secondary); }
.form-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  color: #fff;
  outline: none;
}
.form-input:focus { border-color: #38bdf8; }

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.right-actions { display: flex; gap: 0.75rem; }

.text-success { color: #10b981; font-size: 0.875rem; }
.text-danger { color: #fb7185; font-size: 0.875rem; }

.share-modal { max-width: 600px; }
.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.link-info { display: flex; flex-direction: column; gap: 0.25rem; }
.link-url { font-family: var(--font-mono); font-size: 0.875rem; color: #38bdf8; }
.link-expires { font-size: 0.75rem; color: var(--text-muted); }

.preview-overlay { padding: 2rem; }
.preview-modal { max-width: 900px; width: 100%; padding: 0; overflow: hidden; }
.preview-header { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;}
.close-btn { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
.preview-body { background: #000; width: 100%; aspect-ratio: 16/9; }

.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.self-end { align-self: flex-end; }
</style>
