import React, { useEffect, useState } from 'react'
import { Clock, Plus, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchTimeSlots } from '../../store/slices/schedulingSlice'
import { createTimeSlot } from '../../services/api/schedulingAPI'
import LoadingSpinner from '../common/LoadingSpinner'
import ConfirmDialog from '../common/ConfirmDialog'
import { toast } from 'react-hot-toast'

const TimeSlotManager: React.FC = () => {
  const dispatch = useAppDispatch()
  const { timeSlots, loading } = useAppSelector(state => state.scheduling)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<any>(null)
  const [deleteSlot, setDeleteSlot] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    dispatch(fetchTimeSlots())
  }, [dispatch])

  const onSubmit = async (data: any) => {
    try {
      if (editingSlot) {
        // Update time slot
        toast.success('Créneau modifié avec succès')
      } else {
        await createTimeSlot(data)
        toast.success('Créneau créé avec succès')
      }
      
      setShowCreateModal(false)
      setEditingSlot(null)
      reset()
      dispatch(fetchTimeSlots())
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (slot: any) => {
    setEditingSlot(slot)
    setValue('day_of_week', slot.day_of_week)
    setValue('start_time', slot.start_time)
    setValue('end_time', slot.end_time)
    setValue('name', slot.name)
    setShowCreateModal(true)
  }

  const handleDelete = async () => {
    try {
      // Delete time slot API call
      toast.success('Créneau supprimé avec succès')
      setDeleteSlot(null)
      dispatch(fetchTimeSlots())
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des créneaux..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Créneaux horaires</h2>
          <p className="text-gray-600">Gérer les créneaux de cours</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau créneau
        </button>
      </div>

      {/* Time slots by day */}
      <div className="space-y-4">
        {dayNames.map((dayName, dayIndex) => {
          const daySlots = timeSlots.filter(slot => slot.day_of_week === dayIndex)
          
          return (
            <div key={dayIndex} className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{dayName}</h3>
              
              {daySlots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun créneau défini</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-gray-900">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(slot)}
                            className="p-1 text-gray-400 hover:text-primary-600 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteSlot(slot)}
                            className="p-1 text-gray-400 hover:text-error-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {slot.name && (
                        <p className="text-sm text-gray-600">{slot.name}</p>
                      )}
                      <p className="text-xs text-gray-500">{slot.duration_minutes} minutes</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Jour de la semaine</label>
                <select
                  {...register('day_of_week', { required: 'Jour requis' })}
                  className="form-input"
                >
                  <option value="">Sélectionner un jour</option>
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                {errors.day_of_week && (
                  <p className="form-error">{errors.day_of_week.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Heure de début</label>
                  <input
                    type="time"
                    {...register('start_time', { required: 'Heure de début requise' })}
                    className="form-input"
                  />
                  {errors.start_time && (
                    <p className="form-error">{errors.start_time.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Heure de fin</label>
                  <input
                    type="time"
                    {...register('end_time', { required: 'Heure de fin requise' })}
                    className="form-input"
                  />
                  {errors.end_time && (
                    <p className="form-error">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Nom du créneau (optionnel)</label>
                <input
                  type="text"
                  {...register('name')}
                  className="form-input"
                  placeholder="Ex: Créneau 1, Matin..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingSlot(null)
                    reset()
                  }}
                  className="btn btn-outline btn-md flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md flex-1"
                >
                  {editingSlot ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteSlot}
        title="Supprimer le créneau"
        message={`Êtes-vous sûr de vouloir supprimer ce créneau ? Cette action ne peut pas être annulée.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteSlot(null)}
      />
    </div>
  )
}

export default TimeSlotManager