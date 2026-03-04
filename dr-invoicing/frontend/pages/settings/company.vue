<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToastMessage } from '~/composables/useToastMessage'

const api = useApi()
const { showSuccess, showError } = useToastMessage()

const loading = ref(true)
const savingCompany = ref(false)
const savingEcf = ref(false)
const showBranchDialog = ref(false)
const savingBranch = ref(false)
const isEditingBranch = ref(false)

const company = ref({
  rnc: '',
  razonSocial: '',
  nombreComercial: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  telefono: '',
  email: '',
  web: '',
  actividadEconomica: '',
  regimen: 'ordinario' as string,
})

const ecfConfig = ref({
  ambiente: 'test' as 'test' | 'production',
  certificadoNombre: '',
  certificadoVigencia: '',
  urlAutorizacion: '',
  urlRecepcion: '',
  urlConsulta: '',
})

const branches = ref<any[]>([])

const emptyBranch = {
  id: null as number | null,
  nombre: '',
  codigo: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  telefono: '',
  email: '',
  activa: true,
}

const branchForm = ref({ ...emptyBranch })

const ambienteOptions = [
  { label: 'Pruebas (TesteCF)', value: 'test' },
  { label: 'Producción', value: 'production' },
]

const regimenOptions = [
  { label: 'Régimen Ordinario', value: 'ordinario' },
  { label: 'Régimen Simplificado de Tributación (RST)', value: 'rst' },
]

const provinceOptions = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia',
  'La Romana', 'San Pedro de Macorís', 'La Vega', 'Puerto Plata',
  'Duarte', 'San Cristóbal', 'Espaillat', 'San Juan', 'Azua',
  'Barahona', 'Monte Cristi', 'Peravia', 'Valverde', 'Monseñor Nouel',
  'María Trinidad Sánchez', 'Samaná', 'Sánchez Ramírez', 'Hermanas Mirabal',
]

const mockCompany = {
  rnc: '101234567',
  razonSocial: 'Comercializadora Dominicana de Suministros SRL',
  nombreComercial: 'Suministros RD',
  direccion: 'Av. Abraham Lincoln #456, Torre Empresarial, Piso 8',
  ciudad: 'Santo Domingo',
  provincia: 'Distrito Nacional',
  telefono: '809-555-8000',
  email: 'info@suministrosrd.com.do',
  web: 'www.suministrosrd.com.do',
  actividadEconomica: 'Comercio al por mayor de artículos de oficina',
  regimen: 'ordinario',
}

const mockEcfConfig = {
  ambiente: 'test' as const,
  certificadoNombre: 'certificado_ecf_2026.p12',
  certificadoVigencia: '2027-06-15',
  urlAutorizacion: 'https://ecf.dgii.gov.do/TesteCF/AutorizacionComprobantes',
  urlRecepcion: 'https://ecf.dgii.gov.do/TesteCF/RecepcionComprobantes',
  urlConsulta: 'https://ecf.dgii.gov.do/TesteCF/ConsultaComprobantes',
}

const mockBranches = [
  { id: 1, nombre: 'Sede Principal', codigo: '001', direccion: 'Av. Abraham Lincoln #456', ciudad: 'Santo Domingo', provincia: 'Distrito Nacional', telefono: '809-555-8000', email: 'principal@suministrosrd.com.do', activa: true },
  { id: 2, nombre: 'Sucursal Santiago', codigo: '002', direccion: 'Av. Juan Pablo Duarte #78', ciudad: 'Santiago de los Caballeros', provincia: 'Santiago', telefono: '809-555-8001', email: 'santiago@suministrosrd.com.do', activa: true },
  { id: 3, nombre: 'Sucursal La Romana', codigo: '003', direccion: 'Calle Santa Rosa #12', ciudad: 'La Romana', provincia: 'La Romana', telefono: '809-555-8002', email: 'laromana@suministrosrd.com.do', activa: true },
]

async function saveCompany() {
  if (!company.value.rnc.trim() || !company.value.razonSocial.trim()) {
    showError('El RNC y la razón social son requeridos')
    return
  }

  savingCompany.value = true
  try {
    await api.patch('/settings/company', company.value)
    showSuccess('Datos de la empresa actualizados exitosamente')
  } catch (error: any) {
    showError(error?.message || 'Error al guardar los datos de la empresa')
  } finally {
    savingCompany.value = false
  }
}

async function saveEcfConfig() {
  savingEcf.value = true
  try {
    await api.patch('/settings/ecf', ecfConfig.value)
    showSuccess('Configuración e-CF actualizada exitosamente')
  } catch (error: any) {
    showError(error?.message || 'Error al guardar la configuración e-CF')
  } finally {
    savingEcf.value = false
  }
}

function openNewBranchDialog() {
  branchForm.value = { ...emptyBranch }
  isEditingBranch.value = false
  showBranchDialog.value = true
}

function openEditBranchDialog(branch: any) {
  branchForm.value = { ...branch }
  isEditingBranch.value = true
  showBranchDialog.value = true
}

async function saveBranch() {
  if (!branchForm.value.nombre.trim() || !branchForm.value.codigo.trim()) {
    showError('El nombre y código de la sucursal son requeridos')
    return
  }

  savingBranch.value = true
  try {
    if (isEditingBranch.value && branchForm.value.id) {
      await api.patch(`/settings/branches/${branchForm.value.id}`, branchForm.value)
      showSuccess('Sucursal actualizada exitosamente')
    } else {
      await api.post('/settings/branches', branchForm.value)
      showSuccess('Sucursal creada exitosamente')
    }
    showBranchDialog.value = false
    await fetchData()
  } catch (error: any) {
    showError(error?.message || 'Error al guardar la sucursal')
  } finally {
    savingBranch.value = false
  }
}

async function fetchData() {
  loading.value = true
  try {
    const [companyData, ecfData, branchData] = await Promise.all([
      api.get('/settings/company'),
      api.get('/settings/ecf'),
      api.get('/settings/branches'),
    ])
    company.value = companyData as typeof company.value
    ecfConfig.value = ecfData as typeof ecfConfig.value
    branches.value = branchData as any[]
  } catch {
    company.value = mockCompany
    ecfConfig.value = mockEcfConfig
    branches.value = mockBranches
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Configuración de la Empresa</h1>

    <ProgressBar v-if="loading" mode="indeterminate" style="height: 4px" />

    <!-- Company Info -->
    <Card class="shadow-sm">
      <template #title>
        <span class="text-lg">Datos de la Empresa</span>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">RNC *</label>
              <InputText
                v-model="company.rnc"
                placeholder="Ej: 101234567"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Régimen Tributario</label>
              <Dropdown
                v-model="company.regimen"
                :options="regimenOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Razón Social *</label>
            <InputText
              v-model="company.razonSocial"
              placeholder="Ej: Comercializadora Dominicana de Suministros SRL"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Nombre Comercial</label>
            <InputText
              v-model="company.nombreComercial"
              placeholder="Ej: Suministros RD"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Dirección</label>
            <InputText
              v-model="company.direccion"
              placeholder="Ej: Av. Abraham Lincoln #456, Torre Empresarial, Piso 8"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Ciudad</label>
              <InputText
                v-model="company.ciudad"
                placeholder="Ej: Santo Domingo"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Provincia</label>
              <Dropdown
                v-model="company.provincia"
                :options="provinceOptions"
                placeholder="Seleccionar provincia"
                editable
                class="w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Teléfono</label>
              <InputText
                v-model="company.telefono"
                placeholder="Ej: 809-555-8000"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Email</label>
              <InputText
                v-model="company.email"
                type="email"
                placeholder="Ej: info@empresa.com.do"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">Sitio Web</label>
              <InputText
                v-model="company.web"
                placeholder="Ej: www.empresa.com.do"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Actividad Económica</label>
            <InputText
              v-model="company.actividadEconomica"
              placeholder="Ej: Comercio al por mayor de artículos de oficina"
              class="w-full"
            />
          </div>

          <div class="flex justify-end">
            <Button
              label="Guardar Datos"
              icon="pi pi-save"
              :loading="savingCompany"
              @click="saveCompany"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- e-CF Configuration -->
    <Card class="shadow-sm">
      <template #title>
        <span class="text-lg">Configuración e-CF (Facturación Electrónica)</span>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Ambiente</label>
            <Dropdown
              v-model="ecfConfig.ambiente"
              :options="ambienteOptions"
              option-label="label"
              option-value="value"
              class="w-full md:w-1/2"
            />
            <small class="text-gray-500">
              Seleccione "Pruebas" para el ambiente de certificación de la DGII o "Producción" para envíos reales.
            </small>
          </div>

          <Message
            v-if="ecfConfig.ambiente === 'test'"
            severity="warn"
            :closable="false"
          >
            Ambiente de pruebas activo. Los e-CF se enviarán al servidor TesteCF de la DGII.
          </Message>

          <Divider />

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Certificado Digital</label>
            <div class="flex items-center gap-4">
              <div class="border rounded-lg p-4 flex-1">
                <div v-if="ecfConfig.certificadoNombre" class="flex items-center gap-3">
                  <i class="pi pi-lock text-green-600 text-xl" />
                  <div>
                    <p class="font-medium text-sm">{{ ecfConfig.certificadoNombre }}</p>
                    <p class="text-xs text-gray-500">
                      Vigencia hasta: {{ ecfConfig.certificadoVigencia }}
                    </p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 text-gray-400">
                  <i class="pi pi-lock text-xl" />
                  <p class="text-sm">No hay certificado cargado</p>
                </div>
              </div>
              <Button
                label="Cargar Certificado"
                icon="pi pi-upload"
                outlined
                disabled
              />
            </div>
            <small class="text-gray-500">
              Certificado digital (.p12) emitido por la DGII para firma de comprobantes electrónicos.
            </small>
          </div>

          <Divider />

          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">URL Autorización</label>
              <InputText
                v-model="ecfConfig.urlAutorizacion"
                class="w-full font-mono text-sm"
                disabled
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">URL Recepción</label>
              <InputText
                v-model="ecfConfig.urlRecepcion"
                class="w-full font-mono text-sm"
                disabled
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium">URL Consulta</label>
              <InputText
                v-model="ecfConfig.urlConsulta"
                class="w-full font-mono text-sm"
                disabled
              />
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              label="Guardar Configuración e-CF"
              icon="pi pi-save"
              :loading="savingEcf"
              @click="saveEcfConfig"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Branches -->
    <Card class="shadow-sm">
      <template #title>
        <div class="flex items-center justify-between">
          <span class="text-lg">Sucursales</span>
          <Button
            label="Nueva Sucursal"
            icon="pi pi-plus"
            size="small"
            @click="openNewBranchDialog"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="branches"
          responsive-layout="scroll"
          striped-rows
          class="text-sm"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-400">
              <i class="pi pi-building text-4xl mb-2" />
              <p>No hay sucursales registradas</p>
            </div>
          </template>
          <Column field="codigo" header="Código" style="width: 90px">
            <template #body="{ data }">
              <span class="font-mono">{{ data.codigo }}</span>
            </template>
          </Column>
          <Column field="nombre" header="Nombre" style="min-width: 180px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.nombre }}</span>
            </template>
          </Column>
          <Column field="direccion" header="Dirección" style="min-width: 200px" />
          <Column field="ciudad" header="Ciudad" style="min-width: 140px" />
          <Column field="telefono" header="Teléfono" style="min-width: 130px" />
          <Column field="activa" header="Estado" style="width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.activa ? 'Activa' : 'Inactiva'"
                :severity="data.activa ? 'success' : 'danger'"
              />
            </template>
          </Column>
          <Column header="" style="width: 60px">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click="openEditBranchDialog(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Branch Dialog -->
    <Dialog
      v-model:visible="showBranchDialog"
      :header="isEditingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'"
      :style="{ width: '550px' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Nombre *</label>
            <InputText
              v-model="branchForm.nombre"
              placeholder="Ej: Sucursal Santiago"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Código *</label>
            <InputText
              v-model="branchForm.codigo"
              placeholder="Ej: 002"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Dirección</label>
          <InputText
            v-model="branchForm.direccion"
            placeholder="Ej: Av. Juan Pablo Duarte #78"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Ciudad</label>
            <InputText
              v-model="branchForm.ciudad"
              placeholder="Ej: Santiago de los Caballeros"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Provincia</label>
            <Dropdown
              v-model="branchForm.provincia"
              :options="provinceOptions"
              placeholder="Seleccionar"
              editable
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Teléfono</label>
            <InputText
              v-model="branchForm.telefono"
              placeholder="Ej: 809-555-8001"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Email</label>
            <InputText
              v-model="branchForm.email"
              type="email"
              placeholder="Ej: sucursal@empresa.com.do"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="branchForm.activa" :binary="true" input-id="branchActive" />
          <label for="branchActive" class="text-sm font-medium">Sucursal Activa</label>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showBranchDialog = false" />
        <Button
          :label="isEditingBranch ? 'Actualizar' : 'Crear'"
          icon="pi pi-check"
          :loading="savingBranch"
          @click="saveBranch"
        />
      </template>
    </Dialog>
  </div>
</template>
