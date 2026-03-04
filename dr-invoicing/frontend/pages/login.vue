<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const { showSuccess, showError } = useToastMessage()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    showError('Por favor complete todos los campos')
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    showSuccess('Inicio de sesión exitoso')
    await router.push('/')
  } catch (error: any) {
    showError(error?.message || 'Credenciales inválidas. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md">
      <Card class="shadow-lg">
        <template #header>
          <div class="flex flex-col items-center pt-8 pb-2">
            <div
              class="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mb-4"
            >
              <i class="pi pi-building text-white text-4xl" />
            </div>
            <h1 class="text-2xl font-bold text-gray-800">
              Facturación RD
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Sistema de Facturación Electrónica
            </p>
          </div>
        </template>

        <template #content>
          <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
            <div class="flex flex-col gap-2">
              <label for="email" class="font-medium text-sm">
                Correo Electrónico
              </label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="usuario@empresa.com.do"
                class="w-full"
                :disabled="loading"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="password" class="font-medium text-sm">
                Contraseña
              </label>
              <Password
                id="password"
                v-model="password"
                placeholder="Ingrese su contraseña"
                :feedback="false"
                toggle-mask
                class="w-full"
                input-class="w-full"
                :disabled="loading"
              />
            </div>

            <Button
              type="submit"
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              class="w-full mt-2"
              :loading="loading"
            />

            <div class="text-center mt-2">
              <a href="#" class="text-sm text-blue-600 hover:underline">
                ¿Olvidó su contraseña?
              </a>
            </div>
          </form>
        </template>
      </Card>

      <p class="text-center text-xs text-gray-400 mt-4">
        &copy; 2026 Facturación RD — Sistema e-CF DGII
      </p>
    </div>
  </div>
</template>
