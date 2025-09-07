import React, { useEffect, useState } from 'react'
import { Calendar, Clock, AlertTriangle, Plus, BookOpen } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectUser } from '../../store/selectors/authSelectors'
import { getTeacherSchedule, getTeacherUnavailabilities } from '../../services/api/schedulingAPI'
import TeacherUnavailabilityForm from '../../components/scheduling/TeacherUnavailabilityForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { format, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

const TeacherDashboard: React.FC = () => {
  const user = useAppSelector(selectUser)
  const [schedule, setSchedule] = useState<any>(null)
  const [unavailabilities, setUnavailabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    fetchTeacherData()
  }, [currentWeek])

  const fetchTeacherData = async () => {
    setLoading(true)
    try {
      const weekStart = format(currentWeek, 'yyyy-MM-dd')
      const weekEnd = format(addDays(currentWeek, 6), 'yyyy-MM-dd')
      
      const [scheduleData, unavailabilityData] = await Promise.all([
        getTeacherSchedule({ start_date: weekStart, end_date: weekEnd }),
        getTeacherUnavailabilities()
      ])
      
      setSchedule(scheduleData)
      setUnavailabilities(unavailabilityData)
    } catch (error) {
      console.error('Error fetching teacher data:', error)
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {user?.first_name} !
        </h1>
        <p className="text-primary-100 text-lg">
          Voici votre emploi du temps et vos informations d'enseignement
        </p>
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
              <p className="text-sm font-medium text-gray-600">Indisponibilités</p>
              <p className="text-3xl font-bold text-gray-900">
                {unavailabilities.filter(u => new Date(u.end_date) >= new Date()).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Matières</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <BookOpen className="w-8 h-8 text-accent-600" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This week's schedule */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Emploi du temps cette semaine</h3>
            <span className="text-sm text-gray-500">
              {format(currentWeek, 'dd MMM', { locale: fr })} - {format(addDays(currentWeek, 6), 'dd MMM', { locale: fr })}
            </span>
          </div>
          
          <div className="space-y-3">
            {schedule?.schedules?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.subject_name}</p>
                  <p className="text-sm text-gray-600">{item.room_name} • {item.time_slot_display}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${item.is_cancelled ? 'bg-error-500' : 'bg-success-500'}`} />
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">Aucun cours cette semaine</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowUnavailabilityForm(true)}
              className="w-full flex items-center space-x-3 p-4 bg-warning-50 border border-warning-200 rounded-lg hover:bg-warning-100 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              <div className="text-left">
                <p className="font-medium text-warning-900">Déclarer une indisponibilité</p>
                <p className="text-sm text-warning-700">Congé, absence, réunion...</p>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-primary-900">Voir l'emploi du temps complet</p>
                <p className="text-sm text-primary-700">Vue détaillée du planning</p>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 bg-secondary-50 border border-secondary-200 rounded-lg hover:bg-secondary-100 transition-colors">
              <Plus className="w-5 h-5 text-secondary-600" />
              <div className="text-left">
                <p className="font-medium text-secondary-900">Demander un rattrapage</p>
                <p className="text-sm text-secondary-700">Pour un cours annulé</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent unavailabilities */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indisponibilités récentes</h3>
        
        <div className="space-y-3">
          {unavailabilities.slice(0, 3).map((unavailability) => (
            <div key={unavailability.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <div>
                  <p className="font-medium text-gray-900">{unavailability.unavailability_type_display}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(unavailability.start_date), 'dd/MM/yyyy')} - {format(new Date(unavailability.end_date), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {unavailability.is_all_day ? 'Toute la journée' : `${unavailability.start_time} - ${unavailability.end_time}`}
              </span>
            </div>
          ))}
          
          {unavailabilities.length === 0 && (
            <p className="text-gray-500 text-center py-8">Aucune indisponibilité déclarée</p>
          )}
        </div>
      </div>

      {/* Unavailability Form */}
      <TeacherUnavailabilityForm
        isOpen={showUnavailabilityForm}
        onClose={() => setShowUnavailabilityForm(false)}
        onSuccess={fetchTeacherData}
      />
    </div>
  )
}

export default TeacherDashboard