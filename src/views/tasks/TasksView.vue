<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const loading = ref(true)
const showCreateTaskModal = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const projectFilter = ref('all')

const newTask = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  project_id: null,
  assigned_to: null
})

const filteredTasks = computed(() => {
  let result = [...taskStore.tasks]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) || 
      (task.description && task.description.toLowerCase().includes(query))
    )
  }
  
  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter(task => task.status === statusFilter.value)
  }
  
  // Filter by priority
  if (priorityFilter.value !== 'all') {
    result = result.filter(task => task.priority === priorityFilter.value)
  }
  
  // Filter by project
  if (projectFilter.value !== 'all') {
    result = result.filter(task => task.project_id === parseInt(projectFilter.value))
  }
  
  return result
})

const myTasks = computed(() => {
  return filteredTasks.value.filter(task => task.assigned_to === authStore.user?.id)
})

const createdTasks = computed(() => {
  return filteredTasks.value.filter(task => task.created_by === authStore.user?.id && task.assigned_to !== authStore.user?.id)
})

const otherTasks = computed(() => {
  return filteredTasks.value.filter(task => 
    task.assigned_to !== authStore.user?.id && 
    task.created_by !== authStore.user?.id
  )
})

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      taskStore.fetchTasks()
    ])
  } catch (error) {
    console.error('Error loading tasks data:', error)
  } finally {
    loading.value = false
  }
})

const openCreateTaskModal = () => {
  newTask.value = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project_id: projectStore.projects.length > 0 ? projectStore.projects[0].id : null,
    assigned_to: null
  }
  showCreateTaskModal.value = true
}

const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false
}

const createTask = async () => {
  try {
    await taskStore.createTask(newTask.value)
    closeCreateTaskModal()
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

const viewTask = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Không có hạn'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'todo': return 'badge-secondary'
    case 'in_progress': return 'badge-primary'
    case 'completed': return 'badge-success'
    default: return 'badge-ghost'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'todo': return 'Cần làm'
    case 'in_progress': return 'Đang làm'
    case 'completed': return 'Hoàn thành'
    default: return status
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'low': return 'badge-info'
    case 'medium': return 'badge-warning'
    case 'high': return 'badge-error'
    default: return 'badge-ghost'
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 'low': return 'Thấp'
    case 'medium': return 'Trung bình'
    case 'high': return 'Cao'
    default: return priority
  }
}
</script>

<template>
  <AppLayout>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Công việc</h1>
      <button @click="openCreateTaskModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tạo công việc mới
      </button>
    </div>
    
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Bộ lọc</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tìm kiếm</span>
            </label>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm công việc..." 
              class="input input-bordered" 
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Trạng thái</span>
            </label>
            <select v-model="statusFilter" class="select select-bordered w-full">
              <option value="all">Tất cả trạng thái</option>
              <option value="todo">Cần làm</option>
              <option value="in_progress">Đang làm</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Ưu tiên</span>
            </label>
            <select v-model="priorityFilter" class="select select-bordered w-full">
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Dự án</span>
            </label>
            <select v-model="projectFilter" class="select select-bordered w-full">
              <option value="all">Tất cả dự án</option>
              <option v-for="project in projectStore.projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else>
      <!-- My Tasks -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Công việc của tôi</h2>
        
        <div v-if="myTasks.length === 0" class="text-center py-8 bg-base-200 rounded-lg">
          <p class="text-gray-500">Bạn chưa được giao công việc nào</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Dự án</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
                <th>Hạn</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="task in myTasks" 
                :key="task.id" 
                @click="viewTask(task.id)" 
                class="hover cursor-pointer"
              >
                <td>{{ task.title }}</td>
                <td>{{ task.project?.name }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(task.status)">
                    {{ getStatusText(task.status) }}
                  </div>
                </td>
                <td>
                  <div class="badge" :class="getPriorityClass(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </div>
                </td>
                <td>{{ formatDate(task.due_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Created Tasks -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Công việc tôi đã tạo</h2>
        
        <div v-if="createdTasks.length === 0" class="text-center py-8 bg-base-200 rounded-lg">
          <p class="text-gray-500">Bạn chưa tạo công việc nào</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Dự án</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
                <th>Giao cho</th>
                <th>Hạn</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="task in createdTasks" 
                :key="task.id" 
                @click="viewTask(task.id)" 
                class="hover cursor-pointer"
              >
                <td>{{ task.title }}</td>
                <td>{{ task.project?.name }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(task.status)">
                    {{ getStatusText(task.status) }}
                  </div>
                </td>
                <td>
                  <div class="badge" :class="getPriorityClass(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </div>
                </td>
                <td>
                  <div v-if="task.assignedUser" class="flex items-center">
                    <div class="avatar mr-2">
                      <div class="w-6 h-6 rounded-full">
                        <img 
                          :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                          :alt="task.assignedUser.name" 
                        />
                      </div>
                    </div>
                    <span>{{ task.assignedUser.name }}</span>
                  </div>
                  <span v-else class="text-gray-500">Chưa giao</span>
                </td>
                <td>{{ formatDate(task.due_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Other Tasks -->
      <div v-if="otherTasks.length > 0">
        <h2 class="text-xl font-bold mb-4">Công việc khác</h2>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Dự án</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
                <th>Giao cho</th>
                <th>Hạn</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="task in otherTasks" 
                :key="task.id" 
                @click="viewTask(task.id)" 
                class="hover cursor-pointer"
              >
                <td>{{ task.title }}</td>
                <td>{{ task.project?.name }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(task.status)">
                    {{ getStatusText(task.status) }}
                  </div>
                </td>
                <td>
                  <div class="badge" :class="getPriorityClass(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </div>
                </td>
                <td>
                  <div v-if="task.assignedUser" class="flex items-center">
                    <div class="avatar mr-2">
                      <div class="w-6 h-6 rounded-full">
                        <img 
                          :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                          :alt="task.assignedUser.name" 
                        />
                      </div>
                    </div>
                    <span>{{ task.assignedUser.name }}</span>
                  </div>
                  <span v-else class="text-gray-500">Chưa giao</span>
                </td>
                <td>{{ formatDate(task.due_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Create Task Modal -->
    <dialog :open="showCreateTaskModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Tạo công việc mới</h3>
        
        <form @submit.prevent="createTask">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tiêu đề</span>
            </label>
            <input 
              type="text" 
              v-model="newTask.title" 
              placeholder="Nhập tiêu đề công việc" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Mô tả</span>
            </label>
            <textarea 
              v-model="newTask.description" 
              placeholder="Nhập mô tả công việc" 
              class="textarea textarea-bordered h-24" 
            ></textarea>
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Dự án</span>
            </label>
            <select v-model="newTask.project_id" class="select select-bordered w-full" required>
              <option v-if="projectStore.projects.length === 0" disabled value="">Không có dự án nào</option>
              <option v-for="project in projectStore.projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Trạng thái</span>
              </label>
              <select v-model="newTask.status" class="select select-bordered w-full">
                <option value="todo">Cần làm</option>
                <option value="in_progress">Đang làm</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Ưu tiên</span>
              </label>
              <select v-model="newTask.priority" class="select select-bordered w-full">
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Hạn hoàn thành</span>
            </label>
            <input 
              type="date" 
              v-model="newTask.due_date" 
              class="input input-bordered" 
            />
          </div>
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Giao cho</span>
            </label>
            <select v-model="newTask.assigned_to" class="select select-bordered w-full">
              <option :value="null">Chưa giao</option>
              <option :value="authStore.user?.id">Bản thân</option>
            </select>
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeCreateTaskModal" class="btn">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="taskStore.loading">
              <span v-if="taskStore.loading" class="loading loading-spinner"></span>
              {{ taskStore.loading ? 'Đang tạo...' : 'Tạo công việc' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeCreateTaskModal">close</button>
      </form>
    </dialog>
  </AppLayout>
</template>
