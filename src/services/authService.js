import { apiClient } from './api'

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials)
    // Lưu token vào localStorage
    localStorage.setItem('token', response.data.token)
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
    localStorage.setItem('token', response.data.token)
    return response.data
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message)
    throw error
  }
}

export const logout = async () => {
  try {
    // Đảm bảo gửi token trong header để xác thực
    await apiClient.post('/auth/logout')
    // Xóa token khỏi localStorage hoặc sessionStorage
    localStorage.removeItem('token')
    // Có thể xóa thêm các thông tin người dùng khác nếu có
  } catch (error) {
    console.error('Logout error:', error)
    // Xóa token ngay cả khi API gọi thất bại
    localStorage.removeItem('token')
    throw error
  } finally {
    // Đảm bảo luôn xóa token khỏi localStorage
    localStorage.removeItem('token')
  }
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
  return !!localStorage.getItem('token')
}
