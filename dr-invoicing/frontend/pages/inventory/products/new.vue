<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()
const router = useRouter()

const saving = ref(false)

const form = ref({
  nombre: '',
  sku: '',
  codigoBarras: '',
  descripcion: '',
  categoria: null as string | null,
  unidadMedida: null as string | null,
  tipoProducto: 'product' as 'product' | 'service',
  precioCosto: 0,
  precioVenta: 0,
  precioMinimoVenta: 0,
  tipoImpuesto: 18 as number,
  controlInventario: true,
  stockMinimo: 0,
  stockMaximo: 0,
})

const categoryOptions = [
  { label: 'Papelería', value: 'papeleria' },
  { label: 'Tecnología', value: 'tecnologia' },
  { label: 'Suministros', value: 'suministros' },
  { label: 'Mobiliario', value: 'mobiliario' },
  { label: 'Limpieza', value: 'limpieza' },
  { label: 'Servicios', value: 'servicios' },
  { label: 'Otros', value: 'otros' },
]

const unitOptions = [
  { label: 'Unidad', value: 'unit' },
  { label: 'Caja', value: 'box' },
  { label: 'Resma', value: 'ream' },
  { label: 'Paquete', value: 'pack' },
  { label: 'Galón', value: 'gallon' },
  { label: 'Libra', value: 'pound' },
  { label: 'Metro', value: 'meter' },
  { label: 'Servicio', value: 'service' },
]

const taxOptions = [
  { label: 'ITBIS 18%', value: 18 },
  { label: 'ITBIS 16%', value: 16 },
  { label: '0%', value: 0 },
  { label: 'Exento', value: -1 },
]

const productTypeOptions = [
  { label: 'Producto', value: 'product' },
  { label: 'Servicio', value: 'service' },
]

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

async function saveProduct() {
  if (!form.value.nombre.trim()) {
    showError('El nombre del producto es requerido')
    return
  }
  if (!form.value.sku.trim()) {
    showError('El SKU es requerido')
    return
  }
  if (form.value.precioVenta <= 0) {
    showError('El precio de venta debe ser mayor a cero')
    return
  }

  saving.value = true
  try {
    await api.post('/products', form.value)
    showSuccess('Producto creado exitosamente')
    router.push('/inventory/products')
  } catch (error: any) {
    showError(error?.message || 'Error al crear el producto')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.back()" />
      <h1 class="text-2xl font-bold">Nuevo Producto</h1>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Left Column - General Info -->
      <Card class="shadow-sm">
        <template #title>
          <span class="text-lg">Información General</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Nombre *</label>
              <InputText
                v-model="form.nombre"
                placeholder="Ej: Papel Bond A4 Resma 500 hojas"
                class="w-full"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">SKU *</label>
                <InputText
                  v-model="form.sku"
                  placeholder="Ej: PAP-001"
                  class="w-full"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Código de Barras</label>
                <InputText
                  v-model="form.codigoBarras"
                  placeholder="Ej: 7861234567890"
                  class="w-full"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Descripción</label>
              <Textarea
                v-model="form.descripcion"
                rows="3"
                placeholder="Descripción detallada del producto..."
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Categoría</label>
              <Dropdown
                v-model="form.categoria"
                :options="categoryOptions"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar categoría"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Unidad de Medida</label>
              <Dropdown
                v-model="form.unidadMedida"
                :options="unitOptions"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar unidad"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Tipo</label>
              <SelectButton
                v-model="form.tipoProducto"
                :options="productTypeOptions"
                option-label="label"
                option-value="value"
              />
            </div>

            <!-- Image Upload Placeholder -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Imagen</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i class="pi pi-image text-4xl text-gray-300 mb-2" />
                <p class="text-sm text-gray-400">
                  Arrastre una imagen o haga clic para seleccionar
                </p>
                <Button
                  label="Seleccionar Imagen"
                  icon="pi pi-upload"
                  outlined
                  size="small"
                  class="mt-3"
                  disabled
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Right Column - Pricing & Inventory -->
      <div class="flex flex-col gap-6">
        <Card class="shadow-sm">
          <template #title>
            <span class="text-lg">Precios e Impuestos</span>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Precio de Costo (DOP)</label>
                <InputNumber
                  v-model="form.precioCosto"
                  mode="currency"
                  currency="DOP"
                  locale="es-DO"
                  class="w-full"
                  input-class="w-full"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Precio de Venta (DOP) *</label>
                <InputNumber
                  v-model="form.precioVenta"
                  mode="currency"
                  currency="DOP"
                  locale="es-DO"
                  class="w-full"
                  input-class="w-full"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Precio Mínimo de Venta (DOP)</label>
                <InputNumber
                  v-model="form.precioMinimoVenta"
                  mode="currency"
                  currency="DOP"
                  locale="es-DO"
                  class="w-full"
                  input-class="w-full"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Tipo de Impuesto</label>
                <Dropdown
                  v-model="form.tipoImpuesto"
                  :options="taxOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div v-if="form.precioVenta > 0" class="bg-gray-50 rounded-lg p-3 text-sm">
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">Precio base</span>
                  <span class="font-mono">{{ formatDOP(form.precioVenta) }}</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">ITBIS ({{ form.tipoImpuesto > 0 ? form.tipoImpuesto + '%' : 'Exento' }})</span>
                  <span class="font-mono">
                    {{ formatDOP(form.tipoImpuesto > 0 ? form.precioVenta * (form.tipoImpuesto / 100) : 0) }}
                  </span>
                </div>
                <Divider />
                <div class="flex justify-between font-bold">
                  <span>Precio con ITBIS</span>
                  <span class="font-mono">
                    {{ formatDOP(form.precioVenta + (form.tipoImpuesto > 0 ? form.precioVenta * (form.tipoImpuesto / 100) : 0)) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="shadow-sm">
          <template #title>
            <span class="text-lg">Inventario</span>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Controlar Inventario</label>
                <ToggleButton
                  v-model="form.controlInventario"
                  on-label="Sí"
                  off-label="No"
                  on-icon="pi pi-check"
                  off-icon="pi pi-times"
                />
              </div>

              <template v-if="form.controlInventario">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium">Stock Mínimo</label>
                  <InputNumber
                    v-model="form.stockMinimo"
                    :min="0"
                    show-buttons
                    class="w-full"
                    input-class="w-full"
                  />
                  <small class="text-gray-500">Alerta cuando el stock baje de este nivel</small>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium">Stock Máximo</label>
                  <InputNumber
                    v-model="form.stockMaximo"
                    :min="0"
                    show-buttons
                    class="w-full"
                    input-class="w-full"
                  />
                </div>
              </template>

              <Message v-if="form.tipoProducto === 'service'" severity="info" :closable="false">
                Los servicios no requieren control de inventario.
              </Message>
            </div>
          </template>
        </Card>
      </div>
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
        label="Guardar Producto"
        icon="pi pi-save"
        :loading="saving"
        @click="saveProduct"
      />
    </div>
  </div>
</template>
