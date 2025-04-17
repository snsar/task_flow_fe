<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const authStore = useAuthStore()
const loading = ref(false)
const success = ref(false)
const error = ref('')

const userData = ref({
  name: '',
  email: '',
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

onMounted(async () => {
  if (authStore.user) {
    userData.value.name = authStore.user.name
    userData.value.email = authStore.user.email
  } else {
    await authStore.fetchCurrentUser()
    if (authStore.user) {
      userData.value.name = authStore.user.name
      userData.value.email = authStore.user.email
    }
  }
})

const updateProfile = async () => {
  loading.value = true
  success.value = false
  error.value = ''
  
  try {
    // Giả lập cập nhật thông tin người dùng
    // Trong thực tế, bạn cần thêm API endpoint để cập nhật thông tin người dùng
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = true
    userData.value.current_password = ''
    userData.value.new_password = ''
    userData.value.new_password_confirmation = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Hồ sơ cá nhân</h1>
    </div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div v-if="success" class="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Thông tin đã được cập nhật thành công!</span>
        </div>
        
        <div v-if="error" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <div class="flex flex-col md:flex-row gap-8">
          <div class="md:w-1/3 flex flex-col items-center">
            <div class="avatar">
              <div class="w-32 h-32 rounded-full">
                <img :src="authStore.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&size=128`" alt="User avatar" />
              </div>
            </div>
            
            <h2 class="text-xl font-bold mt-4">{{ authStore.user?.name }}</h2>
            <p class="text-gray-500">{{ authStore.user?.email }}</p>
            
            <div class="mt-4">
              <div v-for="role in authStore.user?.roles" :key="role.id" class="badge badge-primary mr-2 mb-2">
                {{ role.name }}
              </div>
            </div>
          </div>
          
          <div class="md:w-2/3">
            <h2 class="text-xl font-bold mb-4">Thông tin cá nhân</h2>
            
            <form @submit.prevent="updateProfile">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Họ tên</span>
                </label>
                <input 
                  type="text" 
                  v-model="userData.name" 
                  placeholder="Nhập họ tên" 
                  class="input input-bordered" 
                  required 
                />
              </div>
              
              <div class="form-control mt-4">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <input 
                  type="email" 
                  v-model="userData.email" 
                  placeholder="Nhập email" 
                  class="input input-bordered" 
                  required 
                />
              </div>
              
              <div class="divider">Đổi mật khẩu</div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Mật khẩu hiện tại</span>
                </label>
                <input 
                  type="password" 
                  v-model="userData.current_password" 
                  placeholder="Nhập mật khẩu hiện tại" 
                  class="input input-bordered" 
                />
              </div>
              
              <div class="form-control mt-4">
                <label class="label">
                  <span class="label-text">Mật khẩu mới</span>
                </label>
                <input 
                  type="password" 
                  v-model="userData.new_password" 
                  placeholder="Nhập mật khẩu mới" 
                  class="input input-bordered" 
                />
              </div>
              
              <div class="form-control mt-4">
                <label class="label">
                  <span class="label-text">Xác nhận mật khẩu mới</span>
                </label>
                <input 
                  type="password" 
                  v-model="userData.new_password_confirmation" 
                  placeholder="Nhập lại mật khẩu mới" 
                  class="input input-bordered" 
                />
              </div>
              
              <div class="form-control mt-6">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="loading"
                >
                  <span v-if="loading" class="loading loading-spinner"></span>
                  {{ loading ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
