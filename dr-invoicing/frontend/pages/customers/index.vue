<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()

const loading = ref(true)
const customers = ref<any[]>([])
const searchQuery = ref('')
const showDialog = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const emptyForm = {
  id: null as number | null,
  rnc: '',
  nombre: '',
  tipo: 'juridica' as 'juridica' | 'fisica',
  tipoDocumento: 'RNC' as 'RNC' | 'Cédula' | 'Pasaporte',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  limiteCredito: 0,
  diasCredito: 30,
  activo: true,
}

const form = ref({ ...emptyForm })

const tipoOptions = [
  { label: 'Persona Jurídica', value: 'juridica' },
  { label: 'Persona Física', value: 'fisica' },
]

const documentTypeOptions = [
  { label: 'RNC', value: 'RNC' },
  { label: 'Cédula', value: 'Cédula' },
  { label: 'Pasaporte', value: 'Pasaporte' },
]

const provinceOptions = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia',
  'La Romana', 'San Pedro de Macorís', 'La Vega', 'Puerto Plata',
  'Duarte', 'San Cristóbal', 'Espaillat', 'San Juan',
]

const mockCustomers = [
  { id: 1, rnc: '101234567', nombre: 'Distribuidora Nacional SRL', tipo: 'juridica', tipoDocumento: 'RNC', telefono: '809-555-1234', email: 'compras@distrinacional.com.do', balance: 245000.0, activo: true },
  { id: 2, rnc: '131567890', nombre: 'Ferretería El Maestro EIRL', tipo: 'juridica', tipoDocumento: 'RNC', telefono: '809-555-5678', email: 'info@ferreteriaelmaestro.com.do', balance: 87500.0, activo: true },
  { id: 3, rnc: '00112345678', nombre: 'Juan Alejandro Pérez Gómez', tipo: 'fisica', tipoDocumento: 'Cédula', telefono: '809-555-9012', email: 'juan.perez@gmail.com', balance: 0, activo: true },
  { id: 4, rnc: '101987654', nombre: 'Supermercados Unidos SA', tipo: 'juridica', tipoDocumento: 'RNC', telefono: '809-555-3456', email: 'proveedor@superunidos.com.do', balance: 512300.0, activo: true },
  { id: 5, rnc: '401234567', nombre: 'Importadora del Caribe SRL', tipo: 'juridica', tipoDocumento: 'RNC', telefono: '809-555-7890', email: 'ventas@importcaribe.com.do', balance: 34200.0, activo: false },
  { id: 6, rnc: '00198765432', nombre: 'María Elena Santos Reyes', tipo: 'fisica', tipoDocumento: 'Cédula', telefono: '849-555-1111', email: 'maria.santos@hotmail.com', balance: 15000.0, activo: true },
]

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  const q = searchQuery.value.toLowerCase()
  return customers.value.filter(
    (c) =>
      c.nombre.toLowerCase().includes(q) ||
      c.rnc.includes(q) ||
      c.email?.toLowerCase().includes(q),
  )
})

function formatDOP(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(value)
}

function openNewDialog() {
  form.value = { ...emptyForm }
  isEditing.value = false
  showDialog.value = true
}

function openEditDialog(customer: any) {
  form.value = { ...customer }
  isEditing.value = true
  showDialog.value = true
}

async function saveCustomer() {
  if (!form.value.nombre.trim()) {
    showError('El nombre es requerido')
    return
  }
  if (!form.value.rnc.trim()) {
    showError('El RNC/Cédula es requerido')
    return
  }

  saving.value = true
  try {
    if (isEditing.value && form.value.id) {
      await api.patch(`/customers/${form.value.id}`, form.value)
      showSuccess('Cliente actualizado exitosamente')
    } else {
      await api.post('/customers', form.value)
      showSuccess('Cliente creado exitosamente')
    }
    showDialog.value = false
    await fetchCustomers()
  } catch (error: any) {
    showError(error?.message || 'Error al guardar el cliente')
  } finally {
    saving.value = false
  }
}

async function fetchCustomers() {
  loading.value = true
  try {
    const data = await api.get('/customers')
    customers.value = data as any[]
  } catch {
    customers.value = mockCustomers
  } finally {
    loading.value = false
  }
}

onMounted(fetchCustomers)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-bold">Clientes</h1>
      <Button
        label="Nuevo Cliente"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <!-- Search -->
    <Card class="shadow-sm">
      <template #content>
        <InputText
          v-model="searchQuery"
          placeholder="Buscar por nombre, RNC/Cédula o email..."
          class="w-full"
        />
      </template>
    </Card>

    <!-- Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredCustomers"
          :loading="loading"
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          row-hover
        >
          <template #empty>
            <div class="text-center py-8 text-gray-400">
              <i class="pi pi-users text-4xl mb-2" />
              <p>No se encontraron clientes</p>
            </div>
          </template>
          <Column field="rnc" header="RNC/Cédula" sortable style="min-width: 140px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.rnc }}</span>
            </template>
          </Column>
          <Column field="nombre" header="Nombre" sortable style="min-width: 220px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.nombre }}</span>
            </template>
          </Column>
          <Column field="tipoDocumento" header="Tipo" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="data.tipoDocumento" severity="info" />
            </template>
          </Column>
          <Column field="telefono" header="Teléfono" style="min-width: 140px" />
          <Column field="email" header="Email" style="min-width: 200px">
            <template #body="{ data }">
              <span class="text-sm">{{ data.email }}</span>
            </template>
          </Column>
          <Column field="balance" header="Balance" sortable style="min-width: 140px">
            <template #body="{ data }">
              <span
                class="font-semibold font-mono"
                :class="{ 'text-red-600': data.balance > 0 }"
              >
                {{ formatDOP(data.balance) }}
              </span>
            </template>
          </Column>
          <Column field="activo" header="Estado" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.activo ? 'Activo' : 'Inactivo'"
                :severity="data.activo ? 'success' : 'danger'"
              />
            </template>
          </Column>
          <Column header="Acciones" style="width: 80px">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click="openEditDialog(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'"
      :style="{ width: '600px' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Tipo de Persona</label>
            <Dropdown
              v-model="form.tipo"
              :options="tipoOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Tipo de Documento</label>
            <Dropdown
              v-model="form.tipoDocumento"
              :options="documentTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">{{ form.tipoDocumento }} *</label>
          <InputText
            v-model="form.rnc"
            :placeholder="form.tipoDocumento === 'RNC' ? 'Ej: 101234567' : 'Ej: 00112345678'"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Nombre / Razón Social *</label>
          <InputText
            v-model="form.nombre"
            placeholder="Ej: Distribuidora Nacional SRL"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Teléfono</label>
            <InputText
              v-model="form.telefono"
              placeholder="Ej: 809-555-1234"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Email</label>
            <InputText
              v-model="form.email"
              type="email"
              placeholder="Ej: contacto@empresa.com.do"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Dirección</label>
          <InputText
            v-model="form.direccion"
            placeholder="Ej: Av. Winston Churchill #45, Ens. Piantini"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Ciudad</label>
            <InputText
              v-model="form.ciudad"
              placeholder="Ej: Santo Domingo"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Provincia</label>
            <Dropdown
              v-model="form.provincia"
              :options="provinceOptions"
              placeholder="Seleccionar provincia"
              editable
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Límite de Crédito (DOP)</label>
            <InputNumber
              v-model="form.limiteCredito"
              mode="currency"
              currency="DOP"
              locale="es-DO"
              class="w-full"
              input-class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Días de Crédito</label>
            <InputNumber
              v-model="form.diasCredito"
              :min="0"
              :max="180"
              suffix=" días"
              class="w-full"
              input-class="w-full"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="form.activo" :binary="true" input-id="active" />
          <label for="active" class="text-sm font-medium">Cliente Activo</label>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showDialog = false" />
        <Button
          :label="isEditing ? 'Actualizar' : 'Crear'"
          icon="pi pi-check"
          :loading="saving"
          @click="saveCustomer"
        />
      </template>
    </Dialog>
  </div>
</template>
