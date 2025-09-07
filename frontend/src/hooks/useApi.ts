import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseApiOptions {
  showSuccessMessage?: boolean
  showErrorMessage?: boolean
  successMessage?: string
}

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const {
        showSuccessMessage = false,
        showErrorMessage = true,
        successMessage = 'Opération réussie'
      } = options

      try {
        setLoading(true)
        setError(null)
        
        const result = await apiCall()
        
        if (showSuccessMessage) {
          toast.success(successMessage)
        }
        
        return result
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Une erreur est survenue'
        setError(errorMessage)
        
        if (showErrorMessage) {
          toast.error(errorMessage)
        }
        
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { execute, loading, error, setError }
}
