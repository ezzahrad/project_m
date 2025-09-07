import apiService from './apiService'
import { LoginResponse, User, LoginFormData, RegisterFormData } from '../types'

class AuthAPI {
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login/', credentials)
  }

  async register(userData: RegisterFormData): Promise<User> {
    return apiService.post<User>('/auth/register/', userData)
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await apiService.post('/auth/logout/', { refresh: refreshToken })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/user/')
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    return apiService.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    })
  }

  async changePassword(data: {
    old_password: string
    new_password: string
  }): Promise<void> {
    return apiService.post('/auth/change-password/', data)
  }

  async requestPasswordReset(email: string): Promise<void> {
    return apiService.post('/auth/password-reset/', { email })
  }

  async confirmPasswordReset(data: {
    token: string
    password: string
  }): Promise<void> {
    return apiService.post('/auth/password-reset/confirm/', data)
  }

  async verifyEmail(token: string): Promise<void> {
    return apiService.post('/auth/verify-email/', { token })
  }

  async resendEmailVerification(): Promise<void> {
    return apiService.post('/auth/resend-verification/')
  }
}

export const authAPI = new AuthAPI()
export default authAPI
