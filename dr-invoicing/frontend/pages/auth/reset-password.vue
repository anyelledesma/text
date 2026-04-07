<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token as string | undefined)
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const passwordsMatch = computed(
  () => confirmPassword.value !== '' && password.value === confirmPassword.value,
)

const isValid = computed(
  () => password.value.length >= 8 && passwordsMatch.value,
)

async function handleReset() {
  if (!isValid.value || !token.value) return
  error.value = ''
  loading.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch('/auth/reset-password', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.message || 'El enlace expiró o no es válido. Solicita uno nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Invalid token -->
    <div v-if="!token" class="flex flex-col items-center text-center gap-4">
      <div class="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
        <i class="pi pi-exclamation-triangle text-red-500 text-2xl" />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-slate-800 mb-2">Enlace inválido</h2>
        <p class="text-slate-500 text-sm">
          Este enlace no es válido o ya fue utilizado.
        </p>
      </div>
      <NuxtLink to="/auth/forgot-password" class="w-full">
        <Button label="Solicitar nuevo enlace" class="w-full" />
      </NuxtLink>
    </div>

    <!-- Success state -->
    <div v-else-if="success" class="flex flex-col items-center text-center gap-4">
      <div class="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
        <i class="pi pi-check-circle text-green-500 text-3xl" />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-slate-800 mb-2">
          ¡Contraseña actualizada!
        </h2>
        <p class="text-slate-500 text-sm">
          Tu contraseña fue cambiada exitosamente.<br />Ya puedes iniciar sesión.
        </p>
      </div>
      <NuxtLink to="/login" class="w-full">
        <Button label="Ir al inicio de sesión" class="w-full" />
      </NuxtLink>
    </div>

    <!-- Form state -->
    <div v-else>
      <div class="flex justify-center mb-5">
        <div class="w-14 h-14 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center">
          <i class="pi pi-lock text-blue-600 text-2xl" />
        </div>
      </div>

      <h2 class="text-xl font-semibold text-slate-800 text-center mb-1">
        Nueva contraseña
      </h2>
      <p class="text-slate-500 text-sm text-center mb-6">
        Elige una contraseña segura para tu cuenta.
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="handleReset">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">Nueva contraseña</label>
          <Password
            v-model="password"
            placeholder="Mínimo 8 caracteres"
            :feedback="true"
            toggle-mask
            class="w-full"
            input-class="w-full"
          />
          <small v-if="password && password.length < 8" class="text-red-500 text-xs">
            Mínimo 8 caracteres
          </small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">Confirmar contraseña</label>
          <InputText
            v-model="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            :class="confirmPassword && !passwordsMatch ? 'p-invalid' : ''"
          />
          <small v-if="confirmPassword && !passwordsMatch" class="text-red-500 text-xs">
            Las contraseñas no coinciden
          </small>
          <small v-if="passwordsMatch" class="text-green-600 text-xs flex items-center gap-1">
            <i class="pi pi-check" />
            Las contraseñas coinciden
          </small>
        </div>

        <Message v-if="error" severity="error" :closable="false" class="text-sm">
          {{ error }}
        </Message>

        <Button
          type="submit"
          label="Guardar nueva contraseña"
          icon="pi pi-check"
          class="w-full"
          :loading="loading"
          :disabled="!isValid"
        />
      </form>
    </div>
  </div>
</template>
