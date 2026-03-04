<template>
  <div class="datatable-wrapper">
    <div class="datatable-toolbar">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="globalFilter"
          placeholder="Buscar..."
          class="datatable-search"
        />
      </IconField>
      <div class="datatable-toolbar-actions">
        <slot name="toolbar" />
      </div>
    </div>

    <DataTable
      :value="data"
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rows-per-page-options="[10, 20, 50, 100]"
      :global-filter-fields="filterFields"
      :global-filter="globalFilter"
      striped-rows
      removable-sort
      responsive-layout="scroll"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      current-page-report-template="Mostrando {first} a {last} de {totalRecords} registros"
      @row-click="onRowClick"
      class="datatable-main"
    >
      <template #empty>
        <div class="datatable-empty">
          <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8" />
          <p>No se encontraron registros</p>
        </div>
      </template>

      <template #loading>
        <div class="datatable-loading">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
          <p>Cargando datos...</p>
        </div>
      </template>

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable ?? true"
      >
        <template #body="slotProps">
          <slot :name="`col-${col.field}`" :data="slotProps.data" :field="col.field">
            <template v-if="col.type === 'currency'">
              {{ formatCurrency(slotProps.data[col.field]) }}
            </template>
            <template v-else-if="col.type === 'date'">
              {{ formatDate(slotProps.data[col.field]) }}
            </template>
            <template v-else-if="col.type === 'boolean'">
              <i
                :class="slotProps.data[col.field] ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-400'"
              />
            </template>
            <template v-else>
              {{ slotProps.data[col.field] }}
            </template>
          </slot>
        </template>
      </Column>

      <Column
        v-if="$slots.actions"
        header="Acciones"
        :exportable="false"
        style="min-width: 8rem"
        frozen
        align-frozen="right"
      >
        <template #body="slotProps">
          <slot name="actions" :data="slotProps.data" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
export interface ColumnDef {
  field: string
  header: string
  sortable?: boolean
  type?: 'text' | 'currency' | 'date' | 'boolean'
}

interface Props {
  columns: ColumnDef[]
  data: Record<string, unknown>[]
  loading?: boolean
  paginator?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  paginator: true,
  rows: 20,
})

const emit = defineEmits<{
  'row-click': [data: Record<string, unknown>]
}>()

const globalFilter = ref<string>('')

const filterFields = computed<string[]>(() => {
  return props.columns.map((col) => col.field)
})

function onRowClick(event: { data: Record<string, unknown> }): void {
  emit('row-click', event.data)
}

function formatCurrency(value: unknown): string {
  if (value == null) return ''
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(num)
}

function formatDate(value: unknown): string {
  if (value == null) return ''
  const date = new Date(String(value))
  if (isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
</script>

<style scoped>
.datatable-wrapper {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.datatable-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
  flex-wrap: wrap;
}

.datatable-search {
  min-width: 250px;
}

.datatable-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.datatable-empty,
.datatable-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  gap: 0.5rem;
}

.datatable-main :deep(.p-datatable-header) {
  display: none;
}
</style>
