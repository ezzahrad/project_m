import React from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Calendar, Clock } from 'lucide-react'
import { createUnavailability } from '../../services/api/schedulingAPI'
import { TeacherUnavailability } from '../../types/scheduling'
import { toast } from 'react-hot-toast'

interface TeacherUnavailabilityFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const TeacherUnavailabilityForm: React.FC<TeacherUnavailabilityFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<Partial<TeacherUnavailability>>()

  const isAllDay = watch('is_all_day', true)

  const onSubmit = async (data: Partial<TeacherUnavailability>) => {
    try {
      await createUnavailability(data)
      toast.success('Indisponibilité déclarée avec succès')
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      toast.error('Erreur lors de la déclaration')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Déclarer une indisponibilité</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Type */}
          <div>
            <label className="form-label">Type d'indisponibilité *</label>
            <select
              {...register('unavailability_type', { required: 'Type requis' })}
              className="form-input"
            >
              <option value="">Sélectionner un type</option>
              <option value="SICK_LEAVE">Congé maladie</option>
              <option value="VACATION">Vacances</option>
              <option value="CONFERENCE">Conférence</option>
              <option value="MEETING">Réunion</option>
              <option value="PERSONAL">Personnel</option>
              <option value="OTHER">Autre</option>
            </select>
            {errors.unavailability_type && (
              <p className="form-error">{errors.unavailability_type.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date de début *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  {...register('start_date', { required: 'Date de début requise' })}
                  className="form-input pl-10"
                />
              </div>
              {errors.start_date && (
                <p className="form-error">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Date de fin *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  {...register('end_date', { required: 'Date de fin requise' })}
                  className="form-input pl-10"
                />
              </div>
              {errors.end_date && (
                <p className="form-error">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* All day toggle */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('is_all_day')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-900">Toute la journée</span>
            </label>
          </div>

          {/* Time range (if not all day) */}
          {!isAllDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Heure de début</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    {...register('start_time', { required: !isAllDay ? 'Heure de début requise' : false })}
                    className="form-input pl-10"
                  />
                </div>
                {errors.start_time && (
                  <p className="form-error">{errors.start_time.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Heure de fin</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    {...register('end_time', { required: !isAllDay ? 'Heure de fin requise' : false })}
                    className="form-input pl-10"
                  />
                </div>
                {errors.end_time && (
                  <p className="form-error">{errors.end_time.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="form-label">Motif *</label>
            <textarea
              {...register('reason', { required: 'Motif requis' })}
              className="form-input"
              rows={3}
              placeholder="Expliquez la raison de votre indisponibilité..."
            />
            {errors.reason && (
              <p className="form-error">{errors.reason.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset()
                onClose()
                setEditingSlot(null)
              }}
              className="btn btn-outline btn-md flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingSlot ? 'Modifier' : 'Déclarer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherUnavailabilityForm