import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as projectService from '@/services/projectService'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      projects.value = await projectService.getProjects()
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách dự án'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (id) => {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await projectService.getProject(id)
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể lấy thông tin dự án ${id}`
      console.error(`Error fetching project ${id}:`, err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData) => {
    loading.value = true
    error.value = null
    try {
      const newProject = await projectService.createProject(projectData)
      projects.value.push(newProject)
      return newProject
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tạo dự án mới'
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id, projectData) => {
    loading.value = true
    error.value = null
    try {
      const updatedProject = await projectService.updateProject(id, projectData)
      
      // Update in projects array
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể cập nhật dự án ${id}`
      console.error(`Error updating project ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id) => {
    loading.value = true
    error.value = null
    try {
      await projectService.deleteProject(id)
      
      // Remove from projects array
      projects.value = projects.value.filter(p => p.id !== id)
      
      // Clear current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể xóa dự án ${id}`
      console.error(`Error deleting project ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addMember = async (projectId, userId) => {
    loading.value = true
    error.value = null
    try {
      const member = await projectService.addProjectMember(projectId, userId)
      
      // Update current project if it's the same
      if (currentProject.value?.id === projectId) {
        currentProject.value.members.push(member)
      }
      
      return member
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể thêm thành viên vào dự án ${projectId}`
      console.error(`Error adding member to project ${projectId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeMember = async (projectId, userId) => {
    loading.value = true
    error.value = null
    try {
      await projectService.removeProjectMember(projectId, userId)
      
      // Update current project if it's the same
      if (currentProject.value?.id === projectId) {
        currentProject.value.members = currentProject.value.members.filter(m => m.id !== userId)
      }
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || `Không thể xóa thành viên khỏi dự án ${projectId}`
      console.error(`Error removing member from project ${projectId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
  }
})
