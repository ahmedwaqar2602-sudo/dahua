<template>
  <div class="admin-preview-container">
    <iframe
      v-if="streamUrl"
      :src="streamUrl"
      class="preview-iframe"
      allowfullscreen
      allow="autoplay; encrypted-media; picture-in-picture"
      title="Admin Live Preview"
    ></iframe>
    <div v-else class="no-stream">
      <p>No stream URL configured.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  streamUrl: String
});
</script>

<style scoped>
.admin-preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}
.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
}
.no-stream {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
</style>
