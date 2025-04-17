<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import AppLayout from '@/components/layout/AppLayout.vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const loading = ref(true)
const showEditTaskModal = ref(false)
const showDeleteConfirmModal = ref(false)

const editedTask = ref({
  title: '',
  description: '',
  status: '',
  priority: '',
  due_date: '',
  assigned_to: null,
})

const canEdit = computed(() => {
  if (!taskStore.currentTask) return false

  const isCreator = taskStore.currentTask.created_by === authStore.user?.id
  const isAssigned = taskStore.currentTask.assigned_to === authStore.user?.id
  const isProjectOwner = taskStore.currentTask.project?.owner_id === authStore.user?.id

  return isCreator || isAssigned || isProjectOwner || authStore.isAdmin
})

const canDelete = computed(() => {
  if (!taskStore.currentTask) return false

  const isCreator = taskStore.currentTask.created_by === authStore.user?.id
  const isProjectOwner = taskStore.currentTask.project?.owner_id === authStore.user?.id

  return isCreator || isProjectOwner || authStore.isAdmin
})

onMounted(async () => {
  try {
    // Reset error state
    taskStore.error = null

    // Validate the task ID
    if (!props.id) {
      console.error('Invalid task ID')
      loading.value = false
      return
    }

    // Fetch task data
    await taskStore.fetchTask(props.id)

    // If task was loaded successfully and has a project_id, fetch project data
    if (taskStore.currentTask?.project_id) {
      await projectStore.fetchProject(taskStore.currentTask.project_id)
    }
  } catch (error) {
    console.error('Error loading task data:', error)
  } finally {
    loading.value = false
  }
})

const openEditTaskModal = () => {
  // Check if currentTask exists
  if (!taskStore.currentTask) {
    console.error('Cannot edit: Task not found')
    return
  }

  editedTask.value = {
    title: taskStore.currentTask.title || '',
    description: taskStore.currentTask.description || '',
    status: taskStore.currentTask.status || 'todo',
    priority: taskStore.currentTask.priority || 'medium',
    due_date: taskStore.currentTask.due_date
      ? new Date(taskStore.currentTask.due_date).toISOString().split('T')[0]
      : '',
    assigned_to: taskStore.currentTask.assigned_to || null,
  }
  showEditTaskModal.value = true
}

const closeEditTaskModal = () => {
  showEditTaskModal.value = false
}

const openDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = true
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
}

const updateTask = async () => {
  try {
    await taskStore.updateTask(props.id, editedTask.value)
    closeEditTaskModal()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

const updateTaskStatus = async (status) => {
  try {
    await taskStore.updateTaskStatus(props.id, status)
  } catch (error) {
    console.error('Error updating task status:', error)
  }
}

const deleteTask = async () => {
  try {
    // Check if task exists
    if (!taskStore.currentTask) {
      console.error('Cannot delete: Task not found')
      closeDeleteConfirmModal()
      return
    }

    await taskStore.deleteTask(props.id)
    window.location.href = '/tasks'
  } catch (error) {
    console.error('Error deleting task:', error)
    closeDeleteConfirmModal()
  }
}

const goToProject = () => {
  if (taskStore.currentTask?.project_id) {
    window.location.href = `/projects/${taskStore.currentTask.project_id}`
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Không có hạn'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'todo':
      return 'badge-secondary'
    case 'in_progress':
      return 'badge-primary'
    case 'completed':
      return 'badge-success'
    default:
      return 'badge-ghost'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'todo':
      return 'Cần làm'
    case 'in_progress':
      return 'Đang làm'
    case 'completed':
      return 'Hoàn thành'
    default:
      return status
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'low':
      return 'badge-info'
    case 'medium':
      return 'badge-warning'
    case 'high':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 'low':
      return 'Thấp'
    case 'medium':
      return 'Trung bình'
    case 'high':
      return 'Cao'
    default:
      return priority
  }
}
</script>

<template>
  <AppLayout>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="!taskStore.currentTask" class="text-center py-12 bg-base-200 rounded-lg">
      <p class="text-gray-500 mb-4">Công việc không tồn tại hoặc bạn không có quyền truy cập</p>
      <router-link to="/tasks" class="btn btn-primary">Quay lại danh sách công việc</router-link>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-bold">{{ taskStore.currentTask.title }}</h1>
            <div class="badge" :class="getStatusClass(taskStore.currentTask.status)">
              {{ getStatusText(taskStore.currentTask.status) }}
            </div>
            <div class="badge" :class="getPriorityClass(taskStore.currentTask.priority)">
              {{ getPriorityText(taskStore.currentTask.priority) }}
            </div>
          </div>

          <p class="text-gray-500 mt-1">
            Dự án:
            <a @click="goToProject" class="link link-primary cursor-pointer">{{
              taskStore.currentTask.project?.name
            }}</a>
          </p>
        </div>

        <div class="flex gap-2 mt-4 md:mt-0">
          <div v-if="canEdit" class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-outline btn-primary btn-sm">
              Cập nhật trạng thái
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </label>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a
                  @click="updateTaskStatus('todo')"
                  :class="{ 'bg-base-200': taskStore.currentTask.status === 'todo' }"
                  >Cần làm</a
                >
              </li>
              <li>
                <a
                  @click="updateTaskStatus('in_progress')"
                  :class="{ 'bg-base-200': taskStore.currentTask.status === 'in_progress' }"
                  >Đang làm</a
                >
              </li>
              <li>
                <a
                  @click="updateTaskStatus('completed')"
                  :class="{ 'bg-base-200': taskStore.currentTask.status === 'completed' }"
                  >Hoàn thành</a
                >
              </li>
            </ul>
          </div>

          <div v-if="canEdit || canDelete" class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-sm">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </label>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li v-if="canEdit"><a @click="openEditTaskModal">Chỉnh sửa công việc</a></li>
              <li v-if="canDelete">
                <a @click="openDeleteConfirmModal" class="text-error">Xóa công việc</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
              <h2 class="card-title text-xl">Mô tả</h2>

              <p v-if="taskStore.currentTask.description" class="mt-2 whitespace-pre-line">
                {{ taskStore.currentTask.description }}
              </p>
              <p v-else class="mt-2 text-gray-500 italic">Không có mô tả</p>
            </div>
          </div>
        </div>

        <div>
          <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
              <h2 class="card-title text-xl">Chi tiết</h2>

              <div class="mt-4 space-y-4">
                <div>
                  <p class="text-gray-500">Trạng thái</p>
                  <div class="badge mt-1" :class="getStatusClass(taskStore.currentTask.status)">
                    {{ getStatusText(taskStore.currentTask.status) }}
                  </div>
                </div>

                <div>
                  <p class="text-gray-500">Ưu tiên</p>
                  <div class="badge mt-1" :class="getPriorityClass(taskStore.currentTask.priority)">
                    {{ getPriorityText(taskStore.currentTask.priority) }}
                  </div>
                </div>

                <div>
                  <p class="text-gray-500">Hạn hoàn thành</p>
                  <p class="font-medium">{{ formatDate(taskStore.currentTask.due_date) }}</p>
                </div>

                <div>
                  <p class="text-gray-500">Người tạo</p>
                  <div class="flex items-center mt-1">
                    <div class="avatar mr-2">
                      <div class="w-6 h-6 rounded-full">
                        <img
                          :src="
                            taskStore.currentTask.creator?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(taskStore.currentTask.creator?.name || 'User')}`
                          "
                          :alt="taskStore.currentTask.creator?.name"
                        />
                      </div>
                    </div>
                    <span>{{ taskStore.currentTask.creator?.name }}</span>
                  </div>
                </div>

                <div>
                  <p class="text-gray-500">Người được giao</p>
                  <div v-if="taskStore.currentTask.assignedUser" class="flex items-center mt-1">
                    <div class="avatar mr-2">
                      <div class="w-6 h-6 rounded-full">
                        <img
                          :src="
                            taskStore.currentTask.assignedUser.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(taskStore.currentTask.assignedUser.name)}`
                          "
                          :alt="taskStore.currentTask.assignedUser.name"
                        />
                      </div>
                    </div>
                    <span>{{ taskStore.currentTask.assignedUser.name }}</span>
                  </div>
                  <p v-else class="text-gray-500 italic mt-1">Chưa giao</p>
                </div>

                <div>
                  <p class="text-gray-500">Ngày tạo</p>
                  <p class="font-medium">{{ formatDate(taskStore.currentTask.created_at) }}</p>
                </div>

                <div>
                  <p class="text-gray-500">Cập nhật lần cuối</p>
                  <p class="font-medium">{{ formatDate(taskStore.currentTask.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <dialog :open="showEditTaskModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Chỉnh sửa công việc</h3>

        <form @submit.prevent="updateTask">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tiêu đề</span>
            </label>
            <input
              type="text"
              v-model="editedTask.title"
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
              v-model="editedTask.description"
              placeholder="Nhập mô tả công việc"
              class="textarea textarea-bordered h-24"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Trạng thái</span>
              </label>
              <select v-model="editedTask.status" class="select select-bordered w-full">
                <option value="todo">Cần làm</option>
                <option value="in_progress">Đang làm</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Ưu tiên</span>
              </label>
              <select v-model="editedTask.priority" class="select select-bordered w-full">
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
            <input type="date" v-model="editedTask.due_date" class="input input-bordered" />
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Giao cho</span>
            </label>
            <select v-model="editedTask.assigned_to" class="select select-bordered w-full">
              <option :value="null">Chưa giao</option>
              <option :value="authStore.user?.id">Bản thân</option>
              <option
                v-for="member in projectStore.currentProject?.members || []"
                :key="member?.id"
                :value="member?.id"
                v-if="member?.id && authStore.user?.id && member.id !== authStore.user.id"
              >
                {{ member.name }}
              </option>
            </select>
          </div>

          <div class="modal-action">
            <button type="button" @click="closeEditTaskModal" class="btn">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="taskStore.loading">
              <span v-if="taskStore.loading" class="loading loading-spinner"></span>
              {{ taskStore.loading ? 'Đang cập nhật...' : 'Cập nhật' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeEditTaskModal">close</button>
      </form>
    </dialog>

    <!-- Delete Confirm Modal -->
    <dialog :open="showDeleteConfirmModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Xác nhận xóa công việc</h3>

        <p class="py-4">
          Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.
        </p>

        <div class="modal-action">
          <button @click="closeDeleteConfirmModal" class="btn">Hủy</button>
          <button @click="deleteTask" class="btn btn-error" :disabled="taskStore.loading">
            <span v-if="taskStore.loading" class="loading loading-spinner"></span>
            {{ taskStore.loading ? 'Đang xóa...' : 'Xóa công việc' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeDeleteConfirmModal">close</button>
      </form>
    </dialog>
  </AppLayout>
</template>
