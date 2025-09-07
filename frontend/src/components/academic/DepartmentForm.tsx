import React from 'react'
import { useForm } from 'react-hook-form'
import { X, Save } from 'lucide-react'
import { useAppDispatch } from '../../hooks/redux'
import { createDepartment } from '../../store/slices/academicSlice'
import { Department } from '../../types/academic'
import { toast } from 'react-hot-toast'

interface DepartmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Partial<Department>>()

  const onSubmit = async (data: Partial<Department>) => {
    try {
      await dispatch(createDepartment(data)).unwrap()
      toast.success('Département créé avec succès')
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
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Nouveau département</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">Nom du département *</label>
            <input
              type="text"
              {...register('name', { required: 'Nom requis' })}
              className="form-input"
              placeholder="Ex: Informatique"
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="Description du département..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
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
              className="btn btn-primary btn-md flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DepartmentForm