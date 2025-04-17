import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as notificationService from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationService.getNotifications()
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách thông báo'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationService.getUnreadNotifications()
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách thông báo chưa đọc'
      console.error('Error fetching unread notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id) => {
    loading.value = true
    error.value = null
    try {
      const updatedNotification = await notificationService.markNotificationAsRead(id)
      
      // Update in notifications array
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index] = updatedNotification
      }
      
      return updatedNotification
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể đánh dấu đã đọc thông báo ${id}`
      console.error(`Error marking notification ${id} as read:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAllAsRead = async () => {
    loading.value = true
    error.value = null
    try {
      await notificationService.markAllNotificationsAsRead()
      
      // Update all notifications in the array
      notifications.value = notifications.value.map(n => ({ ...n, read: true }))
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể đánh dấu đã đọc tất cả thông báo'
      console.error('Error marking all notifications as read:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteNotification = async (id) => {
    loading.value = true
    error.value = null
    try {
      await notificationService.deleteNotification(id)
      
      // Remove from notifications array
      notifications.value = notifications.value.filter(n => n.id !== id)
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể xóa thông báo ${id}`
      console.error(`Error deleting notification ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
})
