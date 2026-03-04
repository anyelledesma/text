<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <i class="pi pi-building" style="font-size: 1.5rem" />
      <span class="sidebar-logo-text">DR Invoicing</span>
    </div>

    <nav class="sidebar-nav">
      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.path" class="sidebar-menu-item">
          <NuxtLink
            :to="item.path"
            class="sidebar-menu-link"
            :class="{ active: isActive(item.path) }"
          >
            <i :class="['pi', item.icon]" class="sidebar-menu-icon" />
            <span class="sidebar-menu-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <span class="sidebar-version">v1.0.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string
  icon: string
  path: string
}

const route = useRoute()

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'pi-home', path: '/' },
  { label: 'Facturacion', icon: 'pi-file', path: '/invoices' },
  { label: 'Productos', icon: 'pi-box', path: '/inventory/products' },
  { label: 'Inventario', icon: 'pi-warehouse', path: '/inventory/stock' },
  { label: 'Movimientos', icon: 'pi-arrows-h', path: '/inventory/movements' },
  { label: 'Clientes', icon: 'pi-users', path: '/customers' },
  { label: 'Suplidores', icon: 'pi-truck', path: '/suppliers' },
  { label: 'Compras', icon: 'pi-shopping-cart', path: '/purchases' },
  { label: 'Reportes', icon: 'pi-chart-bar', path: '/reports' },
  { label: 'Configuracion', icon: 'pi-cog', path: '/settings/company' },
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1e293b;
  color: #ffffff;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #334155;
  color: #ffffff;
}

.sidebar-logo-text {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.025em;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-menu-item {
  margin: 0.125rem 0.75rem;
}

.sidebar-menu-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sidebar-menu-link:hover {
  color: #ffffff;
  background-color: #334155;
}

.sidebar-menu-link.active {
  color: #ffffff;
  background-color: var(--p-primary-color, #3b82f6);
}

.sidebar-menu-icon {
  font-size: 1.1rem;
  width: 1.25rem;
  text-align: center;
}

.sidebar-menu-label {
  white-space: nowrap;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #334155;
  text-align: center;
}

.sidebar-version {
  color: #64748b;
  font-size: 0.8rem;
}
</style>
