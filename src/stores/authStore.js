import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, logout, getCurrentUser } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!localStorage.getItem('token'))
  const isAdmin = computed(() => user.value?.roles?.some(role => role.slug === 'admin') || false)
  const isManager = computed(() => user.value?.roles?.some(role => role.slug === 'project-manager') || false)

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
      await logout()
      user.value = null
    } catch (err) {
      error.value = err.response?.data?.message || 'Đăng xuất thất bại'
    } finally {
      loading.value = false
    }
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
    fetchCurrentUser
  }
})
