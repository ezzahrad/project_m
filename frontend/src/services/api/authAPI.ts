import axios from 'axios'
import { LoginCredentials, RegisterData, User, AuthResponse } from '../../types/auth'

const API_BASE_URL = '/api/auth'

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          })
          
          const newToken = response.data.access
          localStorage.setItem('token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          return authAPI(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await authAPI.post('/login/', credentials)
  return response.data
}

export const register = async (p0: string, p1: { required: string; min: number }, userData: RegisterData): Promise<AuthResponse> => {
  const response = await authAPI.post('/register/', userData)
  return response.data
}

export const logout = async (refreshToken: string): Promise<void> => {
  await authAPI.post('/logout/', { refresh_token: refreshToken })
}

export const getProfile = async (): Promise<User> => {
  const response = await authAPI.get('/profile/')
  return response.data
}

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await authAPI.patch('/profile/', userData)
  return response.data
}

export const changePassword = async (passwordData: {
  current_password: string
  new_password: string
  new_password_confirm: string
}): Promise<void> => {
  await authAPI.post('/change-password/', passwordData)
}

export const getDashboardStats = async () => {
  const response = await authAPI.get('/dashboard/stats/')
  return response.data
}