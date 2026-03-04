import { defineStore } from 'pinia';

interface InvoiceItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  itbisRate: number;
  itbisAmount: number;
  subtotal: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  ecfType: string;
  ncf: string;
  status: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerRnc: string;
  subtotal: number;
  itbisTotal: number;
  total: number;
  items: InvoiceItem[];
  dgiiStatus?: string;
  dgiiSubmittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceFilters {
  dateFrom: string | null;
  dateTo: string | null;
  status: string | null;
  ecfType: string | null;
  search: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const loading = ref(false);
  const filters = ref<InvoiceFilters>({
    dateFrom: null,
    dateTo: null,
    status: null,
    ecfType: null,
    search: null,
  });

  async function fetchInvoices() {
    const { get } = useApi();
    loading.value = true;

    try {
      const params: Record<string, string> = {};

      if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom;
      if (filters.value.dateTo) params.dateTo = filters.value.dateTo;
      if (filters.value.status) params.status = filters.value.status;
      if (filters.value.ecfType) params.ecfType = filters.value.ecfType;
      if (filters.value.search) params.search = filters.value.search;

      const response = await get<PaginatedResponse<Invoice>>('/invoices', {
        query: params,
      });

      invoices.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchInvoice(id: number) {
    const { get } = useApi();
    loading.value = true;

    try {
      currentInvoice.value = await get<Invoice>(`/invoices/${id}`);
    } finally {
      loading.value = false;
    }
  }

  async function createInvoice(data: Partial<Invoice>) {
    const { post } = useApi();
    loading.value = true;

    try {
      const invoice = await post<Invoice>('/invoices', {
        body: data,
      });

      invoices.value.unshift(invoice);
      return invoice;
    } finally {
      loading.value = false;
    }
  }

  async function cancelInvoice(id: number) {
    const { patch } = useApi();
    loading.value = true;

    try {
      const invoice = await patch<Invoice>(`/invoices/${id}/cancel`);

      const index = invoices.value.findIndex((inv) => inv.id === id);
      if (index !== -1) invoices.value[index] = invoice;
      if (currentInvoice.value?.id === id) currentInvoice.value = invoice;

      return invoice;
    } finally {
      loading.value = false;
    }
  }

  async function sendToDgii(id: number) {
    const { post } = useApi();
    loading.value = true;

    try {
      const invoice = await post<Invoice>(`/invoices/${id}/dgii`);

      const index = invoices.value.findIndex((inv) => inv.id === id);
      if (index !== -1) invoices.value[index] = invoice;
      if (currentInvoice.value?.id === id) currentInvoice.value = invoice;

      return invoice;
    } finally {
      loading.value = false;
    }
  }

  return {
    invoices,
    currentInvoice,
    loading,
    filters,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    cancelInvoice,
    sendToDgii,
  };
});
