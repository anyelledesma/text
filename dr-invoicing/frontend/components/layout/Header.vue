<template>
  <div class="header">
    <div class="header-left">
      <Breadcrumb :model="breadcrumbItems" :home="breadcrumbHome">
        <template #item="{ item }">
          <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">
            <i v-if="item.icon" :class="item.icon" />
            <span>{{ item.label }}</span>
          </NuxtLink>
          <span v-else class="breadcrumb-current">
            <i v-if="item.icon" :class="item.icon" />
            <span>{{ item.label }}</span>
          </span>
        </template>
      </Breadcrumb>
    </div>

    <div class="header-right">
      <Button
        type="button"
        :label="userName"
        :icon="'pi pi-user'"
        class="header-user-button"
        text
        severity="secondary"
        @click="toggleUserMenu"
        aria-haspopup="true"
        aria-controls="user-menu"
      />
      <Menu id="user-menu" ref="userMenuRef" :model="userMenuItems" :popup="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem'

const route = useRoute()
const authStore = useAuthStore()

const userMenuRef = ref()

const userName = computed<string>(() => {
  return authStore.user?.name ?? 'Usuario'
})

const userRole = computed<string>(() => {
  return authStore.user?.role ?? ''
})

const breadcrumbHome: MenuItem = {
  icon: 'pi pi-home',
  to: '/',
}

const routeLabelMap: Record<string, string> = {
  invoices: 'Facturacion',
  inventory: 'Inventario',
  products: 'Productos',
  stock: 'Inventario',
  movements: 'Movimientos',
  customers: 'Clientes',
  suppliers: 'Suplidores',
  purchases: 'Compras',
  reports: 'Reportes',
  settings: 'Configuracion',
  company: 'Empresa',
}

const breadcrumbItems = computed<MenuItem[]>(() => {
  const segments = route.path.split('/').filter(Boolean)
  return segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    return {
      label: routeLabelMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1),
      to: isLast ? undefined : path,
    }
  })
})

const userMenuItems = computed<MenuItem[]>(() => [
  {
    label: userName.value,
    items: [
      {
        label: userRole.value,
        icon: 'pi pi-id-card',
        disabled: true,
      },
      {
        separator: true,
      },
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => navigateTo('/settings/profile'),
      },
      {
        label: 'Cerrar Sesion',
        icon: 'pi pi-sign-out',
        command: () => handleLogout(),
      },
    ],
  },
])

function toggleUserMenu(event: Event): void {
  userMenuRef.value?.toggle(event)
}

async function handleLogout(): Promise<void> {
  await authStore.logout()
  await navigateTo('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: var(--p-primary-color, #3b82f6);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.header-user-button {
  font-weight: 500;
}
</style>
