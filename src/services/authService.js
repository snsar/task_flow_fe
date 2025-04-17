import { apiClient } from './api'

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials)
    // Lưu token vào localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      // Set the token in the API client for immediate use
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
    } else {
      console.error('Login response missing token')
      throw new Error('Authentication failed: No token received')
    }
    return response.data
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData)
    // Lưu token vào localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      // Set the token in the API client for immediate use
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
    } else {
      console.error('Register response missing token')
      throw new Error('Registration failed: No token received')
    }
    return response.data
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message)
    throw error
  }
}

export const logout = async () => {
  try {
    // Đảm bảo gửi token trong header để xác thực
    const token = localStorage.getItem('token')
    if (token) {
      await apiClient.post('/auth/logout')
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Đảm bảo luôn xóa token khỏi localStorage
    localStorage.removeItem('token')
    // Remove the Authorization header
    delete apiClient.defaults.headers.common['Authorization']
  }

  // Return a resolved promise to ensure the chain continues
  return Promise.resolve()
}

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token')
    // Cập nhật token mới vào localStorage
    localStorage.setItem('token', response.data.token)
    return response.data
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message)
    // Nếu không thể làm mới token, đăng xuất người dùng
    localStorage.removeItem('token')
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me')
    return response.data.user
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  if (!token) return false

  // Ensure the token is set in the API client
  if (token && !apiClient.defaults.headers.common['Authorization']) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  return true
}
