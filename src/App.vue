<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { isAuthenticated } from '@/services/authService'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialize auth state if token exists
  if (isAuthenticated()) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user data on app initialization:', error)
    }
  }
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
