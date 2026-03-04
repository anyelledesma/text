<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-logo">
        <i class="pi pi-building" style="font-size: 2.5rem; color: var(--p-primary-color)" />
        <h1 class="auth-title">DR Invoicing</h1>
        <p class="auth-subtitle">Sistema de Facturacion e Inventario</p>
      </div>
      <div class="auth-content">
        <slot />
      </div>
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
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.75rem 0 0.25rem 0;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  margin: 0;
}

.auth-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}
</style>
