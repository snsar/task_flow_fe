import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, logout, getCurrentUser } from '@/services/authService'
import { apiClient } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Check if user is authenticated by verifying token exists in localStorage
  const isAuthenticated = computed(() => {
    const hasToken = !!localStorage.getItem('token')
    console.log('Authentication status checked:', hasToken)
    return hasToken
  })
  const isAdmin = computed(() => user.value?.roles?.some((role) => role.slug === 'admin') || false)
  const isManager = computed(
    () => user.value?.roles?.some((role) => role.slug === 'project-manager') || false,
  )

  const loginUser = async (credentials) => {
    loading.value = true
    error.value = null
    try {
      const response = await login(credentials)
      user.value = response.user
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Đăng nhập thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await register(userData)
      user.value = response.user
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Đăng ký thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logoutUser = async () => {
    loading.value = true
    error.value = null
    try {
      // Call the logout API endpoint
      await logout()
      console.log('Logout successful')
    } catch (err) {
      // Log the error but continue with local logout
      error.value = err.response?.data?.message || 'Đăng xuất thất bại'
      console.error('Logout error:', err)
    } finally {
      // Always clear local state regardless of API success
      user.value = null
      localStorage.removeItem('token')

      // Clear the Authorization header
      if (apiClient?.defaults?.headers?.common) {
        delete apiClient.defaults.headers.common['Authorization']
      }

      loading.value = false
    }

    return true // Always return success for UI flow
  }

  const fetchCurrentUser = async () => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null
    try {
      const userData = await getCurrentUser()
      user.value = userData
      return userData
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy thông tin người dùng'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    loginUser,
    registerUser,
    logoutUser,
    fetchCurrentUser,
  }
})
