import type { FetchOptions } from 'ofetch';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  async function request<T>(
    url: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase as string,
        ...options,
        headers,
      });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        authStore.clearAuth();
        navigateTo('/login');
      }
      throw error;
    }
  }

  function get<T>(url: string, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' });
  }

  function post<T>(url: string, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'POST' });
  }

  function patch<T>(url: string, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'PATCH' });
  }

  function del<T>(url: string, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' });
  }

  return { get, post, patch, del };
}
