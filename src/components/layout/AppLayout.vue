<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/login')
    }
  } else {
    router.push('/login')
  }
  loading.value = false
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <div v-else class="drawer lg:drawer-open">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <Navbar />
      <div class="p-4 md:p-6">
        <slot></slot>
      </div>
    </div>
    <Sidebar />
  </div>
</template>
