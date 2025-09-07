import { useAppSelector, useAppDispatch } from './redux'
import { addNotification, markAsRead, markAllAsRead, removeNotification } from '../store/slices/notificationsSlice'
import toast from 'react-hot-toast'

export const useNotifications = () => {
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications)
  const dispatch = useAppDispatch()

  const showSuccess = (message: string, title?: string) => {
    toast.success(message)
    if (title) {
      dispatch(addNotification({
        title,
        message,
        type: 'success',
        read: false
      }))
    }
  }

  const showError = (message: string, title?: string) => {
    toast.error(message)
    if (title) {
      dispatch(addNotification({
        title,
        message,
        type: 'error',
        read: false
      }))
    }
  }

  const showWarning = (message: string, title?: string) => {
    toast(message, { icon: '⚠️' })
    if (title) {
      dispatch(addNotification({
        title,
        message,
        type: 'warning',
        read: false
      }))
    }
  }

  const showInfo = (message: string, title?: string) => {
    toast(message, { icon: 'ℹ️' })
    if (title) {
      dispatch(addNotification({
        title,
        message,
        type: 'info',
        read: false
      }))
    }
  }

  const markNotificationAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead())
  }

  const removeNotificationById = (id: string) => {
    dispatch(removeNotification(id))
  }

  return {
    notifications,
    unreadCount,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotificationById
  }
}
