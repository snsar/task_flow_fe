import { apiClient } from './api'

export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications')
    return response.data.notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

export const getUnreadNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/unread')
    return response.data.notifications
  } catch (error) {
    console.error('Error fetching unread notifications:', error)
    throw error
  }
}

export const markNotificationAsRead = async (id) => {
  try {
    const response = await apiClient.patch(`/notifications/${id}/read`)
    return response.data.notification
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error)
    throw error
  }
}

export const markAllNotificationsAsRead = async () => {
  try {
    await apiClient.patch('/notifications/read-all')
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

export const deleteNotification = async (id) => {
  try {
    await apiClient.delete(`/notifications/${id}`)
    return true
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error)
    throw error
  }
}
