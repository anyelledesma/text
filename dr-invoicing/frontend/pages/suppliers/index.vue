<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()

const loading = ref(true)
const suppliers = ref<any[]>([])
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
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  plazoCredito: 30,
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

const mockSuppliers = [
  { id: 1, rnc: '101000001', nombre: 'Papelera del Caribe SRL', tipo: 'juridica', tipoDocumento: 'RNC', contacto: 'Luis Ramírez', telefono: '809-555-0001', email: 'ventas@papeleracaribe.com.do', balance: 125000.0, activo: true },
  { id: 2, rnc: '130987654', nombre: 'Tecnología Global EIRL', tipo: 'juridica', tipoDocumento: 'RNC', contacto: 'Carmen Díaz', telefono: '809-555-0002', email: 'info@tecnoglobal.com.do', balance: 78500.0, activo: true },
  { id: 3, rnc: '101555888', nombre: 'Distribuidora Office Max SA', tipo: 'juridica', tipoDocumento: 'RNC', contacto: 'Pedro Matos', telefono: '809-555-0003', email: 'pedidos@officemax.com.do', balance: 340200.0, activo: true },
  { id: 4, rnc: '401222333', nombre: 'Importaciones del Este SRL', tipo: 'juridica', tipoDocumento: 'RNC', contacto: 'Rosa Fernández', telefono: '809-555-0004', email: 'compras@importeste.com.do', balance: 0, activo: true },
  { id: 5, rnc: '00187654321', nombre: 'Miguel Angel Suárez', tipo: 'fisica', tipoDocumento: 'Cédula', contacto: '', telefono: '849-555-0005', email: 'miguel.suarez@gmail.com', balance: 15000.0, activo: false },
]

const filteredSuppliers = computed(() => {
  if (!searchQuery.value) return suppliers.value
  const q = searchQuery.value.toLowerCase()
  return suppliers.value.filter(
    (s) =>
      s.nombre.toLowerCase().includes(q) ||
      s.rnc.includes(q) ||
      s.contacto?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q),
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

function openEditDialog(supplier: any) {
  form.value = { ...supplier }
  isEditing.value = true
  showDialog.value = true
}

async function saveSupplier() {
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
      await api.patch(`/suppliers/${form.value.id}`, form.value)
      showSuccess('Proveedor actualizado exitosamente')
    } else {
      await api.post('/suppliers', form.value)
      showSuccess('Proveedor creado exitosamente')
    }
    showDialog.value = false
    await fetchSuppliers()
  } catch (error: any) {
    showError(error?.message || 'Error al guardar el proveedor')
  } finally {
    saving.value = false
  }
}

async function fetchSuppliers() {
  loading.value = true
  try {
    const data = await api.get('/suppliers')
    suppliers.value = data as any[]
  } catch {
    suppliers.value = mockSuppliers
  } finally {
    loading.value = false
  }
}

onMounted(fetchSuppliers)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-bold">Proveedores</h1>
      <Button
        label="Nuevo Proveedor"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <!-- Search -->
    <Card class="shadow-sm">
      <template #content>
        <InputText
          v-model="searchQuery"
          placeholder="Buscar por nombre, RNC/Cédula, contacto o email..."
          class="w-full"
        />
      </template>
    </Card>

    <!-- Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredSuppliers"
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
              <i class="pi pi-truck text-4xl mb-2" />
              <p>No se encontraron proveedores</p>
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
          <Column field="contacto" header="Contacto" style="min-width: 160px" />
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
      :header="isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'"
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
            :placeholder="form.tipoDocumento === 'RNC' ? 'Ej: 101000001' : 'Ej: 00187654321'"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Nombre / Razón Social *</label>
          <InputText
            v-model="form.nombre"
            placeholder="Ej: Papelera del Caribe SRL"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Persona de Contacto</label>
          <InputText
            v-model="form.contacto"
            placeholder="Ej: Luis Ramírez"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Teléfono</label>
            <InputText
              v-model="form.telefono"
              placeholder="Ej: 809-555-0001"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Email</label>
            <InputText
              v-model="form.email"
              type="email"
              placeholder="Ej: ventas@empresa.com.do"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Dirección</label>
          <InputText
            v-model="form.direccion"
            placeholder="Ej: Calle El Sol #120, Zona Industrial de Herrera"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Ciudad</label>
            <InputText
              v-model="form.ciudad"
              placeholder="Ej: Santo Domingo Oeste"
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

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Plazo de Crédito</label>
          <InputNumber
            v-model="form.plazoCredito"
            :min="0"
            :max="180"
            suffix=" días"
            class="w-full"
            input-class="w-full"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="form.activo" :binary="true" input-id="supplierActive" />
          <label for="supplierActive" class="text-sm font-medium">Proveedor Activo</label>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showDialog = false" />
        <Button
          :label="isEditing ? 'Actualizar' : 'Crear'"
          icon="pi pi-check"
          :loading="saving"
          @click="saveSupplier"
        />
      </template>
    </Dialog>
  </div>
</template>
