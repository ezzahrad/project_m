import React, { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, X, Clock } from 'lucide-react'
import { checkConflicts } from '../../services/api/schedulingAPI'

interface ConflictDetectorProps {
  scheduleData: any
  onConflictsDetected: (conflicts: any[]) => void
}

const ConflictDetector: React.FC<ConflictDetectorProps> = ({ 
  scheduleData, 
  onConflictsDetected 
}) => {
  const [conflicts, setConflicts] = useState<any[]>([])
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const detectConflicts = async () => {
      if (!scheduleData.subject || !scheduleData.teacher || !scheduleData.room || 
          !scheduleData.time_slot || !scheduleData.start_date || !scheduleData.end_date) {
        return
      }

      setChecking(true)
      try {
        const result = await checkConflicts(scheduleData)
        setConflicts(result.conflicts || [])
        onConflictsDetected(result.conflicts || [])
      } catch (error) {
        console.error('Error checking conflicts:', error)
      } finally {
        setChecking(false)
      }
    }

    const timeoutId = setTimeout(detectConflicts, 500)
    return () => clearTimeout(timeoutId)
  }, [scheduleData, onConflictsDetected])

  if (checking) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="spinner" />
          <span className="text-warning-700">Vérification des conflits...</span>
        </div>
      </div>
    )
  }

  if (conflicts.length === 0) {
    return (
      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-success-600" />
          <span className="text-success-700">Aucun conflit détecté</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-error-50 border border-error-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-error-600" />
        <h4 className="font-medium text-error-900">
          {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
        </h4>
      </div>
      
      <div className="space-y-2">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-error-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-error-900">{conflict.type}</p>
                <p className="text-sm text-error-700">{conflict.message}</p>
                {conflict.conflicting_schedules && (
                  <div className="mt-2">
                    <p className="text-xs text-error-600">Cours en conflit:</p>
                    {conflict.conflicting_schedules.slice(0, 2).map((schedule: any, idx: number) => (
                      <p key={idx} className="text-xs text-error-600">
                        • {schedule.subject_name} - {schedule.teacher_name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <Clock className="w-4 h-4 text-error-600 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConflictDetector