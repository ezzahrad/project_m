import React from 'react'
import TimeSlotManager from '../../components/scheduling/TimeSlotManager'

const TimeSlotPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des créneaux</h1>
        <p className="text-gray-600">Configurer les créneaux horaires disponibles</p>
      </div>
      
      <TimeSlotManager />
    </div>
  )
}

export default TimeSlotPage