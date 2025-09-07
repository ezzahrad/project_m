import React from 'react'
import { Building2, Plus } from 'lucide-react'

const DepartmentsPage: React.FC = () => {
  const departments = [
    {
      id: 1,
      name: 'Informatique',
      code: 'INFO',
      description: 'Département d\'informatique et sciences du numérique',
      head: 'Dr. Martin Dubois',
      programs: 5,
      teachers: 12,
      students: 156
    },
    {
      id: 2,
      name: 'Mathématiques',
      code: 'MATH',
      description: 'Département de mathématiques appliquées',
      head: 'Prof. Sarah Lemaire',
      programs: 3,
      teachers: 8,
      students: 89
    },
    {
      id: 3,
      name: 'Physique',
      code: 'PHYS',
      description: 'Département de physique et sciences physiques',
      head: 'Dr. Pierre Bernard',
      programs: 4,
      teachers: 10,
      students: 124
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Départements</h1>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau département
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{dept.code}</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Chef de département:</span>
                <span className="font-medium">{dept.head}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">{dept.programs}</p>
                <p className="text-xs text-gray-500">Filières</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{dept.teachers}</p>
                <p className="text-xs text-gray-500">Enseignants</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">{dept.students}</p>
                <p className="text-xs text-gray-500">Étudiants</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DepartmentsPage
