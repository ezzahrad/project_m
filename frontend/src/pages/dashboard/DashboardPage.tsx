import React from 'react'
import { useSelector } from 'react-redux'
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Building2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { RootState } from '../../store'

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  const stats = [
    {
      title: 'Cours cette semaine',
      value: '24',
      icon: Calendar,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Enseignants actifs',
      value: '156',
      icon: Users,
      color: 'bg-green-500',
      trend: '+3%'
    },
    {
      title: 'Salles utilisées',
      value: '89%',
      icon: Building2,
      color: 'bg-purple-500',
      trend: '+5%'
    },
    {
      title: 'Conflits résolus',
      value: '7',
      icon: CheckCircle,
      color: 'bg-yellow-500',
      trend: '-2'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'schedule',
      message: 'Nouveau cours programmé pour Mathématiques L1',
      time: 'il y a 2 heures',
      icon: Calendar
    },
    {
      id: 2,
      type: 'conflict',
      message: 'Conflit résolu - Salle A101 mercredi 14h',
      time: 'il y a 4 heures',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'user',
      message: 'Nouvel enseignant ajouté - Dr. Martin',
      time: 'il y a 1 jour',
      icon: Users
    },
    {
      id: 4,
      type: 'schedule',
      message: 'Planning de la semaine validé',
      time: 'il y a 2 jours',
      icon: CheckCircle
    }
  ]

  const upcomingClasses = [
    {
      id: 1,
      subject: 'Mathématiques',
      program: 'L1 Informatique',
      time: '09:00 - 10:30',
      classroom: 'A101',
      teacher: 'Dr. Dubois'
    },
    {
      id: 2,
      subject: 'Physique',
      program: 'L2 Sciences',
      time: '10:45 - 12:15',
      classroom: 'B203',
      teacher: 'Prof. Martin'
    },
    {
      id: 3,
      subject: 'Algorithmique',
      program: 'L2 Informatique',
      time: '14:00 - 15:30',
      classroom: 'C105',
      teacher: 'Dr. Lemaire'
    }
  ]

  const getRoleBasedWelcome = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Administrateur'
      case 'DEPT_HEAD':
        return 'Chef de département'
      case 'PROG_HEAD':
        return 'Chef de filière'
      case 'TEACHER':
        return 'Enseignant'
      case 'STUDENT':
        return 'Étudiant'
      default:
        return 'Utilisateur'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bonjour, {user?.first_name} !
            </h1>
            <p className="text-gray-600">
              Bienvenue sur votre tableau de bord {getRoleBasedWelcome().toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activités récentes
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cours à venir
          </h3>
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cls.subject}</h4>
                    <p className="text-sm text-gray-600">{cls.program}</p>
                    <p className="text-sm text-gray-500">{cls.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{cls.time}</p>
                    <p className="text-sm text-gray-600">{cls.classroom}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Nouvel emploi du temps</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Ajouter utilisateur</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Nouvelle matière</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Building2 className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Gérer salles</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
