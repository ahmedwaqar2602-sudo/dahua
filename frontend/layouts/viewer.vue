<template>
  <div class="app-container viewer-layout">
    <!-- Header Navbar -->
    <header class="glass-nav sticky-header viewer-header">
      <div class="nav-content">
        <div class="brand">
          <div class="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="title">DAHUA<span class="highlight">SECURE</span></span>
            <span class="subtitle">Cloudflare Edge Portal</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Body (Full Bleed Content) -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="app-footer viewer-footer">
      <div class="footer-content">
        <div class="policy-note">Restricted Operational Hours: 08:00 - 18:00 PKT</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary, #090d16);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
}

.viewer-header {
  background: transparent;
  border-bottom: none;
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center; /* Centered branding for viewer page */
  opacity: 0.6; /* De-emphasized */
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text .title {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
  color: #f8fafc;
}

.brand-text .highlight {
  color: #38bdf8;
}

.brand-text .subtitle {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.viewer-footer {
  margin-top: auto;
  padding: 1.5rem 0;
  background: transparent;
  border-top: none;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.policy-note {
  font-family: var(--font-mono);
  color: var(--accent-blue);
  background: rgba(56, 189, 248, 0.08);
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.75rem;
  text-align: center;
}
</style>
