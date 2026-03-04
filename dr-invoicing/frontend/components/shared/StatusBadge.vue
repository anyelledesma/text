<template>
  <Tag :value="label" :severity="severity" :rounded="true" />
</template>

<script setup lang="ts">
type StatusType = 'invoice' | 'dgii' | 'payment'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined

interface StatusConfig {
  label: string
  severity: Severity
}

interface Props {
  status: string
  type: StatusType
}

const props = defineProps<Props>()

const invoiceStatusMap: Record<string, StatusConfig> = {
  draft: { label: 'Borrador', severity: 'secondary' },
  issued: { label: 'Emitida', severity: 'info' },
  sent_to_dgii: { label: 'Enviada DGII', severity: 'warn' },
  accepted: { label: 'Aceptada', severity: 'success' },
  rejected: { label: 'Rechazada', severity: 'danger' },
  cancelled: { label: 'Anulada', severity: 'danger' },
  paid: { label: 'Pagada', severity: 'success' },
  partial_paid: { label: 'Pago Parcial', severity: 'warn' },
}

const dgiiStatusMap: Record<string, StatusConfig> = {
  aceptado: { label: 'Aceptado', severity: 'success' },
  rechazado: { label: 'Rechazado', severity: 'danger' },
  en_proceso: { label: 'En proceso', severity: 'warn' },
  pending: { label: 'Pendiente', severity: 'secondary' },
}

const paymentStatusMap: Record<string, StatusConfig> = {
  pending: { label: 'Pendiente', severity: 'warn' },
  completed: { label: 'Completado', severity: 'success' },
  failed: { label: 'Fallido', severity: 'danger' },
  refunded: { label: 'Reembolsado', severity: 'info' },
  partial: { label: 'Parcial', severity: 'warn' },
}

const statusMaps: Record<StatusType, Record<string, StatusConfig>> = {
  invoice: invoiceStatusMap,
  dgii: dgiiStatusMap,
  payment: paymentStatusMap,
}

const resolvedConfig = computed<StatusConfig>(() => {
  const map = statusMaps[props.type]
  const normalizedStatus = props.status.toLowerCase().replace(/\s+/g, '_')
  return map[normalizedStatus] ?? { label: props.status, severity: 'secondary' }
})

const label = computed<string>(() => resolvedConfig.value.label)
const severity = computed<Severity>(() => resolvedConfig.value.severity)
</script>
