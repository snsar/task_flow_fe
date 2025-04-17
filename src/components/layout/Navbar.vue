<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { apiClient } from '@/services/api'
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const showNotifications = ref(false)
const showUserMenu = ref(false)

const unreadCount = computed(() => notificationStore.unreadCount)
const userName = computed(() => authStore.user?.name || 'User')
const userAvatar = computed(
  () =>
    authStore.user?.avatar ||
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value),
)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchCurrentUser()
    await notificationStore.fetchNotifications()
  }
})

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    await notificationStore.fetchNotifications()
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  // First clear the token directly
  localStorage.removeItem('token')
  delete apiClient.defaults.headers.common['Authorization']

  // Reset user state
  authStore.user = null

  // Close the user menu
  showUserMenu.value = false

  // Force navigation to login page
  window.location.href = '/login'
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const markAsRead = async (id) => {
  await notificationStore.markAsRead(id)
}

const deleteNotification = async (id) => {
  await notificationStore.deleteNotification(id)
}
</script>

<template>
  <div class="navbar bg-base-100 shadow-md">
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost text-xl">TaskFlow</router-link>
    </div>
    <div class="flex-none gap-2">
      <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
        <button @click="toggleNotifications" class="btn btn-ghost btn-circle">
          <div class="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span v-if="unreadCount > 0" class="badge badge-xs badge-primary indicator-item">{{
              unreadCount
            }}</span>
          </div>
        </button>
        <div
          v-if="showNotifications"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80 mt-4"
        >
          <div class="flex justify-between items-center p-2 border-b">
            <h3 class="font-bold">Thông báo</h3>
            <button @click="markAllAsRead" class="btn btn-xs btn-ghost">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
          <div
            v-if="notificationStore.notifications.length === 0"
            class="p-4 text-center text-gray-500"
          >
            Không có thông báo
          </div>
          <ul v-else class="max-h-96 overflow-y-auto">
            <li
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              class="p-2 hover:bg-base-200 rounded-lg mb-1"
              :class="{ 'bg-base-200': !notification.read }"
            >
              <div class="flex justify-between">
                <div>
                  <p class="text-sm" :class="{ 'font-bold': !notification.read }">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(notification.created_at).toLocaleString() }}
                  </p>
                </div>
                <div class="flex gap-1">
                  <button
                    v-if="!notification.read"
                    @click="markAsRead(notification.id)"
                    class="btn btn-xs btn-ghost"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteNotification(notification.id)"
                    class="btn btn-xs btn-ghost text-error"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
        <button @click="toggleUserMenu" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img :src="userAvatar" alt="User avatar" />
          </div>
        </button>
        <ul
          v-if="showUserMenu"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
        >
          <li class="p-2 text-center border-b">
            <span class="font-bold">{{ userName }}</span>
          </li>
          <li><router-link to="/profile">Hồ sơ</router-link></li>
          <li><router-link to="/dashboard">Bảng điều khiển</router-link></li>
          <li><router-link to="/projects">Dự án</router-link></li>
          <li><router-link to="/tasks">Công việc</router-link></li>
          <li v-if="authStore.isAdmin"><router-link to="/admin">Quản trị</router-link></li>
          <li><a @click="handleLogout">Đăng xuất</a></li>
        </ul>
      </div>
      <div v-else class="flex gap-2">
        <router-link to="/login" class="btn btn-ghost">Đăng nhập</router-link>
        <router-link to="/register" class="btn btn-primary">Đăng ký</router-link>
      </div>
    </div>
  </div>
</template>
