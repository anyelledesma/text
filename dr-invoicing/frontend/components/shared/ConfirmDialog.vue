<template>
  <Dialog
    :visible="visible"
    :header="title"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '450px' }"
    @update:visible="onHide"
  >
    <div class="confirm-dialog-body">
      <i :class="['confirm-dialog-icon', iconClass]" />
      <p class="confirm-dialog-message">{{ message }}</p>
    </div>

    <template #footer>
      <div class="confirm-dialog-footer">
        <Button
          :label="cancelLabel"
          icon="pi pi-times"
          severity="secondary"
          text
          @click="onCancel"
        />
        <Button
          :label="confirmLabel"
          :icon="confirmIcon"
          :severity="buttonSeverity"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
type Severity = 'danger' | 'warning' | 'info'

interface Props {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  severity?: Severity
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  severity: 'warning',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

const iconClass = computed<string>(() => {
  const map: Record<Severity, string> = {
    danger: 'pi pi-exclamation-triangle text-red-500',
    warning: 'pi pi-exclamation-circle text-yellow-500',
    info: 'pi pi-info-circle text-blue-500',
  }
  return map[props.severity]
})

const confirmIcon = computed<string>(() => {
  const map: Record<Severity, string> = {
    danger: 'pi pi-trash',
    warning: 'pi pi-check',
    info: 'pi pi-check',
  }
  return map[props.severity]
})

const buttonSeverity = computed<'danger' | 'warn' | 'info'>(() => {
  const map: Record<Severity, 'danger' | 'warn' | 'info'> = {
    danger: 'danger',
    warning: 'warn',
    info: 'info',
  }
  return map[props.severity]
})

function onConfirm(): void {
  emit('confirm')
  emit('update:visible', false)
}

function onCancel(): void {
  emit('cancel')
  emit('update:visible', false)
}

function onHide(value: boolean): void {
  if (!value) {
    emit('cancel')
  }
  emit('update:visible', value)
}
</script>

<style scoped>
.confirm-dialog-body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
}

.confirm-dialog-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.confirm-dialog-message {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
