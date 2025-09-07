import React, { useEffect, useState } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from '../../services/api/notificationsAPI'
import { Notification } from '../../services/api/notificationsAPI'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
    fetchUnreadCount()
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount()
      setUnreadCount(data.unread_count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Erreur lors du marquage')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      setUnreadCount(0)
      toast.success('Toutes les notifications marquées comme lues')
    } catch (error) {
      toast.error('Erreur lors du marquage')
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="w-4 h-4 text-error-600" />
      case 'HIGH':
        return <AlertCircle className="w-4 h-4 text-warning-600" />
      case 'MEDIUM':
        return <Info className="w-4 h-4 text-primary-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-error-500 bg-error-50'
      case 'HIGH':
        return 'border-l-warning-500 bg-warning-50'
      case 'MEDIUM':
        return 'border-l-primary-500 bg-primary-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-error-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Tout marquer lu
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="spinner" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="w-8 h-8 mb-2" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={clsx(
                    'p-4 rounded-lg border-l-4 cursor-pointer transition-colors',
                    getPriorityColor(notification.priority),
                    !notification.is_read && 'ring-2 ring-primary-100'
                  )}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getPriorityIcon(notification.priority)}
                      <div className="flex-1">
                        <h4 className={clsx(
                          'text-sm font-medium',
                          !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                        )}>
                          {notification.title}
                        </h4>
                        <p className={clsx(
                          'text-sm mt-1',
                          !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        className="p-1 rounded-lg hover:bg-white"
                      >
                        <Check className="w-4 h-4 text-primary-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter