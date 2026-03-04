<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()
const route = useRoute()
const router = useRouter()

const invoiceId = route.params.id as string
const loading = ref(true)
const sendingToDgii = ref(false)
const cancelling = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('')

interface InvoiceDetail {
  id: number
  encf: string
  fecha: string
  tipo: string
  status: string
  cliente: {
    id: number
    nombre: string
    rnc: string
    tipo: string
    direccion: string
    telefono: string
    email: string
  }
  sucursal: string
  items: {
    producto: string
    sku: string
    cantidad: number
    precioUnitario: number
    descuento: number
    itbis: number
    subtotal: number
  }[]
  subtotal: number
  descuento: number
  itbis18: number
  itbis16: number
  total: number
  formaPago: string
  notas: string
  dgii: {
    trackId: string
    estado: string
    fechaEnvio: string | null
    fechaRespuesta: string | null
    codigoRespuesta: string | null
    mensajeRespuesta: string | null
  }
  pagos: {
    fecha: string
    monto: number
    metodo: string
    referencia: string
  }[]
}

const invoice = ref<InvoiceDetail | null>(null)

const mockInvoice: InvoiceDetail = {
  id: Number(invoiceId),
  encf: 'E310000000001',
  fecha: '2026-03-04T10:30:00',
  tipo: 'E31',
  status: 'accepted',
  cliente: {
    id: 1,
    nombre: 'Distribuidora Nacional SRL',
    rnc: '101234567',
    tipo: 'RNC',
    direccion: 'Av. Winston Churchill #45, Ens. Piantini, Santo Domingo',
    telefono: '809-555-1234',
    email: 'compras@distrinacional.com.do',
  },
  sucursal: 'Sede Principal — Santo Domingo',
  items: [
    { producto: 'Papel Bond A4 Resma', sku: 'PAP-001', cantidad: 50, precioUnitario: 385.0, descuento: 5, itbis: 18, subtotal: 18287.5 },
    { producto: 'Tóner HP 26A Original', sku: 'TON-026A', cantidad: 10, precioUnitario: 4250.0, descuento: 0, itbis: 18, subtotal: 42500.0 },
    { producto: 'Resaltador Amarillo', sku: 'RES-001', cantidad: 100, precioUnitario: 75.0, descuento: 10, itbis: 18, subtotal: 6750.0 },
  ],
  subtotal: 67537.5,
  descuento: 2687.5,
  itbis18: 12156.75,
  itbis16: 0,
  total: 79694.25,
  formaPago: 'Crédito',
  notas: 'Entrega en almacén principal. Plazo de crédito: 30 días.',
  dgii: {
    trackId: 'TRK-2026030400001',
    estado: 'Aceptado',
    fechaEnvio: '2026-03-04T10:31:00',
    fechaRespuesta: '2026-03-04T10:31:45',
    codigoRespuesta: '0',
    mensajeRespuesta: 'Comprobante recibido y aprobado satisfactoriamente.',
  },
  pagos: [
    { fecha: '2026-03-04', monto: 79694.25, metodo: 'Crédito', referencia: 'CRED-00145' },
  ],
}

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusSeverity(status: string): string {
  const map: Record<string, string> = {
    accepted: 'success',
    Aceptado: 'success',
    issued: 'warn',
    Pendiente: 'warn',
    draft: 'secondary',
    rejected: 'danger',
    Rechazado: 'danger',
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

const canSendToDgii = computed(() => {
  const s = invoice.value?.status
  return s === 'draft' || s === 'issued'
})

const canCancel = computed(() => {
  const s = invoice.value?.status
  return s !== 'cancelled'
})

async function sendToDgii() {
  sendingToDgii.value = true
  try {
    await api.post(`/invoices/${invoiceId}/send-dgii`, {})
    showSuccess('Factura enviada a la DGII exitosamente')
    await fetchInvoice()
  } catch (error: any) {
    showError(error?.message || 'Error al enviar a la DGII')
  } finally {
    sendingToDgii.value = false
  }
}

async function cancelInvoice() {
  if (!cancelReason.value.trim()) {
    showError('Debe indicar el motivo de anulación')
    return
  }
  cancelling.value = true
  try {
    await api.post(`/invoices/${invoiceId}/cancel`, { reason: cancelReason.value })
    showSuccess('Factura anulada exitosamente')
    showCancelDialog.value = false
    await fetchInvoice()
  } catch (error: any) {
    showError(error?.message || 'Error al anular la factura')
  } finally {
    cancelling.value = false
  }
}

function printInvoice() {
  window.print()
}

async function fetchInvoice() {
  loading.value = true
  try {
    const data = await api.get(`/invoices/${invoiceId}`)
    invoice.value = data as InvoiceDetail
  } catch {
    invoice.value = mockInvoice
  } finally {
    loading.value = false
  }
}

onMounted(fetchInvoice)
</script>

<template>
  <div class="flex flex-col gap-6">
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 4px" />

    <template v-if="invoice">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <Button icon="pi pi-arrow-left" text rounded @click="router.push('/invoices')" />
          <div>
            <h1 class="text-2xl font-bold font-mono">{{ invoice.encf }}</h1>
            <p class="text-sm text-gray-500">{{ formatDate(invoice.fecha) }}</p>
          </div>
          <Tag
            :value="getStatusLabel(invoice.status)"
            :severity="getStatusSeverity(invoice.status)"
            class="text-sm"
          />
        </div>
        <div class="flex gap-2">
          <Button
            v-if="canSendToDgii"
            label="Enviar a DGII"
            icon="pi pi-send"
            :loading="sendingToDgii"
            @click="sendToDgii"
          />
          <Button
            label="Imprimir"
            icon="pi pi-print"
            severity="secondary"
            outlined
            @click="printInvoice"
          />
          <Button
            v-if="canCancel"
            label="Anular"
            icon="pi pi-ban"
            severity="danger"
            outlined
            @click="showCancelDialog = true"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="xl:col-span-2 flex flex-col gap-6">
          <!-- Customer Info -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Cliente</span>
            </template>
            <template #content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-500">Nombre / Razón Social</p>
                  <p class="font-semibold">{{ invoice.cliente.nombre }}</p>
                </div>
                <div>
                  <p class="text-gray-500">{{ invoice.cliente.tipo }}</p>
                  <p class="font-semibold font-mono">{{ invoice.cliente.rnc }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Dirección</p>
                  <p>{{ invoice.cliente.direccion }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Contacto</p>
                  <p>{{ invoice.cliente.telefono }}</p>
                  <p>{{ invoice.cliente.email }}</p>
                </div>
              </div>
            </template>
          </Card>

          <!-- Items -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Artículos</span>
            </template>
            <template #content>
              <DataTable :value="invoice.items" responsive-layout="scroll" class="text-sm">
                <Column field="producto" header="Producto">
                  <template #body="{ data }">
                    <div>
                      <p class="font-medium">{{ data.producto }}</p>
                      <p class="text-xs text-gray-500">{{ data.sku }}</p>
                    </div>
                  </template>
                </Column>
                <Column field="cantidad" header="Cant." style="width: 80px" />
                <Column field="precioUnitario" header="Precio Unit.">
                  <template #body="{ data }">
                    {{ formatDOP(data.precioUnitario) }}
                  </template>
                </Column>
                <Column field="descuento" header="Desc. %">
                  <template #body="{ data }">
                    {{ data.descuento }}%
                  </template>
                </Column>
                <Column field="itbis" header="ITBIS %">
                  <template #body="{ data }">
                    {{ data.itbis }}%
                  </template>
                </Column>
                <Column field="subtotal" header="Subtotal" class="text-right">
                  <template #body="{ data }">
                    <span class="font-semibold">{{ formatDOP(data.subtotal) }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

          <!-- Payments -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Pagos</span>
            </template>
            <template #content>
              <DataTable :value="invoice.pagos" responsive-layout="scroll" class="text-sm">
                <Column field="fecha" header="Fecha">
                  <template #body="{ data }">
                    {{ new Date(data.fecha).toLocaleDateString('es-DO') }}
                  </template>
                </Column>
                <Column field="metodo" header="Método" />
                <Column field="referencia" header="Referencia">
                  <template #body="{ data }">
                    <span class="font-mono text-sm">{{ data.referencia }}</span>
                  </template>
                </Column>
                <Column field="monto" header="Monto" class="text-right">
                  <template #body="{ data }">
                    <span class="font-semibold">{{ formatDOP(data.monto) }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-6">
          <!-- Totals -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Totales</span>
            </template>
            <template #content>
              <div class="flex flex-col gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-mono">{{ formatDOP(invoice.subtotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Descuento</span>
                  <span class="font-mono text-red-500">-{{ formatDOP(invoice.descuento) }}</span>
                </div>
                <Divider />
                <div class="flex justify-between">
                  <span class="text-gray-600">ITBIS 18%</span>
                  <span class="font-mono">{{ formatDOP(invoice.itbis18) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ITBIS 16%</span>
                  <span class="font-mono">{{ formatDOP(invoice.itbis16) }}</span>
                </div>
                <Divider />
                <div class="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span class="font-mono text-green-700">{{ formatDOP(invoice.total) }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- DGII Status -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Estado DGII</span>
            </template>
            <template #content>
              <div class="flex flex-col gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Track ID</p>
                  <p class="font-mono font-medium">{{ invoice.dgii.trackId || '—' }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Estado</p>
                  <Tag
                    :value="invoice.dgii.estado"
                    :severity="getStatusSeverity(invoice.dgii.estado)"
                  />
                </div>
                <div>
                  <p class="text-gray-500">Fecha Envío</p>
                  <p>{{ formatDate(invoice.dgii.fechaEnvio) }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Fecha Respuesta</p>
                  <p>{{ formatDate(invoice.dgii.fechaRespuesta) }}</p>
                </div>
                <div v-if="invoice.dgii.codigoRespuesta">
                  <p class="text-gray-500">Código Respuesta</p>
                  <p class="font-mono">{{ invoice.dgii.codigoRespuesta }}</p>
                </div>
                <div v-if="invoice.dgii.mensajeRespuesta">
                  <p class="text-gray-500">Mensaje</p>
                  <p class="text-xs">{{ invoice.dgii.mensajeRespuesta }}</p>
                </div>
              </div>
            </template>
          </Card>

          <!-- Info -->
          <Card class="shadow-sm">
            <template #title>
              <span class="text-lg">Información</span>
            </template>
            <template #content>
              <div class="flex flex-col gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Tipo Comprobante</p>
                  <p class="font-medium">{{ invoice.tipo }} — {{ invoice.tipo === 'E31' ? 'Crédito Fiscal' : 'Consumo' }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Sucursal</p>
                  <p>{{ invoice.sucursal }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Forma de Pago</p>
                  <p>{{ invoice.formaPago }}</p>
                </div>
                <div v-if="invoice.notas">
                  <p class="text-gray-500">Notas</p>
                  <p class="text-xs">{{ invoice.notas }}</p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </template>

    <!-- Cancel Dialog -->
    <Dialog
      v-model:visible="showCancelDialog"
      header="Anular Factura"
      :style="{ width: '450px' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <Message severity="warn" :closable="false">
          Esta acción no se puede deshacer. Se generará un e-CF de anulación ante la DGII.
        </Message>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Motivo de Anulación *</label>
          <Textarea
            v-model="cancelReason"
            rows="3"
            placeholder="Indique el motivo de la anulación..."
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showCancelDialog = false" />
        <Button
          label="Confirmar Anulación"
          severity="danger"
          icon="pi pi-ban"
          :loading="cancelling"
          @click="cancelInvoice"
        />
      </template>
    </Dialog>
  </div>
</template>
