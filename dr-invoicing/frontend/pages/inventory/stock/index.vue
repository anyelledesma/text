<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showError } = useToastMessage()

const loading = ref(true)
const warehouseFilter = ref<number | null>(null)
const stockData = ref<any[]>([])

const warehouseOptions = [
  { label: 'Todos los Almacenes', value: null },
  { label: 'Almacén Principal — Santo Domingo', value: 1 },
  { label: 'Almacén Santiago', value: 2 },
  { label: 'Almacén La Romana', value: 3 },
]

const mockStock = [
  { id: 1, producto: 'Papel Bond A4 Resma', sku: 'PAP-001', almacen: 'Almacén Principal', disponible: 5, reservado: 2, costoPromedio: 310.0, stockMinimo: 20 },
  { id: 2, producto: 'Tóner HP 26A Original', sku: 'TON-026A', almacen: 'Almacén Principal', disponible: 2, reservado: 0, costoPromedio: 3800.0, stockMinimo: 10 },
  { id: 3, producto: 'Resaltador Amarillo', sku: 'RES-001', almacen: 'Almacén Principal', disponible: 150, reservado: 10, costoPromedio: 55.0, stockMinimo: 50 },
  { id: 4, producto: 'Grapadora Estándar', sku: 'GRA-001', almacen: 'Almacén Principal', disponible: 45, reservado: 0, costoPromedio: 275.0, stockMinimo: 10 },
  { id: 5, producto: 'Cinta Adhesiva Transparente', sku: 'CIN-001', almacen: 'Almacén Santiago', disponible: 80, reservado: 5, costoPromedio: 45.0, stockMinimo: 30 },
  { id: 6, producto: 'Folder Manila Carta', sku: 'FOL-001', almacen: 'Almacén Santiago', disponible: 200, reservado: 0, costoPromedio: 8.5, stockMinimo: 100 },
  { id: 7, producto: 'Bolígrafo Azul', sku: 'BOL-001', almacen: 'Almacén La Romana', disponible: 12, reservado: 0, costoPromedio: 15.0, stockMinimo: 50 },
  { id: 8, producto: 'Corrector Líquido', sku: 'COR-001', almacen: 'Almacén La Romana', disponible: 30, reservado: 3, costoPromedio: 65.0, stockMinimo: 20 },
]

const filteredStock = computed(() => {
  if (!warehouseFilter.value) return stockData.value
  const wh = warehouseOptions.find((w) => w.value === warehouseFilter.value)
  return stockData.value.filter((s) => s.almacen === wh?.label)
})

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function getStockClass(item: any): object {
  return {
    'bg-red-50': item.disponible <= item.stockMinimo,
  }
}

function getStockSeverity(disponible: number, minimo: number): string {
  if (disponible <= 0) return 'danger'
  if (disponible <= minimo) return 'warn'
  return 'success'
}

function exportStock() {
  // Placeholder for export functionality
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await api.get('/inventory/stock')
    stockData.value = data as any[]
  } catch {
    stockData.value = mockStock
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-bold">Stock de Inventario</h1>
      <Button
        label="Exportar"
        icon="pi pi-download"
        severity="secondary"
        outlined
        @click="exportStock"
      />
    </div>

    <!-- Filter -->
    <Card class="shadow-sm">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Almacén</label>
            <Dropdown
              v-model="warehouseFilter"
              :options="warehouseOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los almacenes"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Stock Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredStock"
          :loading="loading"
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          :row-class="getStockClass"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-400">
              <i class="pi pi-box text-4xl mb-2" />
              <p>No hay registros de stock</p>
            </div>
          </template>
          <Column field="producto" header="Producto" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.producto }}</span>
            </template>
          </Column>
          <Column field="sku" header="SKU" sortable style="min-width: 110px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.sku }}</span>
            </template>
          </Column>
          <Column field="almacen" header="Almacén" sortable style="min-width: 180px" />
          <Column field="disponible" header="Disponible" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="String(data.disponible)"
                :severity="getStockSeverity(data.disponible, data.stockMinimo)"
              />
            </template>
          </Column>
          <Column field="reservado" header="Reservado" sortable style="min-width: 110px">
            <template #body="{ data }">
              <span :class="{ 'text-orange-600 font-medium': data.reservado > 0 }">
                {{ data.reservado }}
              </span>
            </template>
          </Column>
          <Column field="costoPromedio" header="Costo Promedio" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="font-mono">{{ formatDOP(data.costoPromedio) }}</span>
            </template>
          </Column>
          <Column header="Valor Total" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="font-semibold font-mono">
                {{ formatDOP(data.disponible * data.costoPromedio) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
