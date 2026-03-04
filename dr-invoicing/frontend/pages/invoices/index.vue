<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useInvoiceStore } from '~/stores/invoice'

const invoiceStore = useInvoiceStore()
const router = useRouter()

const dateRange = ref<Date[] | null>(null)
const statusFilter = ref<string | null>(null)
const ecfTypeFilter = ref<string | null>(null)
const searchQuery = ref('')

const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Borrador', value: 'draft' },
  { label: 'Emitida', value: 'issued' },
  { label: 'Aceptado', value: 'accepted' },
  { label: 'Rechazado', value: 'rejected' },
  { label: 'Anulada', value: 'cancelled' },
]

const ecfTypeOptions = [
  { label: 'Todos', value: null },
  { label: 'E31 — Crédito Fiscal', value: 'E31' },
  { label: 'E32 — Consumo', value: 'E32' },
  { label: 'E33 — Notas de Débito', value: 'E33' },
  { label: 'E34 — Notas de Crédito', value: 'E34' },
]

const filteredInvoices = computed(() => {
  let result = invoiceStore.invoices

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (inv: any) =>
        inv.encf?.toLowerCase().includes(q) ||
        inv.cliente?.toLowerCase().includes(q),
    )
  }

  if (statusFilter.value) {
    result = result.filter((inv: any) => inv.estadoDgii === statusFilter.value || inv.status === statusFilter.value)
  }

  if (ecfTypeFilter.value) {
    result = result.filter((inv: any) => inv.tipo === ecfTypeFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter((inv: any) => {
      const d = new Date(inv.fecha)
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

function getStatusSeverity(status: string): string {
  const map: Record<string, string> = {
    Aceptado: 'success',
    accepted: 'success',
    Pendiente: 'warn',
    issued: 'warn',
    draft: 'secondary',
    Borrador: 'secondary',
    Rechazado: 'danger',
    rejected: 'danger',
    Anulada: 'danger',
    cancelled: 'danger',
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Borrador',
    issued: 'Emitida',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    cancelled: 'Anulada',
  }
  return map[status] || status
}

function onRowClick(event: any) {
  const invoice = event.data
  router.push(`/invoices/${invoice.id}`)
}

onMounted(async () => {
  await invoiceStore.fetchInvoices()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Facturas</h1>
      <NuxtLink to="/invoices/new">
        <Button label="Nueva Factura" icon="pi pi-plus" />
      </NuxtLink>
    </div>

    <!-- Filters -->
    <Card class="shadow-sm">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Buscar</label>
            <InputText
              v-model="searchQuery"
              placeholder="e-NCF o cliente..."
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
            <label class="text-sm font-medium text-gray-600">Estado</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los estados"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-600">Tipo e-CF</label>
            <Dropdown
              v-model="ecfTypeFilter"
              :options="ecfTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los tipos"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Invoice Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredInvoices"
          :loading="invoiceStore.loading"
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
              <i class="pi pi-file text-4xl mb-2" />
              <p>No se encontraron facturas</p>
            </div>
          </template>
          <Column field="encf" header="e-NCF" sortable style="min-width: 180px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.encf }}</span>
            </template>
          </Column>
          <Column field="fecha" header="Fecha" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ new Date(data.fecha).toLocaleDateString('es-DO') }}
            </template>
          </Column>
          <Column field="cliente" header="Cliente" sortable style="min-width: 200px" />
          <Column field="tipo" header="Tipo" sortable style="min-width: 80px">
            <template #body="{ data }">
              <Tag :value="data.tipo" severity="info" />
            </template>
          </Column>
          <Column field="total" header="Total" sortable style="min-width: 140px" class="text-right">
            <template #body="{ data }">
              <span class="font-semibold">{{ formatDOP(data.total) }}</span>
            </template>
          </Column>
          <Column field="estadoDgii" header="Estado DGII" sortable style="min-width: 130px">
            <template #body="{ data }">
              <Tag
                :value="getStatusLabel(data.estadoDgii)"
                :severity="getStatusSeverity(data.estadoDgii)"
              />
            </template>
          </Column>
          <Column header="Acciones" style="min-width: 100px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  size="small"
                  @click.stop="router.push(`/invoices/${data.id}`)"
                />
                <Button
                  icon="pi pi-print"
                  text
                  rounded
                  size="small"
                  severity="secondary"
                  @click.stop
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
