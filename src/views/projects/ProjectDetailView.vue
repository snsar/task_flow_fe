<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const loading = ref(true)
const showAddMemberModal = ref(false)
const showCreateTaskModal = ref(false)
const showEditProjectModal = ref(false)
const showDeleteConfirmModal = ref(false)
const newMemberEmail = ref('')
const memberError = ref('')

const newTask = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  project_id: null,
  assigned_to: null
})

const editedProject = ref({
  name: '',
  description: ''
})

const isOwner = computed(() => {
  return projectStore.currentProject?.owner_id === authStore.user?.id
})

const todoTasks = computed(() => {
  return taskStore.tasks.filter(task => task.status === 'todo')
})

const inProgressTasks = computed(() => {
  return taskStore.tasks.filter(task => task.status === 'in_progress')
})

const completedTasks = computed(() => {
  return taskStore.tasks.filter(task => task.status === 'completed')
})

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProject(props.id),
      taskStore.fetchTasks({ project_id: props.id })
    ])
  } catch (error) {
    console.error('Error loading project data:', error)
  } finally {
    loading.value = false
  }
})

const openAddMemberModal = () => {
  newMemberEmail.value = ''
  memberError.value = ''
  showAddMemberModal.value = true
}

const closeAddMemberModal = () => {
  showAddMemberModal.value = false
}

const openCreateTaskModal = () => {
  newTask.value = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project_id: props.id,
    assigned_to: null
  }
  showCreateTaskModal.value = true
}

const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false
}

const openEditProjectModal = () => {
  editedProject.value = {
    name: projectStore.currentProject.name,
    description: projectStore.currentProject.description || ''
  }
  showEditProjectModal.value = true
}

const closeEditProjectModal = () => {
  showEditProjectModal.value = false
}

const openDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = true
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
}

const addMember = async () => {
  memberError.value = ''
  
  if (!newMemberEmail.value) {
    memberError.value = 'Vui lòng nhập email thành viên'
    return
  }
  
  try {
    // Giả định: API sẽ tìm người dùng theo email và trả về ID
    // Trong thực tế, bạn cần thêm API endpoint để tìm người dùng theo email
    const userId = 1 // Thay bằng ID thực từ API
    
    await projectStore.addMember(props.id, userId)
    closeAddMemberModal()
  } catch (error) {
    memberError.value = error.response?.data?.message || 'Không thể thêm thành viên'
  }
}

const removeMember = async (userId) => {
  try {
    await projectStore.removeMember(props.id, userId)
  } catch (error) {
    console.error('Error removing member:', error)
  }
}

const createTask = async () => {
  try {
    await taskStore.createTask(newTask.value)
    closeCreateTaskModal()
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

const updateProject = async () => {
  try {
    await projectStore.updateProject(props.id, editedProject.value)
    closeEditProjectModal()
  } catch (error) {
    console.error('Error updating project:', error)
  }
}

const deleteProject = async () => {
  try {
    await projectStore.deleteProject(props.id)
    router.push('/projects')
  } catch (error) {
    console.error('Error deleting project:', error)
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

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'low': return 'badge-info'
    case 'medium': return 'badge-warning'
    case 'high': return 'badge-error'
    default: return 'badge-ghost'
  }
}
</script>

<template>
  <AppLayout>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="!projectStore.currentProject" class="text-center py-12 bg-base-200 rounded-lg">
      <p class="text-gray-500 mb-4">Dự án không tồn tại hoặc bạn không có quyền truy cập</p>
      <router-link to="/projects" class="btn btn-primary">Quay lại danh sách dự án</router-link>
    </div>
    
    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">{{ projectStore.currentProject.name }}</h1>
          <p class="text-gray-500">
            Chủ sở hữu: {{ projectStore.currentProject.owner?.name }}
          </p>
        </div>
        
        <div class="flex gap-2 mt-4 md:mt-0">
          <button v-if="isOwner" @click="openAddMemberModal" class="btn btn-outline btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Thêm thành viên
          </button>
          
          <button @click="openCreateTaskModal" class="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo công việc
          </button>
          
          <div v-if="isOwner" class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a @click="openEditProjectModal">Chỉnh sửa dự án</a></li>
              <li><a @click="openDeleteConfirmModal" class="text-error">Xóa dự án</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xl mb-8">
        <div class="card-body">
          <h2 class="card-title text-xl">Thông tin dự án</h2>
          
          <p v-if="projectStore.currentProject.description" class="mt-2">
            {{ projectStore.currentProject.description }}
          </p>
          <p v-else class="mt-2 text-gray-500 italic">
            Không có mô tả
          </p>
          
          <div class="divider"></div>
          
          <h3 class="font-bold">Thành viên ({{ projectStore.currentProject.members?.length || 0 }})</h3>
          
          <div class="flex flex-wrap gap-2 mt-2">
            <div v-for="member in projectStore.currentProject.members" :key="member.id" class="flex items-center bg-base-200 rounded-full px-3 py-1">
              <div class="avatar mr-2">
                <div class="w-6 h-6 rounded-full">
                  <img :src="member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`" :alt="member.name" />
                </div>
              </div>
              <span class="text-sm">{{ member.name }}</span>
              <button 
                v-if="isOwner && projectStore.currentProject.owner_id !== member.id" 
                @click="removeMember(member.id)" 
                class="ml-2 text-error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Công việc</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Todo Column -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg flex items-center">
              <div class="w-3 h-3 rounded-full bg-secondary mr-2"></div>
              Cần làm
              <div class="badge badge-secondary ml-2">{{ todoTasks.length }}</div>
            </h3>
            
            <div v-if="todoTasks.length === 0" class="text-center py-4 text-gray-500">
              Không có công việc nào
            </div>
            
            <div v-else class="space-y-3 mt-4">
              <div 
                v-for="task in todoTasks" 
                :key="task.id" 
                @click="viewTask(task.id)"
                class="card bg-base-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div class="card-body p-3">
                  <h4 class="font-bold">{{ task.title }}</h4>
                  
                  <div class="flex flex-wrap gap-2 mt-2">
                    <div class="badge" :class="getPriorityClass(task.priority)">
                      {{ task.priority === 'low' ? 'Thấp' : task.priority === 'medium' ? 'Trung bình' : 'Cao' }}
                    </div>
                    <div class="badge badge-outline">
                      {{ formatDate(task.due_date) }}
                    </div>
                  </div>
                  
                  <div v-if="task.assignedUser" class="flex items-center mt-2">
                    <div class="avatar">
                      <div class="w-5 h-5 rounded-full">
                        <img 
                          :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                          :alt="task.assignedUser.name" 
                        />
                      </div>
                    </div>
                    <span class="text-xs ml-1">{{ task.assignedUser.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- In Progress Column -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg flex items-center">
              <div class="w-3 h-3 rounded-full bg-primary mr-2"></div>
              Đang làm
              <div class="badge badge-primary ml-2">{{ inProgressTasks.length }}</div>
            </h3>
            
            <div v-if="inProgressTasks.length === 0" class="text-center py-4 text-gray-500">
              Không có công việc nào
            </div>
            
            <div v-else class="space-y-3 mt-4">
              <div 
                v-for="task in inProgressTasks" 
                :key="task.id" 
                @click="viewTask(task.id)"
                class="card bg-base-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div class="card-body p-3">
                  <h4 class="font-bold">{{ task.title }}</h4>
                  
                  <div class="flex flex-wrap gap-2 mt-2">
                    <div class="badge" :class="getPriorityClass(task.priority)">
                      {{ task.priority === 'low' ? 'Thấp' : task.priority === 'medium' ? 'Trung bình' : 'Cao' }}
                    </div>
                    <div class="badge badge-outline">
                      {{ formatDate(task.due_date) }}
                    </div>
                  </div>
                  
                  <div v-if="task.assignedUser" class="flex items-center mt-2">
                    <div class="avatar">
                      <div class="w-5 h-5 rounded-full">
                        <img 
                          :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                          :alt="task.assignedUser.name" 
                        />
                      </div>
                    </div>
                    <span class="text-xs ml-1">{{ task.assignedUser.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Completed Column -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg flex items-center">
              <div class="w-3 h-3 rounded-full bg-success mr-2"></div>
              Hoàn thành
              <div class="badge badge-success ml-2">{{ completedTasks.length }}</div>
            </h3>
            
            <div v-if="completedTasks.length === 0" class="text-center py-4 text-gray-500">
              Không có công việc nào
            </div>
            
            <div v-else class="space-y-3 mt-4">
              <div 
                v-for="task in completedTasks" 
                :key="task.id" 
                @click="viewTask(task.id)"
                class="card bg-base-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div class="card-body p-3">
                  <h4 class="font-bold">{{ task.title }}</h4>
                  
                  <div class="flex flex-wrap gap-2 mt-2">
                    <div class="badge" :class="getPriorityClass(task.priority)">
                      {{ task.priority === 'low' ? 'Thấp' : task.priority === 'medium' ? 'Trung bình' : 'Cao' }}
                    </div>
                    <div class="badge badge-outline">
                      {{ formatDate(task.due_date) }}
                    </div>
                  </div>
                  
                  <div v-if="task.assignedUser" class="flex items-center mt-2">
                    <div class="avatar">
                      <div class="w-5 h-5 rounded-full">
                        <img 
                          :src="task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}`" 
                          :alt="task.assignedUser.name" 
                        />
                      </div>
                    </div>
                    <span class="text-xs ml-1">{{ task.assignedUser.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Member Modal -->
    <dialog :open="showAddMemberModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Thêm thành viên</h3>
        
        <div v-if="memberError" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ memberError }}</span>
        </div>
        
        <form @submit.prevent="addMember">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email thành viên</span>
            </label>
            <input 
              type="email" 
              v-model="newMemberEmail" 
              placeholder="email@example.com" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeAddMemberModal" class="btn">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="projectStore.loading">
              <span v-if="projectStore.loading" class="loading loading-spinner"></span>
              {{ projectStore.loading ? 'Đang thêm...' : 'Thêm thành viên' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeAddMemberModal">close</button>
      </form>
    </dialog>
    
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
          
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Giao cho</span>
            </label>
            <select v-model="newTask.assigned_to" class="select select-bordered w-full">
              <option :value="null">Chưa giao</option>
              <option v-for="member in projectStore.currentProject.members" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
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
    
    <!-- Edit Project Modal -->
    <dialog :open="showEditProjectModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Chỉnh sửa dự án</h3>
        
        <form @submit.prevent="updateProject">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tên dự án</span>
            </label>
            <input 
              type="text" 
              v-model="editedProject.name" 
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
              v-model="editedProject.description" 
              placeholder="Nhập mô tả dự án" 
              class="textarea textarea-bordered h-24" 
            ></textarea>
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeEditProjectModal" class="btn">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="projectStore.loading">
              <span v-if="projectStore.loading" class="loading loading-spinner"></span>
              {{ projectStore.loading ? 'Đang cập nhật...' : 'Cập nhật' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeEditProjectModal">close</button>
      </form>
    </dialog>
    
    <!-- Delete Confirm Modal -->
    <dialog :open="showDeleteConfirmModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Xác nhận xóa dự án</h3>
        
        <p class="py-4">Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác và tất cả công việc trong dự án sẽ bị xóa.</p>
        
        <div class="modal-action">
          <button @click="closeDeleteConfirmModal" class="btn">Hủy</button>
          <button @click="deleteProject" class="btn btn-error" :disabled="projectStore.loading">
            <span v-if="projectStore.loading" class="loading loading-spinner"></span>
            {{ projectStore.loading ? 'Đang xóa...' : 'Xóa dự án' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeDeleteConfirmModal">close</button>
      </form>
    </dialog>
  </AppLayout>
</template>
