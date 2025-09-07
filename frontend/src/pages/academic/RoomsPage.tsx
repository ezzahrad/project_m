import React, { useEffect, useState } from 'react'
import { MapPin, Users, Building, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRooms } from '../../store/slices/academicSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

const RoomsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { rooms, loading } = useAppSelector(state => state.academic)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data: any) => {
    try {
      // TODO: Implement actual API call
      console.log('Creating room:', data)
      toast.success('Salle créée avec succès')
      setShowCreateModal(false)
      reset()
      dispatch(fetchRooms())
    } catch (error: any) {
      toast.error('Erreur lors de la création')
    }
  }

  useEffect(() => {
    dispatch(fetchRooms())
  }, [dispatch])

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des salles..." />
  }

  const getRoomTypeColor = (type: string) => {
    const colors = {
      'AMPHITHEATER': 'bg-primary-100 text-primary-800',
      'CLASSROOM': 'bg-secondary-100 text-secondary-800',
      'LAB': 'bg-accent-100 text-accent-800',
      'COMPUTER_LAB': 'bg-warning-100 text-warning-800',
      'CONFERENCE': 'bg-error-100 text-error-800',
      'WORKSHOP': 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salles</h1>
          <p className="text-gray-600">Gérer les salles et espaces d'enseignement</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Nouvelle salle
        </button>
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.code}</p>
                <span className={`badge ${getRoomTypeColor(room.room_type)} mt-2`}>
                  {room.room_type_display}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${room.is_available ? 'bg-success-500' : 'bg-error-500'}`} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{room.building} - Étage {room.floor}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Capacité: {room.capacity} places</span>
              </div>

              {room.department_name && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Layers className="w-4 h-4" />
                  <span>{room.department_name}</span>
                </div>
              )}
            </div>

            {room.equipment && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Équipements:</p>
                <p className="text-sm text-gray-800">{room.equipment}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${room.is_available ? 'text-success-600' : 'text-error-600'}`}>
                  {room.is_available ? 'Disponible' : 'Indisponible'}
                </span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Voir planning
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle salle</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Nom de la salle</label>
                <input
                  type="text"
                  {...register('name', { required: 'Nom requis' })}
                  className="form-input"
                  placeholder="Ex: A101"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message as string}</p>
                )}
              </div>

              <div>
                <label className="form-label">Type de salle</label>
                <select
                  {...register('room_type', { required: 'Type requis' })}
                  className="form-input"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="AMPHITHEATER">Amphithéâtre</option>
                  <option value="CLASSROOM">Salle de classe</option>
                  <option value="LAB">Laboratoire</option>
                  <option value="COMPUTER_LAB">Salle informatique</option>
                  <option value="CONFERENCE">Salle de conférence</option>
                </select>
                {errors.room_type && (
                  <p className="form-error">{errors.room_type.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Capacité</label>
                  <input
                    type="number"
                    {...register('capacity', { required: 'Capacité requise', min: 1 })}
                    className="form-input"
                    placeholder="30"
                  />
                  {errors.capacity && (
                    <p className="form-error">{errors.capacity.message as string}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Étage</label>
                  <input
                    type="text"
                    {...register('floor', { required: 'Étage requis' })}
                    className="form-input"
                    placeholder="1"
                  />
                  {errors.floor && (
                    <p className="form-error">{errors.floor.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Bâtiment</label>
                <input
                  type="text"
                  {...register('building', { required: 'Bâtiment requis' })}
                  className="form-input"
                  placeholder="Ex: Bâtiment A"
                />
                {errors.building && (
                  <p className="form-error">{errors.building.message as string}</p>
                )}
              </div>

              <div>
                <label className="form-label">Équipements</label>
                <textarea
                  {...register('equipment')}
                  className="form-input"
                  rows={3}
                  placeholder="Projecteur, tableau interactif..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomsPage