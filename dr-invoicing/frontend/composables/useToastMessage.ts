import { useToast } from 'primevue/usetoast';

export function useToastMessage() {
  const toast = useToast();

  function showSuccess(message: string) {
    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: message,
      life: 3000,
    });
  }

  function showError(message: string) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000,
    });
  }

  function showWarning(message: string) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 4000,
    });
  }

  function showInfo(message: string) {
    toast.add({
      severity: 'info',
      summary: 'Informacion',
      detail: message,
      life: 3000,
    });
  }

  return { showSuccess, showError, showWarning, showInfo };
}
