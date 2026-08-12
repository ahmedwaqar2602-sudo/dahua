<template>
  <div class="app-container">
    <!-- Header Navbar -->
    <header class="glass-nav sticky-header">
      <div class="nav-content">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="title">DAHUA<span class="highlight">SECURE</span></span>
            <span class="subtitle">Cloudflare Edge Portal</span>
          </div>
        </NuxtLink>

        <!-- Navigation Tabs -->
        <nav class="nav-links">
          <NuxtLink to="/" class="nav-item" exact-active-class="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="12" x="3" y="6" rx="2"/>
              <circle cx="9" cy="12" r="2"/>
              <path d="m15 9 3 3-3 3"/>
            </svg>
            <span>Live Stream</span>
          </NuxtLink>
          
          <NuxtLink to="/admin" class="nav-item" exact-active-class="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>Access Audit Logs</span>
          </NuxtLink>
        </nav>

        <!-- Timezone Badge -->
        <div class="tz-badge">
          <span class="tz-dot"></span>
          <span class="tz-label">Asia/Karachi</span>
        </div>
      </div>
    </header>

    <!-- Page Body -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>© {{ currentYear }} Dahua Secure Access Portal. Powered by Nuxt 3 & Cloudflare Workers D1.</p>
        <div class="policy-note">Restricted Operational Hours: 08:00 - 18:00 PKT</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text .title {
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: 0.05em;
  color: #f8fafc;
}

.brand-text .highlight {
  color: #38bdf8;
}

.brand-text .subtitle {
  font-size: 0.725rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(3, 105, 161, 0.4) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.tz-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.tz-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.main-content {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 0;
  background: rgba(9, 13, 22, 0.9);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.policy-note {
  font-family: var(--font-mono);
  color: var(--accent-blue);
  background: rgba(56, 189, 248, 0.08);
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  .tz-badge {
    display: none;
  }
}
</style>
