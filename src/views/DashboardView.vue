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

const userName = computed(() => authStore.user?.name || 'User')
const projectCount = computed(() => projectStore.projects.length)
const taskCount = computed(() => taskStore.tasks.length)
const completedTaskCount = computed(() => taskStore.completedTasks.length)
const pendingTaskCount = computed(() => taskStore.todoTasks.length + taskStore.inProgressTasks.length)
const completionRate = computed(() => {
  if (taskCount.value === 0) return 0
  return Math.round((completedTaskCount.value / taskCount.value) * 100)
})

const recentProjects = computed(() => {
  return [...projectStore.projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
})

const upcomingTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(task => task.status !== 'completed' && task.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)
})

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      taskStore.fetchTasks()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
})

const navigateToProject = (projectId) => {
  router.push(`/projects/${projectId}`)
}

const navigateToTask = (taskId) => {
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
    <div v-else>
      <h1 class="text-3xl font-bold mb-6">Xin chào, {{ userName }}!</h1>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="stat-title">Dự án</div>
          <div class="stat-value text-primary">{{ projectCount }}</div>
          <div class="stat-desc">Tổng số dự án</div>
        </div>
        
        <div class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div class="stat-title">Công việc</div>
          <div class="stat-value text-secondary">{{ taskCount }}</div>
          <div class="stat-desc">Tổng số công việc</div>
        </div>
        
        <div class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="stat-title">Hoàn thành</div>
          <div class="stat-value text-success">{{ completedTaskCount }}</div>
          <div class="stat-desc">Công việc đã hoàn thành</div>
        </div>
        
        <div class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="stat-title">Tiến độ</div>
          <div class="stat-value text-info">{{ completionRate }}%</div>
          <div class="stat-desc">{{ completedTaskCount }}/{{ taskCount }} công việc</div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Projects -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Dự án gần đây</h2>
            
            <div v-if="recentProjects.length === 0" class="text-center py-4 text-gray-500">
              Chưa có dự án nào
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Tên dự án</th>
                    <th>Chủ sở hữu</th>
                    <th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="project in recentProjects" :key="project.id" @click="navigateToProject(project.id)" class="hover cursor-pointer">
                    <td>{{ project.name }}</td>
                    <td>{{ project.owner?.name }}</td>
                    <td>{{ new Date(project.updated_at).toLocaleDateString('vi-VN') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="card-actions justify-end mt-4">
              <router-link to="/projects" class="btn btn-primary btn-sm">Xem tất cả dự án</router-link>
            </div>
          </div>
        </div>
        
        <!-- Upcoming Tasks -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Công việc sắp đến hạn</h2>
            
            <div v-if="upcomingTasks.length === 0" class="text-center py-4 text-gray-500">
              Không có công việc sắp đến hạn
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Công việc</th>
                    <th>Trạng thái</th>
                    <th>Ưu tiên</th>
                    <th>Hạn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in upcomingTasks" :key="task.id" @click="navigateToTask(task.id)" class="hover cursor-pointer">
                    <td>{{ task.title }}</td>
                    <td>
                      <div class="badge" :class="getStatusClass(task.status)">
                        {{ task.status === 'todo' ? 'Cần làm' : task.status === 'in_progress' ? 'Đang làm' : 'Hoàn thành' }}
                      </div>
                    </td>
                    <td>
                      <div class="badge" :class="getPriorityClass(task.priority)">
                        {{ task.priority === 'low' ? 'Thấp' : task.priority === 'medium' ? 'Trung bình' : 'Cao' }}
                      </div>
                    </td>
                    <td>{{ formatDate(task.due_date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="card-actions justify-end mt-4">
              <router-link to="/tasks" class="btn btn-primary btn-sm">Xem tất cả công việc</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
