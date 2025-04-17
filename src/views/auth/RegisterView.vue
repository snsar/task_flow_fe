<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')
const errors = ref({})

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  errors.value = {}
  
  try {
    await authStore.registerUser(userData.value)
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      error.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">Đăng ký</h2>
        
        <div v-if="error" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Họ tên</span>
            </label>
            <input 
              type="text" 
              v-model="userData.name" 
              placeholder="Nguyễn Văn A" 
              class="input input-bordered" 
              :class="{ 'input-error': errors.name }"
              required 
            />
            <label v-if="errors.name" class="label">
              <span class="label-text-alt text-error">{{ errors.name[0] }}</span>
            </label>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              v-model="userData.email" 
              placeholder="email@example.com" 
              class="input input-bordered" 
              :class="{ 'input-error': errors.email }"
              required 
            />
            <label v-if="errors.email" class="label">
              <span class="label-text-alt text-error">{{ errors.email[0] }}</span>
            </label>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">
              <span class="label-text">Mật khẩu</span>
            </label>
            <input 
              type="password" 
              v-model="userData.password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              :class="{ 'input-error': errors.password }"
              required 
            />
            <label v-if="errors.password" class="label">
              <span class="label-text-alt text-error">{{ errors.password[0] }}</span>
            </label>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">
              <span class="label-text">Xác nhận mật khẩu</span>
            </label>
            <input 
              type="password" 
              v-model="userData.password_confirmation" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </button>
          </div>
        </form>
        
        <div class="divider">HOẶC</div>
        
        <div class="text-center">
          <p>Đã có tài khoản?</p>
          <router-link to="/login" class="link link-primary">Đăng nhập ngay</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
