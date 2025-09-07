import React from 'react'
import { User } from 'lucide-react'

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        </div>
        
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Page Profil
          </h3>
          <p className="text-gray-600">
            Cette page permettra aux utilisateurs de gérer leur profil.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
