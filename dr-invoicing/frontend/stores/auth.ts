import { defineStore } from 'pinia';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RegisterPayload {
  company: {
    rnc: string;
    businessName: string;
    tradeName?: string;
    phone: string;
    address: string;
    municipality?: string;
    province?: string;
  };
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  planTier: 'FREE' | 'STARTER' | 'PROFESSIONAL';
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    if (import.meta.client) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async function login(email: string, password: string) {
    const config = useRuntimeConfig();

    const data = await $fetch<LoginResponse>('/auth/login', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: { email, password },
    });

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;

    if (import.meta.client) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  async function register(payload: RegisterPayload) {
    const config = useRuntimeConfig();

    const data = await $fetch<LoginResponse>('/auth/register', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: payload,
    });

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;

    if (import.meta.client) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  async function logout() {
    const config = useRuntimeConfig();

    try {
      if (accessToken.value) {
        await $fetch('/auth/logout', {
          baseURL: config.public.apiBase as string,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        });
      }
    } catch {
      // Ignore errors on logout request
    } finally {
      clearAuth();
      navigateTo('/login');
    }
  }

  async function refreshAccessToken() {
    const config = useRuntimeConfig();

    if (!refreshToken.value) {
      clearAuth();
      navigateTo('/login');
      return;
    }

    try {
      const data = await $fetch<RefreshResponse>('/auth/refresh', {
        baseURL: config.public.apiBase as string,
        method: 'POST',
        body: { refreshToken: refreshToken.value },
      });

      accessToken.value = data.accessToken;

      if (import.meta.client) {
        localStorage.setItem('accessToken', data.accessToken);
      }
    } catch {
      clearAuth();
      navigateTo('/login');
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return;

    const storedToken = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken) accessToken.value = storedToken;
    if (storedRefresh) refreshToken.value = storedRefresh;
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch {
        user.value = null;
      }
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    loadFromStorage,
    clearAuth,
  };
});
