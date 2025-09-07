import axios from 'axios'
import { Department, Program, Subject, Room } from '../../types/academic'

const API_BASE_URL = '/api/academic'

const academicAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
academicAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Departments
export const getDepartments = async (): Promise<Department[]> => {
  const response = await academicAPI.get('/departments/')
  return response.data
}

export const createDepartment = async (data: Partial<Department>): Promise<Department> => {
  const response = await academicAPI.post('/departments/', data)
  return response.data
}

export const updateDepartment = async (id: number, data: Partial<Department>): Promise<Department> => {
  const response = await academicAPI.patch(`/departments/${id}/`, data)
  return response.data
}

export const deleteDepartment = async (id: number): Promise<void> => {
  await academicAPI.delete(`/departments/${id}/`)
}

// Programs
export const getPrograms = async (departmentId?: number): Promise<Program[]> => {
  const params = departmentId ? { department: departmentId } : {}
  const response = await academicAPI.get('/programs/', { params })
  return response.data
}

export const createProgram = async (data: Partial<Program>): Promise<Program> => {
  const response = await academicAPI.post('/programs/', data)
  return response.data
}

export const updateProgram = async (id: number, data: Partial<Program>): Promise<Program> => {
  const response = await academicAPI.patch(`/programs/${id}/`, data)
  return response.data
}

export const deleteProgram = async (id: number): Promise<void> => {
  await academicAPI.delete(`/programs/${id}/`)
}

// Subjects
export const getSubjects = async (departmentId?: number): Promise<Subject[]> => {
  const params = departmentId ? { department: departmentId } : {}
  const response = await academicAPI.get('/subjects/', { params })
  return response.data
}

export const createSubject = async (data: Partial<Subject>): Promise<Subject> => {
  const response = await academicAPI.post('/subjects/', data)
  return response.data
}

export const updateSubject = async (id: number, data: Partial<Subject>): Promise<Subject> => {
  const response = await academicAPI.patch(`/subjects/${id}/`, data)
  return response.data
}

export const deleteSubject = async (id: number): Promise<void> => {
  await academicAPI.delete(`/subjects/${id}/`)
}

// Rooms
export const getRooms = async (): Promise<Room[]> => {
  const response = await academicAPI.get('/rooms/')
  return response.data
}

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const response = await academicAPI.post('/rooms/', data)
  return response.data
}

export const updateRoom = async (id: number, data: Partial<Room>): Promise<Room> => {
  const response = await academicAPI.patch(`/rooms/${id}/`, data)
  return response.data
}

export const deleteRoom = async (id: number): Promise<void> => {
  await academicAPI.delete(`/rooms/${id}/`)
}

export const getAvailableRooms = async (params: {
  capacity?: number
  date?: string
  start_time?: string
  end_time?: string
}): Promise<Room[]> => {
  const response = await academicAPI.get('/rooms/available/', { params })
  return response.data
}