import axios from 'axios'
import { Schedule, TimeSlot, WeeklySchedule, TeacherUnavailability, MakeupSession } from '../../types/scheduling'

const API_BASE_URL = '/api/scheduling'

const schedulingAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
schedulingAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Time Slots
export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  const response = await schedulingAPI.get('/time-slots/')
  return response.data
}

export const createTimeSlot = async (data: Partial<TimeSlot>): Promise<TimeSlot> => {
  const response = await schedulingAPI.post('/time-slots/', data)
  return response.data
}

// Schedules
export const getSchedules = async (params?: any): Promise<Schedule[]> => {
  const response = await schedulingAPI.get('/schedules/', { params })
  return response.data
}

export const createSchedule = async (data: any): Promise<Schedule> => {
  const response = await schedulingAPI.post('/schedules/', data)
  return response.data
}

export const updateSchedule = async (id: number, data: Partial<Schedule>): Promise<Schedule> => {
  const response = await schedulingAPI.patch(`/schedules/${id}/`, data)
  return response.data
}

export const deleteSchedule = async (id: number): Promise<void> => {
  await schedulingAPI.delete(`/schedules/${id}/`)
}

export const getWeeklySchedule = async (params: {
  weekStart: string
  programId?: number
  teacherId?: number
  roomId?: number
}): Promise<WeeklySchedule> => {
  const response = await schedulingAPI.get('/schedules/weekly/', {
    params: {
      week_start: params.weekStart,
      program_id: params.programId,
      teacher_id: params.teacherId,
      room_id: params.roomId
    }
  })
  return response.data
}

export const checkConflicts = async (scheduleData: any) => {
  const response = await schedulingAPI.post('/schedules/conflicts/check/', scheduleData)
  return response.data
}

export const cancelSchedule = async (id: number, data: {
  reason: string
  create_makeup?: boolean
  makeup_data?: any
}) => {
  const response = await schedulingAPI.post(`/schedules/${id}/cancel/`, data)
  return response.data
}

// Teacher specific
export const getTeacherSchedule = async (params?: {
  start_date?: string
  end_date?: string
}) => {
  const response = await schedulingAPI.get('/teacher/schedule/', { params })
  return response.data
}

export const getTeacherUnavailabilities = async (): Promise<TeacherUnavailability[]> => {
  const response = await schedulingAPI.get('/teacher/unavailabilities/')
  return response.data
}

export const createUnavailability = async (data: Partial<TeacherUnavailability>): Promise<TeacherUnavailability> => {
  const response = await schedulingAPI.post('/teacher/unavailabilities/', data)
  return response.data
}

// Student specific
export const getStudentSchedule = async (params?: {
  start_date?: string
  end_date?: string
}) => {
  const response = await schedulingAPI.get('/student/schedule/', { params })
  return response.data
}

// Makeup Sessions
export const getMakeupSessions = async (): Promise<MakeupSession[]> => {
  const response = await schedulingAPI.get('/makeup-sessions/')
  return response.data
}

export const createMakeupSession = async (data: Partial<MakeupSession>): Promise<MakeupSession> => {
  const response = await schedulingAPI.post('/makeup-sessions/', data)
  return response.data
}

export const approveMakeupSession = async (id: number, action: 'approve' | 'reject') => {
  const response = await schedulingAPI.post(`/makeup-sessions/${id}/approve/`, { action })
  return response.data
}