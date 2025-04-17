import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as taskService from '@/services/taskService'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const currentTask = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties for filtered tasks
  const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'))
  const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'in_progress'))
  const completedTasks = computed(() => tasks.value.filter(task => task.status === 'completed'))

  // Group tasks by project
  const tasksByProject = computed(() => {
    const grouped = {}
    tasks.value.forEach(task => {
      if (!grouped[task.project_id]) {
        grouped[task.project_id] = []
      }
      grouped[task.project_id].push(task)
    })
    return grouped
  })

  const fetchTasks = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      tasks.value = await taskService.getTasks(filters)
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách công việc'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id) => {
    loading.value = true
    error.value = null
    try {
      currentTask.value = await taskService.getTask(id)
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể lấy thông tin công việc ${id}`
      console.error(`Error fetching task ${id}:`, err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData) => {
    loading.value = true
    error.value = null
    try {
      const newTask = await taskService.createTask(taskData)
      tasks.value.push(newTask)
      return newTask
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tạo công việc mới'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id, taskData) => {
    loading.value = true
    error.value = null
    try {
      const updatedTask = await taskService.updateTask(id, taskData)
      
      // Update in tasks array
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Update current task if it's the same
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      
      return updatedTask
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể cập nhật công việc ${id}`
      console.error(`Error updating task ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTaskStatus = async (id, status) => {
    loading.value = true
    error.value = null
    try {
      const updatedTask = await taskService.updateTaskStatus(id, status)
      
      // Update in tasks array
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Update current task if it's the same
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      
      return updatedTask
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể cập nhật trạng thái công việc ${id}`
      console.error(`Error updating task status ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id) => {
    loading.value = true
    error.value = null
    try {
      await taskService.deleteTask(id)
      
      // Remove from tasks array
      tasks.value = tasks.value.filter(t => t.id !== id)
      
      // Clear current task if it's the same
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể xóa công việc ${id}`
      console.error(`Error deleting task ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    currentTask,
    loading,
    error,
    todoTasks,
    inProgressTasks,
    completedTasks,
    tasksByProject,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  }
})
