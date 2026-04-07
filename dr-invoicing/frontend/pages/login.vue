<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const { showError } = useToastMessage()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const loginError = ref('')

async function handleLogin() {
  loginError.value = ''
  if (!email.value || !password.value) {
    loginError.value = 'Por favor complete todos los campos'
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push('/')
  } catch (error: any) {
    loginError.value = error?.data?.message || 'Credenciales inválidas. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-slate-800 mb-1">
      Bienvenido de vuelta
    </h2>
    <p class="text-slate-500 text-sm mb-6">
      Ingresa tus credenciales para continuar
    </p>

    <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
      <!-- Email -->
      <div class="flex flex-col gap-1.5">
        <label for="email" class="text-sm font-medium text-slate-700">
          Correo electrónico
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

      <!-- Password -->
      <div class="flex flex-col gap-1.5">
        <label for="password" class="text-sm font-medium text-slate-700">
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

      <!-- Error inline -->
      <Message v-if="loginError" severity="error" :closable="false" class="text-sm">
        {{ loginError }}
      </Message>

      <!-- Forgot password -->
      <div class="text-right -mt-1">
        <NuxtLink to="/auth/forgot-password" class="text-xs text-blue-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>

      <Button
        type="submit"
        label="Iniciar sesión"
        icon="pi pi-sign-in"
        class="w-full"
        :loading="loading"
      />

      <Divider>
        <span class="text-xs text-slate-400">¿Nuevo en DR Invoicing?</span>
      </Divider>

      <NuxtLink to="/auth/register">
        <Button
          type="button"
          label="Crear cuenta gratuita"
          severity="secondary"
          outlined
          class="w-full"
        />
      </NuxtLink>
    </form>
  </div>
</template>
