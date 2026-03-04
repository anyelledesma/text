<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useInvoiceStore } from '~/stores/invoice'

const api = useApi()
const invoiceStore = useInvoiceStore()

interface DashboardSummary {
  ventasHoy: number
  facturasPendientes: number
  productosBajoStock: number
  ecfRechazados: number
  ventasRecientes: { fecha: string; total: number }[]
  alertas: { tipo: string; mensaje: string; severidad: string }[]
}

const summary = ref<DashboardSummary>({
  ventasHoy: 0,
  facturasPendientes: 0,
  productosBajoStock: 0,
  ecfRechazados: 0,
  ventasRecientes: [],
  alertas: [],
})

const recentInvoices = ref<any[]>([])
const loading = ref(true)

const mockSummary: DashboardSummary = {
  ventasHoy: 245780.5,
  facturasPendientes: 12,
  productosBajoStock: 5,
  ecfRechazados: 2,
  ventasRecientes: [
    { fecha: '2026-03-04', total: 245780.5 },
    { fecha: '2026-03-03', total: 198340.0 },
    { fecha: '2026-03-02', total: 312500.75 },
    { fecha: '2026-03-01', total: 176290.0 },
    { fecha: '2026-02-28', total: 289100.25 },
  ],
  alertas: [
    { tipo: 'stock', mensaje: 'Papel Bond A4 — Stock actual: 5 unidades (mínimo: 20)', severidad: 'warn' },
    { tipo: 'stock', mensaje: 'Tóner HP 26A — Stock actual: 2 unidades (mínimo: 10)', severidad: 'error' },
    { tipo: 'secuencia', mensaje: 'Secuencia E31 — Quedan 15 comprobantes disponibles', severidad: 'warn' },
    { tipo: 'ecf', mensaje: '2 e-CF rechazados pendientes de corrección', severidad: 'error' },
  ],
}

const mockInvoices = [
  { id: 1, encf: 'E310000000001', fecha: '2026-03-04', cliente: 'Distribuidora Nacional SRL', tipo: 'E31', total: 58750.0, estadoDgii: 'Aceptado' },
  { id: 2, encf: 'E320000000015', fecha: '2026-03-04', cliente: 'Consumidor Final', tipo: 'E32', total: 3450.5, estadoDgii: 'Aceptado' },
  { id: 3, encf: 'E310000000002', fecha: '2026-03-04', cliente: 'Ferretería El Maestro EIRL', tipo: 'E31', total: 127800.0, estadoDgii: 'Pendiente' },
  { id: 4, encf: 'E320000000016', fecha: '2026-03-03', cliente: 'Consumidor Final', tipo: 'E32', total: 890.0, estadoDgii: 'Aceptado' },
  { id: 5, encf: 'E310000000003', fecha: '2026-03-03', cliente: 'Supermercados Unidos SA', tipo: 'E31', total: 245000.0, estadoDgii: 'Rechazado' },
  { id: 6, encf: 'E320000000017', fecha: '2026-03-03', cliente: 'Consumidor Final', tipo: 'E32', total: 5670.25, estadoDgii: 'Aceptado' },
  { id: 7, encf: 'E310000000004', fecha: '2026-03-02', cliente: 'Importadora del Caribe SRL', tipo: 'E31', total: 89320.0, estadoDgii: 'Aceptado' },
  { id: 8, encf: 'E320000000018', fecha: '2026-03-02', cliente: 'Consumidor Final', tipo: 'E32', total: 1250.0, estadoDgii: 'Pendiente' },
  { id: 9, encf: 'E310000000005', fecha: '2026-03-01', cliente: 'Multiservicio Dominicana SAS', tipo: 'E31', total: 34500.0, estadoDgii: 'Aceptado' },
  { id: 10, encf: 'E320000000019', fecha: '2026-03-01', cliente: 'Consumidor Final', tipo: 'E32', total: 7890.75, estadoDgii: 'Rechazado' },
]

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function getStatusSeverity(status: string): string {
  switch (status) {
    case 'Aceptado': return 'success'
    case 'Pendiente': return 'warn'
    case 'Rechazado': return 'danger'
    default: return 'info'
  }
}

function getAlertSeverity(severidad: string): string {
  switch (severidad) {
    case 'error': return 'error'
    case 'warn': return 'warn'
    default: return 'info'
  }
}

function getAlertIcon(tipo: string): string {
  switch (tipo) {
    case 'stock': return 'pi pi-box'
    case 'secuencia': return 'pi pi-hashtag'
    case 'ecf': return 'pi pi-exclamation-triangle'
    default: return 'pi pi-info-circle'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await api.get('/dashboard/summary')
    summary.value = data as DashboardSummary
    await invoiceStore.fetchInvoices()
    recentInvoices.value = invoiceStore.invoices.slice(0, 10)
  } catch {
    summary.value = mockSummary
    recentInvoices.value = mockInvoices
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-sm text-gray-500">
        {{ new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-dollar text-green-600 text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Ventas Hoy</p>
              <p class="text-xl font-bold text-gray-800">
                {{ formatDOP(summary.ventasHoy) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-clock text-yellow-600 text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Facturas Pendientes</p>
              <p class="text-xl font-bold text-gray-800">
                {{ summary.facturasPendientes }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-box text-orange-600 text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Productos Bajo Stock</p>
              <p class="text-xl font-bold text-gray-800">
                {{ summary.productosBajoStock }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-times-circle text-red-600 text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-500">e-CF Rechazados</p>
              <p class="text-xl font-bold text-gray-800">
                {{ summary.ecfRechazados }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Chart Placeholder -->
      <div class="xl:col-span-2">
        <Card class="shadow-sm">
          <template #title>
            <span class="text-lg">Ventas Recientes</span>
          </template>
          <template #content>
            <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div class="text-center text-gray-400">
                <i class="pi pi-chart-bar text-4xl mb-2" />
                <p>Gráfico de Ventas</p>
                <p class="text-xs">(Integrar con Chart.js o PrimeVue Chart)</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Alerts -->
      <div>
        <Card class="shadow-sm">
          <template #title>
            <span class="text-lg">Alertas</span>
          </template>
          <template #content>
            <div class="flex flex-col gap-3">
              <Message
                v-for="(alerta, index) in summary.alertas"
                :key="index"
                :severity="getAlertSeverity(alerta.severidad)"
                :closable="false"
              >
                <div class="flex items-center gap-2">
                  <i :class="getAlertIcon(alerta.tipo)" />
                  <span class="text-sm">{{ alerta.mensaje }}</span>
                </div>
              </Message>
              <p v-if="summary.alertas.length === 0" class="text-sm text-gray-400 text-center py-4">
                No hay alertas pendientes
              </p>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Recent Invoices -->
    <Card class="shadow-sm">
      <template #title>
        <div class="flex items-center justify-between">
          <span class="text-lg">Últimas Facturas</span>
          <NuxtLink to="/invoices">
            <Button label="Ver Todas" icon="pi pi-arrow-right" icon-pos="right" text size="small" />
          </NuxtLink>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="recentInvoices"
          :loading="loading"
          striped-rows
          responsive-layout="scroll"
          class="text-sm"
        >
          <Column field="encf" header="e-NCF" />
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">
              {{ new Date(data.fecha).toLocaleDateString('es-DO') }}
            </template>
          </Column>
          <Column field="cliente" header="Cliente" />
          <Column field="tipo" header="Tipo">
            <template #body="{ data }">
              <Tag :value="data.tipo" severity="info" />
            </template>
          </Column>
          <Column field="total" header="Total" class="text-right">
            <template #body="{ data }">
              {{ formatDOP(data.total) }}
            </template>
          </Column>
          <Column field="estadoDgii" header="Estado DGII">
            <template #body="{ data }">
              <Tag :value="data.estadoDgii" :severity="getStatusSeverity(data.estadoDgii)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
