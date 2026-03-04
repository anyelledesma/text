<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInvoiceStore } from '~/stores/invoice'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const invoiceStore = useInvoiceStore()
const api = useApi()
const { showSuccess, showError } = useToastMessage()
const router = useRouter()

interface InvoiceItem {
  id: number
  productId: number | null
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  itbisPercent: number
  subtotal: number
}

const ecfTypeOptions = [
  { label: 'E31 — Crédito Fiscal', value: 'E31' },
  { label: 'E32 — Consumo', value: 'E32' },
]

const paymentMethodOptions = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Cheque', value: 'check' },
  { label: 'Transferencia Bancaria', value: 'transfer' },
  { label: 'Tarjeta de Crédito/Débito', value: 'card' },
  { label: 'Crédito', value: 'credit' },
]

const branchOptions = ref([
  { label: 'Sede Principal — Santo Domingo', value: 1 },
  { label: 'Sucursal Santiago', value: 2 },
  { label: 'Sucursal La Romana', value: 3 },
])

const ecfType = ref('E31')
const selectedCustomer = ref<any>(null)
const selectedBranch = ref<number | null>(1)
const paymentMethod = ref('cash')
const notes = ref('')
const customerSearch = ref('')
const customerSuggestions = ref<any[]>([])
const items = ref<InvoiceItem[]>([
  createEmptyItem(),
])
const productSuggestions = ref<any[]>([])
const saving = ref(false)
let itemIdCounter = 1

function createEmptyItem(): InvoiceItem {
  return {
    id: itemIdCounter++,
    productId: null,
    productName: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    itbisPercent: 18,
    subtotal: 0,
  }
}

function calculateItemSubtotal(item: InvoiceItem): number {
  const base = item.quantity * item.unitPrice
  const discount = base * (item.discountPercent / 100)
  return base - discount
}

watch(items, () => {
  items.value.forEach((item) => {
    item.subtotal = calculateItemSubtotal(item)
  })
}, { deep: true })

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + calculateItemSubtotal(item), 0),
)

const totalDescuento = computed(() =>
  items.value.reduce((sum, item) => {
    const base = item.quantity * item.unitPrice
    return sum + base * (item.discountPercent / 100)
  }, 0),
)

const totalItbis18 = computed(() =>
  items.value
    .filter((item) => item.itbisPercent === 18)
    .reduce((sum, item) => sum + calculateItemSubtotal(item) * 0.18, 0),
)

const totalItbis16 = computed(() =>
  items.value
    .filter((item) => item.itbisPercent === 16)
    .reduce((sum, item) => sum + calculateItemSubtotal(item) * 0.16, 0),
)

const total = computed(() => subtotal.value + totalItbis18.value + totalItbis16.value)

const isCustomerRequired = computed(() => ecfType.value === 'E31')

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function addItem() {
  items.value.push(createEmptyItem())
}

function removeItem(index: number) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

async function searchCustomers(event: { query: string }) {
  try {
    const data = await api.get(`/customers?search=${encodeURIComponent(event.query)}`)
    customerSuggestions.value = (data as any[]) || []
  } catch {
    customerSuggestions.value = [
      { id: 1, nombre: 'Distribuidora Nacional SRL', rnc: '101234567', tipo: 'RNC' },
      { id: 2, nombre: 'Ferretería El Maestro EIRL', rnc: '131567890', tipo: 'RNC' },
      { id: 3, nombre: 'Juan Pérez', rnc: '00112345678', tipo: 'Cédula' },
    ].filter((c) => c.nombre.toLowerCase().includes(event.query.toLowerCase()))
  }
}

async function searchProducts(event: { query: string }, index: number) {
  try {
    const data = await api.get(`/products?search=${encodeURIComponent(event.query)}`)
    productSuggestions.value = (data as any[]) || []
  } catch {
    productSuggestions.value = [
      { id: 1, nombre: 'Papel Bond A4 Resma', sku: 'PAP-001', precio: 385.0, itbis: 18 },
      { id: 2, nombre: 'Tóner HP 26A Original', sku: 'TON-026A', precio: 4250.0, itbis: 18 },
      { id: 3, nombre: 'Resaltador Amarillo', sku: 'RES-001', precio: 75.0, itbis: 18 },
      { id: 4, nombre: 'Servicio de Impresión', sku: 'SRV-001', precio: 1500.0, itbis: 18 },
    ].filter((p) => p.nombre.toLowerCase().includes(event.query.toLowerCase()))
  }
}

function onProductSelect(event: any, index: number) {
  const product = event.value
  items.value[index].productId = product.id
  items.value[index].productName = product.nombre
  items.value[index].unitPrice = product.precio
  items.value[index].itbisPercent = product.itbis ?? 18
}

async function saveInvoice(emit: boolean) {
  if (isCustomerRequired.value && !selectedCustomer.value) {
    showError('Debe seleccionar un cliente para facturas de Crédito Fiscal (E31)')
    return
  }

  if (items.value.every((item) => !item.productId)) {
    showError('Debe agregar al menos un producto')
    return
  }

  saving.value = true
  try {
    const payload = {
      ecfType: ecfType.value,
      customerId: selectedCustomer.value?.id || null,
      branchId: selectedBranch.value,
      paymentMethod: paymentMethod.value,
      notes: notes.value,
      status: emit ? 'issued' : 'draft',
      items: items.value
        .filter((item) => item.productId)
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          itbisPercent: item.itbisPercent,
        })),
    }

    await invoiceStore.createInvoice(payload)
    showSuccess(emit ? 'Factura emitida exitosamente' : 'Borrador guardado exitosamente')
    router.push('/invoices')
  } catch (error: any) {
    showError(error?.message || 'Error al guardar la factura')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="router.back()" />
        <h1 class="text-2xl font-bold">Nueva Factura</h1>
      </div>
    </div>

    <!-- Invoice Header -->
    <Card class="shadow-sm">
      <template #title>
        <span class="text-lg">Datos de la Factura</span>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Tipo de Comprobante *</label>
            <Dropdown
              v-model="ecfType"
              :options="ecfTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">
              Cliente {{ isCustomerRequired ? '*' : '(Opcional)' }}
            </label>
            <AutoComplete
              v-model="selectedCustomer"
              :suggestions="customerSuggestions"
              option-label="nombre"
              placeholder="Buscar por nombre o RNC..."
              dropdown
              force-selection
              class="w-full"
              @complete="searchCustomers"
            >
              <template #option="{ option }">
                <div class="flex flex-col">
                  <span class="font-medium">{{ option.nombre }}</span>
                  <span class="text-xs text-gray-500">{{ option.tipo }}: {{ option.rnc }}</span>
                </div>
              </template>
            </AutoComplete>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Sucursal</label>
            <Dropdown
              v-model="selectedBranch"
              :options="branchOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Items Table -->
    <Card class="shadow-sm">
      <template #title>
        <div class="flex items-center justify-between">
          <span class="text-lg">Artículos</span>
          <Button
            label="Agregar Artículo"
            icon="pi pi-plus"
            size="small"
            outlined
            @click="addItem"
          />
        </div>
      </template>
      <template #content>
        <DataTable :value="items" responsive-layout="scroll" class="text-sm">
          <Column header="Producto" style="min-width: 250px">
            <template #body="{ data, index }">
              <AutoComplete
                v-model="data.productName"
                :suggestions="productSuggestions"
                option-label="nombre"
                placeholder="Buscar producto..."
                class="w-full"
                @complete="searchProducts($event, index)"
                @item-select="onProductSelect($event, index)"
              >
                <template #option="{ option }">
                  <div class="flex justify-between w-full">
                    <div>
                      <span class="font-medium">{{ option.nombre }}</span>
                      <span class="text-xs text-gray-500 ml-2">{{ option.sku }}</span>
                    </div>
                    <span class="font-mono text-sm">{{ formatDOP(option.precio) }}</span>
                  </div>
                </template>
              </AutoComplete>
            </template>
          </Column>
          <Column header="Cantidad" style="min-width: 100px">
            <template #body="{ data }">
              <InputNumber
                v-model="data.quantity"
                :min="1"
                show-buttons
                button-layout="horizontal"
                :step="1"
                class="w-full"
                input-class="w-16 text-center"
              >
                <template #incrementbuttonicon>
                  <i class="pi pi-plus text-xs" />
                </template>
                <template #decrementbuttonicon>
                  <i class="pi pi-minus text-xs" />
                </template>
              </InputNumber>
            </template>
          </Column>
          <Column header="Precio Unit." style="min-width: 140px">
            <template #body="{ data }">
              <InputNumber
                v-model="data.unitPrice"
                mode="currency"
                currency="DOP"
                locale="es-DO"
                class="w-full"
                input-class="w-full"
              />
            </template>
          </Column>
          <Column header="Desc. %" style="min-width: 100px">
            <template #body="{ data }">
              <InputNumber
                v-model="data.discountPercent"
                suffix="%"
                :min="0"
                :max="100"
                class="w-full"
                input-class="w-full"
              />
            </template>
          </Column>
          <Column header="ITBIS %" style="min-width: 110px">
            <template #body="{ data }">
              <Dropdown
                v-model="data.itbisPercent"
                :options="[
                  { label: '18%', value: 18 },
                  { label: '16%', value: 16 },
                  { label: '0%', value: 0 },
                ]"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </template>
          </Column>
          <Column header="Subtotal" style="min-width: 130px">
            <template #body="{ data }">
              <span class="font-semibold font-mono">
                {{ formatDOP(calculateItemSubtotal(data)) }}
              </span>
            </template>
          </Column>
          <Column header="" style="width: 60px">
            <template #body="{ index }">
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                size="small"
                :disabled="items.length <= 1"
                @click="removeItem(index)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Totals & Payment -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Payment & Notes -->
      <Card class="shadow-sm">
        <template #title>
          <span class="text-lg">Pago y Notas</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Forma de Pago</label>
              <Dropdown
                v-model="paymentMethod"
                :options="paymentMethodOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Notas</label>
              <Textarea
                v-model="notes"
                rows="4"
                placeholder="Observaciones adicionales..."
                class="w-full"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Totals -->
      <Card class="shadow-sm">
        <template #title>
          <span class="text-lg">Resumen</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-mono">{{ formatDOP(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Descuento</span>
              <span class="font-mono text-red-500">-{{ formatDOP(totalDescuento) }}</span>
            </div>
            <Divider />
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">ITBIS 18%</span>
              <span class="font-mono">{{ formatDOP(totalItbis18) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">ITBIS 16%</span>
              <span class="font-mono">{{ formatDOP(totalItbis16) }}</span>
            </div>
            <Divider />
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span class="font-mono text-green-700">{{ formatDOP(total) }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3">
      <Button
        label="Cancelar"
        severity="secondary"
        outlined
        @click="router.back()"
      />
      <Button
        label="Guardar Borrador"
        icon="pi pi-save"
        severity="secondary"
        :loading="saving"
        @click="saveInvoice(false)"
      />
      <Button
        label="Emitir Factura"
        icon="pi pi-send"
        :loading="saving"
        @click="saveInvoice(true)"
      />
    </div>
  </div>
</template>
