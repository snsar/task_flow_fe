import { apiClient } from './api'

export const getProjects = async () => {
  try {
    const response = await apiClient.get('/projects')
    return response.data.projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

export const getProject = async (id) => {
  try {
    const response = await apiClient.get(`/projects/${id}`)
    return response.data.project
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    throw error
  }
}

export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/projects', projectData)
    return response.data.project
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const response = await apiClient.put(`/projects/${id}`, projectData)
    return response.data.project
  } catch (error) {
    console.error(`Error updating project ${id}:`, error)
    throw error
  }
}

export const deleteProject = async (id) => {
  try {
    await apiClient.delete(`/projects/${id}`)
    return true
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error)
    throw error
  }
}

export const addProjectMember = async (projectId, userId) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/members`, { user_id: userId })
    return response.data.member
  } catch (error) {
    console.error(`Error adding member to project ${projectId}:`, error)
    throw error
  }
}

export const removeProjectMember = async (projectId, userId) => {
  try {
    await apiClient.delete(`/projects/${projectId}/members`, { data: { user_id: userId } })
    return true
  } catch (error) {
    console.error(`Error removing member from project ${projectId}:`, error)
    throw error
  }
}
