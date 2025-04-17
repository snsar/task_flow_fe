<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.loginUser(credentials.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        
        <div v-if="error" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              v-model="credentials.email" 
              placeholder="email@example.com" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Mật khẩu</span>
            </label>
            <input 
              type="password" 
              v-model="credentials.password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required 
            />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover">Quên mật khẩu?</a>
            </label>
          </div>
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </div>
        </form>
        
        <div class="divider">HOẶC</div>
        
        <div class="text-center">
          <p>Chưa có tài khoản?</p>
          <router-link to="/register" class="link link-primary">Đăng ký ngay</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
