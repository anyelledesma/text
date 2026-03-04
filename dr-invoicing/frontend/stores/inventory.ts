import { defineStore } from 'pinia';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  unitPrice: number;
  itbisRate: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stock {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  minQuantity: number;
  updatedAt: string;
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  referenceId?: number;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const useInventoryStore = defineStore('inventory', () => {
  const products = ref<Product[]>([]);
  const stock = ref<Stock[]>([]);
  const movements = ref<StockMovement[]>([]);
  const loading = ref(false);

  async function fetchProducts(query?: string) {
    const { get } = useApi();
    loading.value = true;

    try {
      const params: Record<string, string> = {};
      if (query) params.search = query;

      const response = await get<PaginatedResponse<Product>>('/products', {
        query: params,
      });

      products.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id: number) {
    const { get } = useApi();
    loading.value = true;

    try {
      return await get<Product>(`/products/${id}`);
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(data: Partial<Product>) {
    const { post } = useApi();
    loading.value = true;

    try {
      const product = await post<Product>('/products', {
        body: data,
      });

      products.value.unshift(product);
      return product;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: number, data: Partial<Product>) {
    const { patch } = useApi();
    loading.value = true;

    try {
      const product = await patch<Product>(`/products/${id}`, {
        body: data,
      });

      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) products.value[index] = product;

      return product;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStock(warehouseId?: number) {
    const { get } = useApi();
    loading.value = true;

    try {
      const params: Record<string, string> = {};
      if (warehouseId) params.warehouseId = String(warehouseId);

      const response = await get<PaginatedResponse<Stock>>('/inventory/stock', {
        query: params,
      });

      stock.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function createMovement(data: Partial<StockMovement>) {
    const { post } = useApi();
    loading.value = true;

    try {
      const movement = await post<StockMovement>('/inventory/movements', {
        body: data,
      });

      movements.value.unshift(movement);
      return movement;
    } finally {
      loading.value = false;
    }
  }

  async function adjustStock(data: {
    productId: number;
    warehouseId: number;
    quantity: number;
    reason: string;
  }) {
    const { post } = useApi();
    loading.value = true;

    try {
      const result = await post<Stock>('/inventory/adjust', {
        body: data,
      });

      const index = stock.value.findIndex(
        (s) => s.productId === data.productId && s.warehouseId === data.warehouseId,
      );
      if (index !== -1) stock.value[index] = result;
      else stock.value.push(result);

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMovements(productId: number) {
    const { get } = useApi();
    loading.value = true;

    try {
      const response = await get<PaginatedResponse<StockMovement>>(
        `/inventory/movements`,
        { query: { productId: String(productId) } },
      );

      movements.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    stock,
    movements,
    loading,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    fetchStock,
    createMovement,
    adjustStock,
    fetchMovements,
  };
});
