import axios from 'axios'

const API_BASE_URL = '/api/notifications'

const notificationsAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
notificationsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Notification {
  id: number
  notification_type: string
  notification_type_display: string
  title: string
  message: string
  priority: string
  priority_display: string
  schedule?: number
  schedule_title?: string
  makeup_session?: number
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface NotificationPreference {
  email_schedule_changes: boolean
  email_cancellations: boolean
  email_makeups: boolean
  email_conflicts: boolean
  sms_urgent_only: boolean
  sms_cancellations: boolean
  push_all: boolean
  push_schedule_changes: boolean
  push_reminders: boolean
  reminder_minutes_before: number
  quiet_hours_start: string
  quiet_hours_end: string
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await notificationsAPI.get('/')
  return response.data
}

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await notificationsAPI.get('/preferences/')
  return response.data
}

export const updateNotificationPreferences = async (data: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  const response = await notificationsAPI.patch('/preferences/', data)
  return response.data
}

export const markNotificationRead = async (id: number) => {
  const response = await notificationsAPI.post(`/${id}/read/`)
  return response.data
}

export const markAllNotificationsRead = async () => {
  const response = await notificationsAPI.post('/mark-all-read/')
  return response.data
}

export const getUnreadCount = async (): Promise<{ unread_count: number }> => {
  const response = await notificationsAPI.get('/unread-count/')
  return response.data
}