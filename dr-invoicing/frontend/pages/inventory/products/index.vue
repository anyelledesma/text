<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '~/stores/inventory'

const inventoryStore = useInventoryStore()
const router = useRouter()

const searchQuery = ref('')
const categoryFilter = ref<string | null>(null)

const categoryOptions = [
  { label: 'Todas', value: null },
  { label: 'Papelería', value: 'papeleria' },
  { label: 'Tecnología', value: 'tecnologia' },
  { label: 'Suministros', value: 'suministros' },
  { label: 'Mobiliario', value: 'mobiliario' },
  { label: 'Servicios', value: 'servicios' },
]

const filteredProducts = computed(() => {
  let result = inventoryStore.products

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (p: any) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.codigoBarras?.toLowerCase().includes(q),
    )
  }

  if (categoryFilter.value) {
    result = result.filter((p: any) => p.categoria === categoryFilter.value)
  }

  return result
})

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function getStockSeverity(stock: number, minStock: number): string {
  if (stock <= 0) return 'danger'
  if (stock <= minStock) return 'warn'
  return 'success'
}

function getStatusLabel(activo: boolean): string {
  return activo ? 'Activo' : 'Inactivo'
}

function onRowClick(event: any) {
  router.push(`/inventory/products/${event.data.id}`)
}

onMounted(async () => {
  await inventoryStore.fetchProducts()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Productos</h1>
      <NuxtLink to="/inventory/products/new">
        <Button label="Nuevo Producto" icon="pi pi-plus" />
      </NuxtLink>
    </div>

    <!-- Filters -->
    <Card class="shadow-sm">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Buscar</label>
            <InputText
              v-model="searchQuery"
              placeholder="Nombre, SKU o código de barras..."
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Categoría</label>
            <Dropdown
              v-model="categoryFilter"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Todas las categorías"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Products Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredProducts"
          :loading="inventoryStore.loading"
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          row-hover
          class="cursor-pointer"
          @row-click="onRowClick"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-400">
              <i class="pi pi-box text-4xl mb-2" />
              <p>No se encontraron productos</p>
            </div>
          </template>
          <Column field="sku" header="SKU" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.sku }}</span>
            </template>
          </Column>
          <Column field="nombre" header="Nombre" sortable style="min-width: 220px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.nombre }}</span>
            </template>
          </Column>
          <Column field="categoria" header="Categoría" sortable style="min-width: 130px">
            <template #body="{ data }">
              <Tag :value="data.categoriaLabel || data.categoria" severity="info" />
            </template>
          </Column>
          <Column field="precioVenta" header="Precio Venta" sortable style="min-width: 140px">
            <template #body="{ data }">
              <span class="font-semibold">{{ formatDOP(data.precioVenta) }}</span>
            </template>
          </Column>
          <Column field="itbis" header="ITBIS" sortable style="min-width: 80px">
            <template #body="{ data }">
              {{ data.itbis }}%
            </template>
          </Column>
          <Column field="stockTotal" header="Stock Total" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="String(data.stockTotal)"
                :severity="getStockSeverity(data.stockTotal, data.stockMinimo)"
              />
            </template>
          </Column>
          <Column field="activo" header="Estado" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="getStatusLabel(data.activo)"
                :severity="data.activo ? 'success' : 'danger'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
