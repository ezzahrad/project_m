import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Filter, Download } from 'lucide-react'
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchWeeklySchedule, fetchTimeSlots } from '../../store/slices/schedulingSlice'
import { fetchPrograms } from '../../store/slices/academicSlice'
import ScheduleForm from './ScheduleForm'
import ExportButton from '../reports/ExportButton'
import LoadingSpinner from '../common/LoadingSpinner'
import clsx from 'clsx'

const WeeklyCalendar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { weeklySchedule, timeSlots, loading } = useAppSelector(state => state.scheduling)
  const { programs } = useAppSelector(state => state.academic)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  useEffect(() => {
    dispatch(fetchTimeSlots())
    dispatch(fetchPrograms())
  }, [dispatch])

  useEffect(() => {
    const weekStart = format(currentWeek, 'yyyy-MM-dd')
    const params: any = { weekStart }
    
    if (selectedProgram) {
      params.programId = selectedProgram
    }
    
    dispatch(fetchWeeklySchedule(params))
  }, [dispatch, currentWeek, selectedProgram])

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    )
  }

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']

  const getScheduleForDayAndTime = (dayIndex: number, hour: string) => {
    const daySchedules = weeklySchedule?.schedule[dayIndex]?.schedules || []
    return daySchedules.filter(schedule => {
      const timeSlot = timeSlots.find(ts => ts.id === schedule.time_slot)
      return timeSlot?.start_time === hour
    })
  }

  const getScheduleColor = (schedule: any) => {
    if (schedule.is_cancelled) return 'bg-error-100 border-error-300 text-error-800'
    
    const colors = [
      'bg-primary-100 border-primary-300 text-primary-800',
      'bg-secondary-100 border-secondary-300 text-secondary-800',
      'bg-accent-100 border-accent-300 text-accent-800',
      'bg-warning-100 border-warning-300 text-warning-800'
    ]
    
    return colors[schedule.subject % colors.length]
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement du calendrier..." />
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Week navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Semaine du {format(currentWeek, 'dd MMMM yyyy', { locale: fr })}
              </h3>
              <p className="text-sm text-gray-500">
                {format(currentWeek, 'dd/MM')} - {format(addDays(currentWeek, 6), 'dd/MM')}
              </p>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Filters and actions */}
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProgram || ''}
              onChange={(e) => setSelectedProgram(e.target.value ? Number(e.target.value) : null)}
              className="form-input w-48"
            >
              <option value="">Toutes les filières</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name} - {program.level_display}
                </option>
              ))}
            </select>

            <button className="btn btn-outline btn-md">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>

            <ExportButton
              type="schedules"
              params={{
                start_date: format(currentWeek, 'yyyy-MM-dd'),
                end_date: format(addDays(currentWeek, 6), 'yyyy-MM-dd'),
                program_id: selectedProgram
              }}
              label="Export"
            />

            <button
              onClick={() => setShowScheduleForm(true)}
              className="btn btn-primary btn-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau cours
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-sm font-medium text-gray-500">Heure</div>
              {dayNames.map((day, index) => (
                <div key={day} className="p-4 text-sm font-medium text-gray-900 text-center border-l border-gray-200">
                  {day}
                  <div className="text-xs text-gray-500 mt-1">
                    {format(addDays(currentWeek, index), 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-7 min-h-[100px] border-b border-gray-200">
                <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                  <div className="text-sm font-medium text-gray-900">{hour}</div>
                </div>
                
                {dayNames.map((_, dayIndex) => {
                  const schedules = getScheduleForDayAndTime(dayIndex, hour)
                  
                  return (
                    <div key={dayIndex} className="p-2 border-l border-gray-200 min-h-[100px]">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={clsx(
                            'rounded-lg p-3 mb-2 border cursor-pointer hover:shadow-md transition-all',
                            getScheduleColor(schedule)
                          )}
                        >
                          <div className="text-sm font-medium mb-1">
                            {schedule.subject_name}
                          </div>
                          <div className="text-xs mb-1">
                            {schedule.teacher_name}
                          </div>
                          <div className="text-xs">
                            {schedule.room_name}
                          </div>
                          {schedule.is_cancelled && (
                            <div className="text-xs font-bold mt-1 text-error-700">
                              ANNULÉ
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Form Modal */}
      <ScheduleForm
        isOpen={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
        onSuccess={() => {
          const weekStart = format(currentWeek, 'yyyy-MM-dd')
          const params: any = { weekStart }
          if (selectedProgram) params.programId = selectedProgram
          dispatch(fetchWeeklySchedule(params))
        }}
      />
    </div>
  )
}

export default WeeklyCalendar