<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

const loading = ref(true)
const showCreateModal = ref(false)
const searchQuery = ref('')

const newProject = ref({
  name: '',
  description: ''
})

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projectStore.projects
  
  const query = searchQuery.value.toLowerCase()
  return projectStore.projects.filter(project => 
    project.name.toLowerCase().includes(query) || 
    (project.description && project.description.toLowerCase().includes(query))
  )
})

const ownedProjects = computed(() => {
  return filteredProjects.value.filter(project => project.owner_id === authStore.user?.id)
})

const memberProjects = computed(() => {
  return filteredProjects.value.filter(project => {
    // Check if user is a member but not the owner
    return project.owner_id !== authStore.user?.id && 
           project.members.some(member => member.id === authStore.user?.id)
  })
})

onMounted(async () => {
  try {
    await projectStore.fetchProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
  } finally {
    loading.value = false
  }
})

const openCreateModal = () => {
  newProject.value = { name: '', description: '' }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const createProject = async () => {
  try {
    await projectStore.createProject(newProject.value)
    closeCreateModal()
  } catch (error) {
    console.error('Error creating project:', error)
  }
}

const viewProject = (projectId) => {
  router.push(`/projects/${projectId}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}
</script>

<template>
  <AppLayout>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Dự án</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tạo dự án mới
      </button>
    </div>
    
    <div class="mb-6">
      <div class="form-control">
        <div class="input-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm dự án..." 
            class="input input-bordered w-full" 
          />
          <button class="btn btn-square">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else>
      <!-- Owned Projects -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Dự án của tôi</h2>
        
        <div v-if="ownedProjects.length === 0" class="text-center py-8 bg-base-200 rounded-lg">
          <p class="text-gray-500">Bạn chưa có dự án nào</p>
          <button @click="openCreateModal" class="btn btn-primary mt-4">Tạo dự án mới</button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="project in ownedProjects" :key="project.id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div class="card-body">
              <h2 class="card-title">{{ project.name }}</h2>
              <p class="text-sm text-gray-500 mb-2">Cập nhật: {{ formatDate(project.updated_at) }}</p>
              <p v-if="project.description" class="mb-4 line-clamp-2">{{ project.description }}</p>
              <div class="flex items-center mb-4">
                <div class="avatar-group -space-x-2">
                  <div v-for="(member, index) in project.members.slice(0, 3)" :key="index" class="avatar">
                    <div class="w-8 h-8">
                      <img :src="member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`" :alt="member.name" />
                    </div>
                  </div>
                  <div v-if="project.members.length > 3" class="avatar placeholder">
                    <div class="w-8 h-8 bg-neutral-focus text-neutral-content">
                      <span>+{{ project.members.length - 3 }}</span>
                    </div>
                  </div>
                </div>
                <span class="ml-2 text-sm">{{ project.members.length }} thành viên</span>
              </div>
              <div class="card-actions justify-end">
                <button @click="viewProject(project.id)" class="btn btn-primary btn-sm">Xem chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Member Projects -->
      <div>
        <h2 class="text-xl font-bold mb-4">Dự án tham gia</h2>
        
        <div v-if="memberProjects.length === 0" class="text-center py-8 bg-base-200 rounded-lg">
          <p class="text-gray-500">Bạn chưa tham gia dự án nào</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="project in memberProjects" :key="project.id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div class="card-body">
              <h2 class="card-title">{{ project.name }}</h2>
              <p class="text-sm text-gray-500 mb-2">
                Chủ sở hữu: {{ project.owner?.name }}
              </p>
              <p v-if="project.description" class="mb-4 line-clamp-2">{{ project.description }}</p>
              <div class="flex items-center mb-4">
                <div class="avatar-group -space-x-2">
                  <div v-for="(member, index) in project.members.slice(0, 3)" :key="index" class="avatar">
                    <div class="w-8 h-8">
                      <img :src="member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`" :alt="member.name" />
                    </div>
                  </div>
                  <div v-if="project.members.length > 3" class="avatar placeholder">
                    <div class="w-8 h-8 bg-neutral-focus text-neutral-content">
                      <span>+{{ project.members.length - 3 }}</span>
                    </div>
                  </div>
                </div>
                <span class="ml-2 text-sm">{{ project.members.length }} thành viên</span>
              </div>
              <div class="card-actions justify-end">
                <button @click="viewProject(project.id)" class="btn btn-primary btn-sm">Xem chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Project Modal -->
    <dialog :open="showCreateModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Tạo dự án mới</h3>
        
        <form @submit.prevent="createProject">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tên dự án</span>
            </label>
            <input 
              type="text" 
              v-model="newProject.name" 
              placeholder="Nhập tên dự án" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Mô tả</span>
            </label>
            <textarea 
              v-model="newProject.description" 
              placeholder="Nhập mô tả dự án" 
              class="textarea textarea-bordered h-24" 
            ></textarea>
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeCreateModal" class="btn">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="projectStore.loading">
              <span v-if="projectStore.loading" class="loading loading-spinner"></span>
              {{ projectStore.loading ? 'Đang tạo...' : 'Tạo dự án' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeCreateModal">close</button>
      </form>
    </dialog>
  </AppLayout>
</template>
