<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()

const loading = ref(true)
const movements = ref<any[]>([])

const dateRange = ref<Date[] | null>(null)
const productFilter = ref('')
const typeFilter = ref<string | null>(null)

const showAdjustDialog = ref(false)
const savingAdjustment = ref(false)
const adjustment = ref({
  productId: null as number | null,
  productName: '',
  warehouseId: null as number | null,
  tipo: null as string | null,
  cantidad: 1,
  costoUnitario: 0,
  motivo: '',
})

const movementTypeOptions = [
  { label: 'Todos', value: null },
  { label: 'Entrada', value: 'entrada' },
  { label: 'Salida', value: 'salida' },
  { label: 'Ajuste (+)', value: 'ajuste_positivo' },
  { label: 'Ajuste (-)', value: 'ajuste_negativo' },
  { label: 'Transferencia', value: 'transferencia' },
]

const adjustmentTypeOptions = [
  { label: 'Ajuste Positivo (Entrada)', value: 'ajuste_positivo' },
  { label: 'Ajuste Negativo (Salida)', value: 'ajuste_negativo' },
]

const warehouseOptions = [
  { label: 'Almacén Principal — Santo Domingo', value: 1 },
  { label: 'Almacén Santiago', value: 2 },
  { label: 'Almacén La Romana', value: 3 },
]

const productSuggestions = ref<any[]>([])

const mockMovements = [
  { id: 1, fecha: '2026-03-04T14:30:00', producto: 'Papel Bond A4 Resma', almacen: 'Almacén Principal', tipo: 'salida', cantidad: -50, costoUnitario: 310.0, referencia: 'FAC-E310000000001', usuario: 'María García' },
  { id: 2, fecha: '2026-03-04T10:15:00', producto: 'Tóner HP 26A Original', almacen: 'Almacén Principal', tipo: 'salida', cantidad: -10, costoUnitario: 3800.0, referencia: 'FAC-E310000000001', usuario: 'María García' },
  { id: 3, fecha: '2026-03-03T16:00:00', producto: 'Resaltador Amarillo', almacen: 'Almacén Principal', tipo: 'entrada', cantidad: 200, costoUnitario: 55.0, referencia: 'OC-000234', usuario: 'Carlos Pérez' },
  { id: 4, fecha: '2026-03-03T09:00:00', producto: 'Grapadora Estándar', almacen: 'Almacén Santiago', tipo: 'transferencia', cantidad: 20, costoUnitario: 275.0, referencia: 'TRANS-00012', usuario: 'Ana Martínez' },
  { id: 5, fecha: '2026-03-02T11:30:00', producto: 'Cinta Adhesiva Transparente', almacen: 'Almacén Principal', tipo: 'ajuste_positivo', cantidad: 10, costoUnitario: 45.0, referencia: 'AJ-000056', usuario: 'Roberto Santos' },
  { id: 6, fecha: '2026-03-02T08:45:00', producto: 'Bolígrafo Azul', almacen: 'Almacén La Romana', tipo: 'ajuste_negativo', cantidad: -5, costoUnitario: 15.0, referencia: 'AJ-000055', usuario: 'Roberto Santos' },
  { id: 7, fecha: '2026-03-01T15:20:00', producto: 'Folder Manila Carta', almacen: 'Almacén Principal', tipo: 'entrada', cantidad: 500, costoUnitario: 8.5, referencia: 'OC-000233', usuario: 'Carlos Pérez' },
  { id: 8, fecha: '2026-03-01T13:00:00', producto: 'Corrector Líquido', almacen: 'Almacén La Romana', tipo: 'salida', cantidad: -15, costoUnitario: 65.0, referencia: 'FAC-E320000000016', usuario: 'María García' },
]

const filteredMovements = computed(() => {
  let result = movements.value

  if (productFilter.value) {
    const q = productFilter.value.toLowerCase()
    result = result.filter((m) => m.producto.toLowerCase().includes(q))
  }

  if (typeFilter.value) {
    result = result.filter((m) => m.tipo === typeFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter((m) => {
      const d = new Date(m.fecha)
      return d >= start && d <= end
    })
  }

  return result
})

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function getTypeSeverity(tipo: string): string {
  const map: Record<string, string> = {
    entrada: 'success',
    salida: 'danger',
    ajuste_positivo: 'info',
    ajuste_negativo: 'warn',
    transferencia: 'secondary',
  }
  return map[tipo] || 'info'
}

function getTypeLabel(tipo: string): string {
  const map: Record<string, string> = {
    entrada: 'Entrada',
    salida: 'Salida',
    ajuste_positivo: 'Ajuste (+)',
    ajuste_negativo: 'Ajuste (-)',
    transferencia: 'Transferencia',
  }
  return map[tipo] || tipo
}

function openAdjustDialog() {
  adjustment.value = {
    productId: null,
    productName: '',
    warehouseId: null,
    tipo: null,
    cantidad: 1,
    costoUnitario: 0,
    motivo: '',
  }
  showAdjustDialog.value = true
}

async function searchProducts(event: { query: string }) {
  try {
    const data = await api.get(`/products?search=${encodeURIComponent(event.query)}`)
    productSuggestions.value = (data as any[]) || []
  } catch {
    productSuggestions.value = [
      { id: 1, nombre: 'Papel Bond A4 Resma', sku: 'PAP-001' },
      { id: 2, nombre: 'Tóner HP 26A Original', sku: 'TON-026A' },
      { id: 3, nombre: 'Resaltador Amarillo', sku: 'RES-001' },
    ].filter((p) => p.nombre.toLowerCase().includes(event.query.toLowerCase()))
  }
}

function onProductSelect(event: any) {
  adjustment.value.productId = event.value.id
  adjustment.value.productName = event.value.nombre
}

async function saveAdjustment() {
  if (!adjustment.value.productId) {
    showError('Seleccione un producto')
    return
  }
  if (!adjustment.value.warehouseId) {
    showError('Seleccione un almacén')
    return
  }
  if (!adjustment.value.tipo) {
    showError('Seleccione el tipo de ajuste')
    return
  }
  if (adjustment.value.cantidad <= 0) {
    showError('La cantidad debe ser mayor a cero')
    return
  }
  if (!adjustment.value.motivo.trim()) {
    showError('Indique el motivo del ajuste')
    return
  }

  savingAdjustment.value = true
  try {
    await api.post('/inventory/adjustments', adjustment.value)
    showSuccess('Ajuste de inventario registrado exitosamente')
    showAdjustDialog.value = false
    await fetchMovements()
  } catch (error: any) {
    showError(error?.message || 'Error al registrar el ajuste')
  } finally {
    savingAdjustment.value = false
  }
}

async function fetchMovements() {
  loading.value = true
  try {
    const data = await api.get('/inventory/movements')
    movements.value = data as any[]
  } catch {
    movements.value = mockMovements
  } finally {
    loading.value = false
  }
}

onMounted(fetchMovements)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-bold">Movimientos de Inventario</h1>
      <Button
        label="Nuevo Ajuste"
        icon="pi pi-plus"
        @click="openAdjustDialog"
      />
    </div>

    <!-- Filters -->
    <Card class="shadow-sm">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Producto</label>
            <InputText
              v-model="productFilter"
              placeholder="Buscar por producto..."
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Rango de Fechas</label>
            <Calendar
              v-model="dateRange"
              selection-mode="range"
              date-format="dd/mm/yy"
              placeholder="Seleccionar fechas"
              show-icon
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Tipo de Movimiento</label>
            <Dropdown
              v-model="typeFilter"
              :options="movementTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los tipos"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Movements Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredMovements"
          :loading="loading"
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-400">
              <i class="pi pi-arrow-right-arrow-left text-4xl mb-2" />
              <p>No se encontraron movimientos</p>
            </div>
          </template>
          <Column field="fecha" header="Fecha" sortable style="min-width: 160px">
            <template #body="{ data }">
              {{ new Date(data.fecha).toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' }) }}
            </template>
          </Column>
          <Column field="producto" header="Producto" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.producto }}</span>
            </template>
          </Column>
          <Column field="almacen" header="Almacén" sortable style="min-width: 180px" />
          <Column field="tipo" header="Tipo" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="getTypeLabel(data.tipo)"
                :severity="getTypeSeverity(data.tipo)"
              />
            </template>
          </Column>
          <Column field="cantidad" header="Cantidad" sortable style="min-width: 100px">
            <template #body="{ data }">
              <span
                :class="{
                  'text-green-600 font-semibold': data.cantidad > 0,
                  'text-red-600 font-semibold': data.cantidad < 0,
                }"
              >
                {{ data.cantidad > 0 ? '+' : '' }}{{ data.cantidad }}
              </span>
            </template>
          </Column>
          <Column field="costoUnitario" header="Costo Unit." sortable style="min-width: 130px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ formatDOP(data.costoUnitario) }}</span>
            </template>
          </Column>
          <Column field="referencia" header="Referencia" style="min-width: 160px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.referencia }}</span>
            </template>
          </Column>
          <Column field="usuario" header="Usuario" sortable style="min-width: 140px" />
        </DataTable>
      </template>
    </Card>

    <!-- Adjustment Dialog -->
    <Dialog
      v-model:visible="showAdjustDialog"
      header="Nuevo Ajuste de Inventario"
      :style="{ width: '500px' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Producto *</label>
          <AutoComplete
            v-model="adjustment.productName"
            :suggestions="productSuggestions"
            option-label="nombre"
            placeholder="Buscar producto..."
            class="w-full"
            @complete="searchProducts"
            @item-select="onProductSelect"
          >
            <template #option="{ option }">
              <div class="flex gap-2">
                <span class="font-medium">{{ option.nombre }}</span>
                <span class="text-xs text-gray-500">{{ option.sku }}</span>
              </div>
            </template>
          </AutoComplete>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Almacén *</label>
          <Dropdown
            v-model="adjustment.warehouseId"
            :options="warehouseOptions"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar almacén"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Tipo de Ajuste *</label>
          <Dropdown
            v-model="adjustment.tipo"
            :options="adjustmentTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar tipo"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Cantidad *</label>
            <InputNumber
              v-model="adjustment.cantidad"
              :min="1"
              show-buttons
              class="w-full"
              input-class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Costo Unitario (DOP)</label>
            <InputNumber
              v-model="adjustment.costoUnitario"
              mode="currency"
              currency="DOP"
              locale="es-DO"
              class="w-full"
              input-class="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Motivo *</label>
          <Textarea
            v-model="adjustment.motivo"
            rows="3"
            placeholder="Indique el motivo del ajuste de inventario..."
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="showAdjustDialog = false"
        />
        <Button
          label="Registrar Ajuste"
          icon="pi pi-check"
          :loading="savingAdjustment"
          @click="saveAdjustment"
        />
      </template>
    </Dialog>
  </div>
</template>
