<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'auth',
})

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  if (!email.value.trim()) return
  loading.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch('/auth/forgot-password', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: { email: email.value },
    })
    sent.value = true
  } catch {
    // Show confirmation regardless to avoid email enumeration
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Confirmation state -->
    <div v-if="sent" class="flex flex-col items-center text-center gap-4">
      <div class="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
        <i class="pi pi-envelope text-green-500 text-2xl" />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-slate-800 mb-2">
          ¡Revisa tu correo!
        </h2>
        <p class="text-slate-500 text-sm">
          Enviamos las instrucciones a
        </p>
        <p class="text-slate-800 font-semibold text-sm mt-1">
          {{ email }}
        </p>
        <p class="text-slate-400 text-xs mt-3">
          Si no ves el correo, revisa tu carpeta de spam.<br />
          El enlace expira en 30 minutos.
        </p>
      </div>

      <NuxtLink to="/login" class="w-full">
        <Button
          label="Volver al inicio de sesión"
          severity="secondary"
          outlined
          class="w-full"
        />
      </NuxtLink>

      <button
        class="text-xs text-blue-600 hover:underline"
        @click="sent = false"
      >
        ¿No recibiste el correo? Reenviar
      </button>
    </div>

    <!-- Form state -->
    <div v-else>
      <div class="flex justify-center mb-5">
        <div class="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
          <i class="pi pi-key text-amber-500 text-2xl" />
        </div>
      </div>

      <h2 class="text-xl font-semibold text-slate-800 text-center mb-1">
        ¿Olvidaste tu contraseña?
      </h2>
      <p class="text-slate-500 text-sm text-center mb-6">
        Ingresa tu correo y te enviaremos un enlace para restablecerla.
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="usuario@empresa.com.do"
            :disabled="loading"
          />
        </div>

        <Button
          type="submit"
          label="Enviar enlace"
          icon="pi pi-send"
          class="w-full"
          :loading="loading"
          :disabled="!email.trim()"
        />
      </form>

      <div class="text-center mt-5">
        <NuxtLink
          to="/login"
          class="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
        >
          <i class="pi pi-arrow-left text-xs" />
          Volver al inicio de sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
