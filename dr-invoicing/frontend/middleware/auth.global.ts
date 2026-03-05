import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
