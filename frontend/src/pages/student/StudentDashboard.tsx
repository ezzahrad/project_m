import React, { useEffect, useState } from 'react'
import { Calendar, BookOpen, Users, GraduationCap, Clock } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectUser } from '../../store/selectors/authSelectors'
import { getStudentSchedule } from '../../services/api/schedulingAPI'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { format, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

const StudentDashboard: React.FC = () => {
  const user = useAppSelector(selectUser)
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    fetchStudentData()
  }, [currentWeek])

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      const weekStart = format(currentWeek, 'yyyy-MM-dd')
      const weekEnd = format(addDays(currentWeek, 6), 'yyyy-MM-dd')
      
      const scheduleData = await getStudentSchedule({ 
        start_date: weekStart, 
        end_date: weekEnd 
      })
      
      setSchedule(scheduleData)
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement de votre emploi du temps..." />
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {user?.first_name} !
        </h1>
        <p className="text-secondary-100 text-lg">
          Voici votre emploi du temps et informations académiques
        </p>
        {schedule?.program && (
          <div className="mt-4 flex items-center space-x-4 text-secondary-100">
            <span>Filière: {schedule.program.name}</span>
            <span>•</span>
            <span>Niveau: {schedule.program.level}</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cours cette semaine</p>
              <p className="text-3xl font-bold text-gray-900">
                {schedule?.schedules?.length || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heures/semaine</p>
              <p className="text-3xl font-bold text-gray-900">
                {(schedule?.schedules?.length || 0) * 2}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-secondary-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Semestre</p>
              <p className="text-3xl font-bold text-gray-900">S1</p>
            </div>
            <GraduationCap className="w-8 h-8 text-accent-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Matières</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(schedule?.schedules?.map((s: any) => s.subject_name)).size || 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* This week's schedule */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Emploi du temps cette semaine</h3>
          <span className="text-sm text-gray-500">
            {format(currentWeek, 'dd MMM', { locale: fr })} - {format(addDays(currentWeek, 6), 'dd MMM', { locale: fr })}
          </span>
        </div>
        
        <div className="space-y-4">
          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, dayIndex) => {
            const daySchedules = schedule?.schedules?.filter((s: any) => {
              // This would need proper day matching logic
              return true // Simplified for now
            }) || []

            return (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{day}</h4>
                
                {daySchedules.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun cours</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                        <div>
                          <p className="font-medium text-primary-900">{item.subject_name}</p>
                          <p className="text-sm text-primary-700">
                            {item.teacher_name} • {item.room_name}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-primary-600">
                          {item.time_slot_display?.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochains cours</h3>
        
        <div className="space-y-3">
          {schedule?.schedules?.slice(0, 5).map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.subject_name}</p>
                <p className="text-sm text-gray-600">{item.teacher_name}</p>
                <p className="text-sm text-gray-500">{item.room_name} • {item.time_slot_display}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Aujourd'hui</p>
                <p className="text-xs text-gray-500">14:00 - 16:00</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-8">Aucun cours à venir</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard