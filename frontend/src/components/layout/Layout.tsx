import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Calendar, 
  Menu, 
  X, 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Settings, 
  FileText, 
  Upload,
  Bell,
  User,
  LogOut
} from 'lucide-react'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { Link, useNavigate, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    { 
      title: 'Tableau de bord', 
      icon: Home, 
      path: '/dashboard',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      title: 'Emplois du temps',
      icon: Calendar,
      path: '/scheduling',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT']
    },
    {
      title: 'Planification',
      icon: Calendar,
      path: '/timetable',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      title: 'Utilisateurs',
      icon: Users,
      path: '/users',
      roles: ['ADMIN']
    },
    {
      title: 'Enseignants',
      icon: GraduationCap,
      path: '/teachers',
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      title: 'Étudiants',
      icon: User,
      path: '/students',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      title: 'Départements',
      icon: Building2,
      path: '/academic/departments',
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      title: 'Filières',
      icon: BookOpen,
      path: '/academic/programs',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      title: 'Matières',
      icon: BookOpen,
      path: '/academic/subjects',
      roles: ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']
    },
    {
      title: 'Salles',
      icon: Building2,
      path: '/academic/classrooms',
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      title: 'Rapports',
      icon: FileText,
      path: '/reports',
      roles: ['ADMIN', 'DEPT_HEAD']
    },
    {
      title: 'Import',
      icon: Upload,
      path: '/import',
      roles: ['ADMIN', 'DEPT_HEAD']
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              {sidebarOpen && (
                <span className="ml-2 text-xl font-bold text-gray-800">
                  GestionEDT
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && (
                        <span className="ml-3 font-medium">{item.title}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User menu */}
          {sidebarOpen && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestion des Emplois du Temps
            </h1>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </Link>
              
              <Link
                to="/settings"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
