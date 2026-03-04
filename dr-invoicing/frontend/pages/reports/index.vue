<script setup lang="ts">
interface ReportCard {
  title: string
  description: string
  icon: string
  route: string
  color: string
  bgColor: string
}

const reports: ReportCard[] = [
  {
    title: 'Reporte de Ventas',
    description: 'Resumen de ventas por período, cliente, producto y sucursal. Incluye gráficos y exportación a Excel.',
    icon: 'pi pi-chart-line',
    route: '/reports/sales',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: '606 — Compras de Bienes y Servicios',
    description: 'Formato 606 requerido por la DGII. Detalle de compras a proveedores con comprobantes fiscales.',
    icon: 'pi pi-file-import',
    route: '/reports/606',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: '607 — Ventas de Bienes y Servicios',
    description: 'Formato 607 requerido por la DGII. Detalle de ventas realizadas con comprobantes fiscales electrónicos.',
    icon: 'pi pi-file-export',
    route: '/reports/607',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: '608 — Comprobantes Anulados',
    description: 'Formato 608 requerido por la DGII. Registro de comprobantes fiscales anulados durante el período.',
    icon: 'pi pi-file-excel',
    route: '/reports/608',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Reportes</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink
        v-for="report in reports"
        :key="report.route"
        :to="report.route"
        class="no-underline"
      >
        <Card class="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
          <template #content>
            <div class="flex gap-4">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="report.bgColor"
              >
                <i :class="[report.icon, report.color, 'text-2xl']" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-1">
                  {{ report.title }}
                </h3>
                <p class="text-sm text-gray-500 leading-relaxed">
                  {{ report.description }}
                </p>
              </div>
            </div>
          </template>
        </Card>
      </NuxtLink>
    </div>

    <!-- Additional Info -->
    <Card class="shadow-sm">
      <template #content>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-info-circle text-yellow-600 text-xl" />
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Formatos DGII</h4>
            <p class="text-sm text-gray-500 leading-relaxed">
              Los reportes 606, 607 y 608 son declaraciones informativas requeridas mensualmente
              por la Dirección General de Impuestos Internos (DGII) de la República Dominicana.
              Se generan en el formato de texto (.txt) especificado por la norma 06-2018 y pueden
              ser cargados directamente en la Oficina Virtual de la DGII.
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
