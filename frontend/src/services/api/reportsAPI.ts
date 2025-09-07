import axios from 'axios'

const API_BASE_URL = '/api/reports'

const reportsAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
reportsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ExportParams {
  format: 'pdf' | 'excel' | 'csv'
  start_date: string
  end_date: string
  department_id?: number
  program_id?: number
  teacher_id?: number
}

export interface ImportResult {
  success_count: number
  errors: string[]
  warnings: string[]
}

export const exportSchedules = async (params: ExportParams): Promise<Blob> => {
  const response = await reportsAPI.post('/export/schedules/', params, {
    responseType: 'blob'
  })
  return response.data
}

export const exportTeacherWorkload = async (params: Partial<ExportParams>): Promise<Blob> => {
  const response = await reportsAPI.post('/export/teacher-workload/', params, {
    responseType: 'blob'
  })
  return response.data
}

export const importExcelData = async (file: File, type: 'teachers' | 'students' | 'schedules'): Promise<ImportResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  const response = await reportsAPI.post('/import/excel/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const downloadImportTemplate = async (type: 'teachers' | 'students' | 'schedules'): Promise<Blob> => {
  const response = await reportsAPI.get(`/import/template/?type=${type}`, {
    responseType: 'blob'
  })
  return response.data
}

export const getDashboardAnalytics = async () => {
  const response = await reportsAPI.get('/analytics/dashboard/')
  return response.data
}