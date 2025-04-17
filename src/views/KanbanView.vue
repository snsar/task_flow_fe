<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const loading = ref(true)
const selectedProjectId = ref(null)
const showCreateTaskModal = ref(false)
const draggedTask = ref(null)

const newTask = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  project_id: null,
  assigned_to: null
})

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      taskStore.fetchTasks()
    ])
    
    // Set default selected project if there are projects
    if (projectStore.projects.length > 0) {
      selectedProjectId.value = projectStore.projects[0].id
    }
  } catch (error) {
    console.error('Error loading kanban data:', error)
  } finally {
    loading.value = false
  }
})

const todoTasks = computed(() => {
  if (!selectedProjectId.value) return []
  return taskStore.tasks.filter(task => 
    task.project_id === selectedProjectId.value && task.status === 'todo'
  )
})

const inProgressTasks = computed(() => {
  if (!selectedProjectId.value) return []
  return taskStore.tasks.filter(task => 
    task.project_id === selectedProjectId.value && task.status === 'in_progress'
  )
})

const completedTasks = computed(() => {
  if (!selectedProjectId.value) return []
  return taskStore.tasks.filter(task => 
    task.project_id === selectedProjectId.value && task.status === 'completed'
  )
})

const openCreateTaskModal = () => {
  newTask.value = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project_id: selectedProjectId.value,
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

const handleDragStart = (task) => {
  draggedTask.value = task
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = async (status) => {
  if (!draggedTask.value) return
  
  if (draggedTask.value.status !== status) {
    try {
      await taskStore.updateTaskStatus(draggedTask.value.id, status)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }
  
  draggedTask.value = null
}

const viewTask = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Không có hạn'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
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
      <h1 class="text-3xl font-bold">Bảng Kanban</h1>
      <button 
        @click="openCreateTaskModal" 
        class="btn btn-primary"
        :disabled="!selectedProjectId"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tạo công việc mới
      </button>
    </div>
    
    <div class="mb-6">
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">Chọn dự án</span>
        </div>
        <select 
          v-model="selectedProjectId" 
          class="select select-bordered"
          :disabled="projectStore.projects.length === 0"
        >
          <option v-if="projectStore.projects.length === 0" disabled value="">Không có dự án nào</option>
          <option v-for="project in projectStore.projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </label>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="!selectedProjectId" class="text-center py-12 bg-base-200 rounded-lg">
      <p class="text-gray-500 mb-4">Vui lòng chọn một dự án để xem bảng Kanban</p>
      <router-link to="/projects" class="btn btn-primary">Đi đến dự án</router-link>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Todo Column -->
      <div 
        class="bg-base-200 rounded-lg p-4"
        @dragover="handleDragOver"
        @drop="handleDrop('todo')"
      >
        <h2 class="text-lg font-bold mb-4 flex items-center">
          <div class="w-3 h-3 rounded-full bg-secondary mr-2"></div>
          Cần làm
          <div class="badge badge-secondary ml-2">{{ todoTasks.length }}</div>
        </h2>
        
        <div v-if="todoTasks.length === 0" class="text-center py-8 bg-base-100 rounded-lg">
          <p class="text-gray-500">Không có công việc nào</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="task in todoTasks" 
            :key="task.id" 
            class="card bg-base-100 shadow-md cursor-pointer"
            draggable="true"
            @dragstart="handleDragStart(task)"
            @click="viewTask(task.id)"
          >
            <div class="card-body p-4">
              <h3 class="card-title text-base">{{ task.title }}</h3>
              <p v-if="task.description" class="text-sm line-clamp-2 mb-2">{{ task.description }}</p>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <div class="badge" :class="getPriorityClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </div>
                <div class="badge badge-outline">
                  {{ formatDate(task.due_date) }}
                </div>
              </div>
              
              <div v-if="task.assignedUser" class="flex items-center mt-2">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img 
                      :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                      :alt="task.assignedUser.name" 
                    />
                  </div>
                </div>
                <span class="text-xs ml-2">{{ task.assignedUser.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- In Progress Column -->
      <div 
        class="bg-base-200 rounded-lg p-4"
        @dragover="handleDragOver"
        @drop="handleDrop('in_progress')"
      >
        <h2 class="text-lg font-bold mb-4 flex items-center">
          <div class="w-3 h-3 rounded-full bg-primary mr-2"></div>
          Đang làm
          <div class="badge badge-primary ml-2">{{ inProgressTasks.length }}</div>
        </h2>
        
        <div v-if="inProgressTasks.length === 0" class="text-center py-8 bg-base-100 rounded-lg">
          <p class="text-gray-500">Không có công việc nào</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="task in inProgressTasks" 
            :key="task.id" 
            class="card bg-base-100 shadow-md cursor-pointer"
            draggable="true"
            @dragstart="handleDragStart(task)"
            @click="viewTask(task.id)"
          >
            <div class="card-body p-4">
              <h3 class="card-title text-base">{{ task.title }}</h3>
              <p v-if="task.description" class="text-sm line-clamp-2 mb-2">{{ task.description }}</p>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <div class="badge" :class="getPriorityClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </div>
                <div class="badge badge-outline">
                  {{ formatDate(task.due_date) }}
                </div>
              </div>
              
              <div v-if="task.assignedUser" class="flex items-center mt-2">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img 
                      :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                      :alt="task.assignedUser.name" 
                    />
                  </div>
                </div>
                <span class="text-xs ml-2">{{ task.assignedUser.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Completed Column -->
      <div 
        class="bg-base-200 rounded-lg p-4"
        @dragover="handleDragOver"
        @drop="handleDrop('completed')"
      >
        <h2 class="text-lg font-bold mb-4 flex items-center">
          <div class="w-3 h-3 rounded-full bg-success mr-2"></div>
          Hoàn thành
          <div class="badge badge-success ml-2">{{ completedTasks.length }}</div>
        </h2>
        
        <div v-if="completedTasks.length === 0" class="text-center py-8 bg-base-100 rounded-lg">
          <p class="text-gray-500">Không có công việc nào</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="task in completedTasks" 
            :key="task.id" 
            class="card bg-base-100 shadow-md cursor-pointer"
            draggable="true"
            @dragstart="handleDragStart(task)"
            @click="viewTask(task.id)"
          >
            <div class="card-body p-4">
              <h3 class="card-title text-base">{{ task.title }}</h3>
              <p v-if="task.description" class="text-sm line-clamp-2 mb-2">{{ task.description }}</p>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <div class="badge" :class="getPriorityClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </div>
                <div class="badge badge-outline">
                  {{ formatDate(task.due_date) }}
                </div>
              </div>
              
              <div v-if="task.assignedUser" class="flex items-center mt-2">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img 
                      :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                      :alt="task.assignedUser.name" 
                    />
                  </div>
                </div>
                <span class="text-xs ml-2">{{ task.assignedUser.name }}</span>
              </div>
            </div>
          </div>
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
