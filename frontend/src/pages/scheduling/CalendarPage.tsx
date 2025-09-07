import React, { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  // Sample events data - replace with real data
  const events = {
    '2024-01-15': [
      { id: 1, title: 'Mathématiques', time: '08:00', room: 'A101', type: 'course' },
      { id: 2, title: 'Physique', time: '14:00', room: 'B202', type: 'lab' }
    ],
    '2024-01-16': [
      { id: 3, title: 'Informatique', time: '10:00', room: 'C301', type: 'td' }
    ]
  }

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return events[dateKey as keyof typeof events] || []
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      course: 'bg-primary-100 text-primary-800 border-primary-200',
      td: 'bg-secondary-100 text-secondary-800 border-secondary-200',
      lab: 'bg-accent-100 text-accent-800 border-accent-200',
      project: 'bg-warning-100 text-warning-800 border-warning-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-600">Vue calendrier des emplois du temps</p>
        </div>
        <button className="btn btn-primary btn-md">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </button>
      </div>

      {/* Calendar controls */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select className="form-input w-40">
              <option value="month">Vue mois</option>
              <option value="week">Vue semaine</option>
              <option value="day">Vue jour</option>
            </select>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn btn-outline btn-md"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isTodayDate = isToday(day)

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={clsx(
                  'min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
                  !isCurrentMonth && 'bg-gray-50 text-gray-400',
                  isSelected && 'bg-primary-50',
                  isTodayDate && 'bg-blue-50'
                )}
              >
                <div className={clsx(
                  'text-sm font-medium mb-2',
                  isTodayDate && 'text-primary-600',
                  isSelected && 'text-primary-700'
                )}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={clsx(
                        'text-xs p-1 rounded border',
                        getEventTypeColor(event.type)
                      )}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="truncate">{event.time} - {event.room}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={clsx(
                    'w-3 h-3 rounded-full',
                    event.type === 'course' && 'bg-primary-500',
                    event.type === 'td' && 'bg-secondary-500',
                    event.type === 'lab' && 'bg-accent-500'
                  )} />
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.time} - {event.room}</p>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Modifier
                </button>
              </div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-8">Aucun cours prévu ce jour</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage