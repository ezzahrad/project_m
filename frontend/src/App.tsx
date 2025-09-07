import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'

// Store Redux
import { store } from './store'

// Layout Components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'

// Academic Pages
import DepartmentsPage from './pages/academic/DepartmentsPage'
import ProgramsPage from './pages/academic/ProgramsPage'
import SubjectsPage from './pages/academic/SubjectsPage'
import ClassroomsPage from './pages/academic/ClassroomsPage'

// User Management
import UsersPage from './pages/users/UsersPage'
import TeachersPage from './pages/teacher/TeachersPage'
import StudentsPage from './pages/student/StudentsPage'

// Scheduling
import SchedulePage from './pages/scheduling/SchedulePage'
import TimetablePage from './pages/scheduling/TimetablePage'

// Reports
import ReportsPage from './pages/reports/ReportsPage'

// Settings
import SettingsPage from './pages/settings/SettingsPage'

// Import
import ImportPage from './pages/import/ImportPage'

console.log('App.tsx is loading...')

function App() {
  console.log('App component is rendering...')
  
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Routes publiques avec AuthLayout */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              }
            />

            {/* Routes protégées avec Layout principal */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Academic Management */}
            <Route
              path="/academic/departments"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD']}>
                  <Layout>
                    <DepartmentsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/academic/programs"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']}>
                  <Layout>
                    <ProgramsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/academic/subjects"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']}>
                  <Layout>
                    <SubjectsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/academic/classrooms"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD']}>
                  <Layout>
                    <ClassroomsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* User Management */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole={['ADMIN']}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD']}>
                  <Layout>
                    <TeachersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD', 'PROG_HEAD']}>
                  <Layout>
                    <StudentsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Scheduling */}
            <Route
              path="/scheduling"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SchedulePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TimetablePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD']}>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Import */}
            <Route
              path="/import"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'DEPT_HEAD']}>
                  <Layout>
                    <ImportPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  )
}

export default App
