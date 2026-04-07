<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-logo">
        <div class="auth-icon">
          <i class="pi pi-file-edit" style="font-size: 1.75rem; color: #fff" />
        </div>
        <h1 class="auth-title">DR Invoicing</h1>
        <p class="auth-subtitle">Sistema de Facturación Electrónica e-CF DGII</p>
      </div>
      <div class="auth-content">
        <slot />
      </div>
      <p class="auth-footer">
        &copy; 2026 DR Invoicing &mdash; Plataforma certificada DGII República Dominicana
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 1.5rem;
}

.auth-container {
  width: 100%;
  max-width: 520px;
}

.auth-logo {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-icon {
  width: 64px;
  height: 64px;
  background-color: #2563eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.auth-title {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.auth-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.auth-footer {
  text-align: center;
  color: #64748b;
  font-size: 0.7rem;
  margin-top: 1.25rem;
}
</style>
