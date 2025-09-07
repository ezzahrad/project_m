import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertTriangle, Save } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { createSchedule, checkConflicts } from '../../store/slices/schedulingSlice'
import { fetchPrograms, fetchSubjects } from '../../store/slices/academicSlice'
import LoadingSpinner from '../common/LoadingSpinner'
import ConflictDetector from './ConflictDetector'
import { toast } from 'react-hot-toast'

interface ScheduleFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ScheduleFormData {
  subject: number
  teacher: number
  room: number
  time_slot: number
  start_date: string
  end_date: string
  student_count: number
  notes: string
  programs: number[]
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch()
  const { programs, subjects, rooms } = useAppSelector(state => state.academic)
  const { timeSlots } = useAppSelector(state => state.scheduling)
  const [conflicts, setConflicts] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<ScheduleFormData>()

  const watchedValues = watch()

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPrograms())
      dispatch(fetchSubjects())
    }
  }, [isOpen, dispatch])

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      await dispatch(createSchedule(data)).unwrap()
      toast.success('Emploi du temps créé avec succès')
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Nouveau cours</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Subject and Teacher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Matière *</label>
              <select
                {...register('subject', { required: 'Matière requise' })}
                className="form-input"
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="form-error">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Enseignant *</label>
              <select
                {...register('teacher', { required: 'Enseignant requis' })}
                className="form-input"
              >
                <option value="">Sélectionner un enseignant</option>
                {/* This would be populated from teachers API */}
              </select>
              {errors.teacher && (
                <p className="form-error">{errors.teacher.message}</p>
              )}
            </div>
          </div>

          {/* Room and Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Salle *</label>
              <select
                {...register('room', { required: 'Salle requise' })}
                className="form-input"
              >
                <option value="">Sélectionner une salle</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.building} (Cap: {room.capacity})
                  </option>
                ))}
              </select>
              {errors.room && (
                <p className="form-error">{errors.room.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Créneau horaire *</label>
              <select
                {...register('time_slot', { required: 'Créneau requis' })}
                className="form-input"
              >
                <option value="">Sélectionner un créneau</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.day_display} {slot.start_time} - {slot.end_time}
                  </option>
                ))}
              </select>
              {errors.time_slot && (
                <p className="form-error">{errors.time_slot.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date de début *</label>
              <input
                type="date"
                {...register('start_date', { required: 'Date de début requise' })}
                className="form-input"
              />
              {errors.start_date && (
                <p className="form-error">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Date de fin *</label>
              <input
                type="date"
                {...register('end_date', { required: 'Date de fin requise' })}
                className="form-input"
              />
              {errors.end_date && (
                <p className="form-error">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Programs */}
          <div>
            <label className="form-label">Filières concernées *</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {programs.map(program => (
                <label key={program.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={program.id}
                    {...register('programs', { required: 'Au moins une filière requise' })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {program.name} - {program.level_display}
                  </span>
                </label>
              ))}
            </div>
            {errors.programs && (
              <p className="form-error">{errors.programs.message}</p>
            )}
          </div>

          {/* Additional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre d'étudiants</label>
              <input
                type="number"
                {...register('student_count', { min: 0 })}
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              {...register('notes')}
              className="form-input"
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Conflicts warning */}
          <ConflictDetector
            scheduleData={watchedValues}
            onConflictsDetected={setConflicts}
          />

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset()
                onClose()
              }}
              className="btn btn-outline btn-md flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={conflicts.length > 0}
              className="btn btn-primary btn-md flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer le cours
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleForm