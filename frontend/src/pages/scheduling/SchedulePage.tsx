import React from 'react'
import { Calendar } from 'lucide-react'

const SchedulePage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Calendar className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Emplois du temps</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Consultation des Emplois du Temps
          </h3>
          <p className="text-gray-600">
            Cette page permettra de consulter les emplois du temps par filière, enseignant ou salle.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SchedulePage
