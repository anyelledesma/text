<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const { showError } = useToastMessage()
const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)

// Step 1 — Company data
const company = ref({
  rnc: '',
  businessName: '',
  tradeName: '',
  phone: '',
  address: '',
  municipality: '',
  province: 'Distrito Nacional',
})

// Step 2 — Admin user
const admin = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Step 3 — Plan
const selectedPlan = ref<'FREE' | 'STARTER' | 'PROFESSIONAL'>('STARTER')

const provinces = [
  'Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Distrito Nacional',
  'Duarte', 'El Seibo', 'Elías Piña', 'Espaillat', 'Hato Mayor',
  'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana', 'La Vega',
  'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi', 'Monte Plata',
  'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná', 'San Cristóbal',
  'San José de Ocoa', 'San Juan', 'San Pedro de Macorís', 'Sánchez Ramírez',
  'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde',
]

const plans = [
  {
    tier: 'FREE' as const,
    name: 'Free',
    price: '$0',
    features: ['2 usuarios', '50 facturas/mes', '100 productos'],
    missing: ['e-CF DGII', 'Multi-sucursal'],
  },
  {
    tier: 'STARTER' as const,
    name: 'Starter',
    price: '$29',
    popular: true,
    features: ['5 usuarios', '500 facturas/mes', '1,000 productos', 'e-CF DGII'],
    missing: ['Multi-sucursal'],
  },
  {
    tier: 'PROFESSIONAL' as const,
    name: 'Professional',
    price: '$79',
    features: ['20 usuarios', '5,000 facturas/mes', '10,000 productos', 'e-CF DGII', 'Multi-sucursal'],
    missing: [],
  },
]

const step1Valid = computed(() =>
  company.value.rnc.trim() !== '' &&
  company.value.businessName.trim() !== '' &&
  company.value.phone.trim() !== '' &&
  company.value.address.trim() !== '',
)

const step2Valid = computed(() =>
  admin.value.firstName.trim() !== '' &&
  admin.value.lastName.trim() !== '' &&
  admin.value.email.trim() !== '' &&
  admin.value.password.length >= 8 &&
  admin.value.password === admin.value.confirmPassword,
)

const passwordsMatch = computed(() =>
  admin.value.confirmPassword !== '' &&
  admin.value.password === admin.value.confirmPassword,
)

function nextStep() {
  if (currentStep.value === 0 && !step1Valid.value) {
    showError('Complete todos los campos obligatorios')
    return
  }
  if (currentStep.value === 1 && !step2Valid.value) {
    showError('Revise los datos del administrador')
    return
  }
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function handleRegister() {
  loading.value = true
  try {
    await authStore.register({
      company: company.value,
      admin: {
        firstName: admin.value.firstName,
        lastName: admin.value.lastName,
        email: admin.value.email,
        password: admin.value.password,
      },
      planTier: selectedPlan.value,
    })
    await router.push('/')
  } catch (error: any) {
    showError(error?.data?.message || 'Error al crear la cuenta. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-slate-800 mb-1">
      Crea tu cuenta
    </h2>
    <p class="text-slate-400 text-sm mb-6">
      14 días gratis en cualquier plan. Sin tarjeta de crédito.
    </p>

    <!-- Steps indicator -->
    <div class="flex items-center mb-8">
      <template v-for="(label, idx) in ['Empresa', 'Administrador', 'Plan']" :key="idx">
        <div class="flex flex-col items-center">
          <div
            class="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors"
            :class="{
              'bg-blue-600 text-white': idx === currentStep,
              'bg-green-500 text-white': idx < currentStep,
              'bg-slate-200 text-slate-500': idx > currentStep,
            }"
          >
            <span v-if="idx >= currentStep">{{ idx + 1 }}</span>
            <i v-else class="pi pi-check text-xs" />
          </div>
          <span
            class="text-xs font-medium mt-1 transition-colors"
            :class="{
              'text-blue-600': idx === currentStep,
              'text-green-600': idx < currentStep,
              'text-slate-400': idx > currentStep,
            }"
          >{{ label }}</span>
        </div>
        <div
          v-if="idx < 2"
          class="flex-1 h-0.5 mx-2 mb-5 transition-colors"
          :class="idx < currentStep ? 'bg-green-400' : 'bg-slate-200'"
        />
      </template>
    </div>

    <!-- Step 1: Company -->
    <div v-if="currentStep === 0" class="flex flex-col gap-4">
      <p class="text-sm text-slate-500 -mt-2 mb-1">
        Esta información aparece en tus facturas electrónicas
      </p>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">RNC / Cédula *</label>
          <InputText v-model="company.rnc" placeholder="1-31-12345-7" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Teléfono *</label>
          <InputText v-model="company.phone" placeholder="809-000-0000" />
        </div>
        <div class="col-span-2 flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Razón social *</label>
          <InputText v-model="company.businessName" placeholder="Mi Empresa SRL" />
        </div>
        <div class="col-span-2 flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Nombre comercial</label>
          <InputText v-model="company.tradeName" placeholder="Nombre al cliente (opcional)" />
        </div>
        <div class="col-span-2 flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Dirección *</label>
          <InputText v-model="company.address" placeholder="Calle, No., Sector" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Municipio</label>
          <InputText v-model="company.municipality" placeholder="Santo Domingo" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Provincia</label>
          <Select
            v-model="company.province"
            :options="provinces"
            class="w-full"
          />
        </div>
      </div>

      <div class="flex justify-end mt-2">
        <Button
          label="Siguiente"
          icon-pos="right"
          icon="pi pi-arrow-right"
          :disabled="!step1Valid"
          @click="nextStep"
        />
      </div>
    </div>

    <!-- Step 2: Admin user -->
    <div v-else-if="currentStep === 1" class="flex flex-col gap-4">
      <p class="text-sm text-slate-500 -mt-2 mb-1">
        Esta será la cuenta principal con acceso total
      </p>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Nombre *</label>
          <InputText v-model="admin.firstName" placeholder="Juan" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Apellido *</label>
          <InputText v-model="admin.lastName" placeholder="Pérez" />
        </div>
        <div class="col-span-2 flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Correo electrónico *</label>
          <InputText v-model="admin.email" type="email" placeholder="admin@empresa.com.do" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Contraseña *</label>
          <Password
            v-model="admin.password"
            placeholder="Mín. 8 caracteres"
            :feedback="true"
            toggle-mask
            class="w-full"
            input-class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-slate-700">Confirmar contraseña *</label>
          <InputText
            v-model="admin.confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            :class="admin.confirmPassword && !passwordsMatch ? 'p-invalid' : ''"
          />
          <small v-if="admin.confirmPassword && !passwordsMatch" class="text-red-500 text-xs">
            Las contraseñas no coinciden
          </small>
          <small v-if="passwordsMatch" class="text-green-600 text-xs flex items-center gap-1">
            <i class="pi pi-check" />
            Las contraseñas coinciden
          </small>
        </div>
      </div>

      <Message severity="info" :closable="false" class="text-xs">
        Podrás agregar más usuarios desde Configuración una vez dentro del sistema.
      </Message>

      <div class="flex justify-between mt-2">
        <Button
          label="Atrás"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="prevStep"
        />
        <Button
          label="Siguiente"
          icon-pos="right"
          icon="pi pi-arrow-right"
          :disabled="!step2Valid"
          @click="nextStep"
        />
      </div>
    </div>

    <!-- Step 3: Plan -->
    <div v-else class="flex flex-col gap-4">
      <p class="text-sm text-slate-500 -mt-2 mb-1">
        Puedes cambiar tu plan en cualquier momento
      </p>

      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="plan in plans"
          :key="plan.tier"
          class="border-2 rounded-xl p-3 cursor-pointer transition-colors relative"
          :class="selectedPlan === plan.tier
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300'"
          @click="selectedPlan = plan.tier"
        >
          <div
            v-if="plan.popular"
            class="absolute -top-2.5 left-1/2 -translate-x-1/2"
          >
            <span class="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>
          </div>
          <div
            class="text-xs font-semibold uppercase tracking-wide mb-1"
            :class="selectedPlan === plan.tier ? 'text-blue-600' : 'text-slate-500'"
          >
            {{ plan.name }}
          </div>
          <div class="text-slate-800 text-xl font-bold">{{ plan.price }}</div>
          <div class="text-slate-400 text-xs mb-3">/mes</div>
          <ul class="space-y-1">
            <li
              v-for="f in plan.features"
              :key="f"
              class="flex items-start gap-1 text-xs text-slate-600"
            >
              <i class="pi pi-check text-green-500 mt-0.5" style="font-size: 10px" />
              {{ f }}
            </li>
            <li
              v-for="f in plan.missing"
              :key="f"
              class="flex items-start gap-1 text-xs text-slate-400"
            >
              <i class="pi pi-times mt-0.5" style="font-size: 10px" />
              {{ f }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex justify-between mt-2">
        <Button
          label="Atrás"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="prevStep"
        />
        <Button
          label="Crear cuenta"
          icon="pi pi-check"
          :loading="loading"
          @click="handleRegister"
        />
      </div>
    </div>

    <p class="text-center text-xs text-slate-400 mt-6">
      ¿Ya tienes cuenta?
      <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium">
        Inicia sesión
      </NuxtLink>
    </p>
  </div>
</template>
