import { apiClient } from './api'

export const getTasks = async (filters = {}) => {
  try {
    const response = await apiClient.get('/tasks', { params: filters })
    return response.data.tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export const getTask = async (id) => {
  try {
    const response = await apiClient.get(`/tasks/${id}`)
    return response.data.task
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error)
    throw error
  }
}

export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/tasks', taskData)
    return response.data.task
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const updateTask = async (id, taskData) => {
  try {
    const response = await apiClient.put(`/tasks/${id}`, taskData)
    return response.data.task
  } catch (error) {
    console.error(`Error updating task ${id}:`, error)
    throw error
  }
}

export const updateTaskStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status })
    return response.data.task
  } catch (error) {
    console.error(`Error updating task status ${id}:`, error)
    throw error
  }
}

export const deleteTask = async (id) => {
  try {
    await apiClient.delete(`/tasks/${id}`)
    return true
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error)
    throw error
  }
}
