import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  MapPin,
  Calendar,
  CalendarDays,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Settings,
  User,
  X
} from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectUser, selectUserRole } from '../../store/selectors/authSelectors'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAppSelector(selectUser)
  const userRole = useAppSelector(selectUserRole)

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: Home,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      name: 'Emploi du temps',
      href: '/scheduling/timetable',
      icon: Calendar,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      name: 'Calendrier',
      href: '/scheduling/calendar',
      icon: CalendarDays,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      name: 'Conflits',
      href: '/scheduling/conflicts',
      icon: AlertTriangle,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      name: 'Rattrapages',
      href: '/scheduling/makeups',
      icon: Clock,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER']
    },
    {
      name: 'Créneaux horaires',
      href: '/scheduling/timeslots',
      icon: Clock,
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      name: 'Départements',
      href: '/academic/departments',
      icon: Building2,
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      name: 'Filières',
      href: '/academic/programs',
      icon: GraduationCap,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      name: 'Matières',
      href: '/academic/subjects',
      icon: BookOpen,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      name: 'Salles',
      href: '/academic/rooms',
      icon: MapPin,
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      name: 'Utilisateurs',
      href: '/users',
      icon: Users,
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      name: 'Rapports',
      href: '/reports',
      icon: FileText,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      name: 'Import',
      href: '/import',
      icon: Upload,
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: User,
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole || '')
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GestionEDT</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role_display}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar