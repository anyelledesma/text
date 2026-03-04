<template>
  <div class="layout-wrapper">
    <aside class="layout-sidebar">
      <LayoutSidebar />
    </aside>
    <div class="layout-main">
      <header class="layout-header">
        <LayoutHeader />
      </header>
      <main class="layout-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-sidebar {
  width: 260px;
  min-width: 260px;
  background-color: #1e293b;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
}

.layout-main {
  margin-left: 260px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-header {
  height: 60px;
  min-height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 90;
}

.layout-content {
  flex: 1;
  padding: 1.5rem;
  background-color: #f8fafc;
}
</style>
