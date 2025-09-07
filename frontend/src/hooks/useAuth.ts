import { useAppSelector } from './redux'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  const hasRole = (roles: string | string[]) => {
    if (!user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const isAdmin = () => hasRole('ADMIN')
  const isDepartmentHead = () => hasRole(['ADMIN', 'DEPT_HEAD'])
  const isProgramHead = () => hasRole(['ADMIN', 'DEPT_HEAD', 'PROG_HEAD'])
  const isTeacher = () => hasRole(['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER'])
  const isStudent = () => hasRole(['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT'])

  const canManageUsers = () => isAdmin()
  const canManageDepartments = () => isDepartmentHead()
  const canManagePrograms = () => isProgramHead()
  const canManageSchedules = () => isProgramHead()
  const canViewReports = () => isDepartmentHead()

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    isAdmin,
    isDepartmentHead,
    isProgramHead,
    isTeacher,
    isStudent,
    canManageUsers,
    canManageDepartments,
    canManagePrograms,
    canManageSchedules,
    canViewReports,
  }
}
