import { RootState } from '../store'

export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error
export const selectToken = (state: RootState) => state.auth.token

// Role-based selectors
export const selectUserRole = (state: RootState) => state.auth.user?.role
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === 'ADMIN'
export const selectIsDepartmentHead = (state: RootState) => state.auth.user?.role === 'DEPT_HEAD'
export const selectIsProgramHead = (state: RootState) => state.auth.user?.role === 'PROG_HEAD'
export const selectIsTeacher = (state: RootState) => state.auth.user?.role === 'TEACHER'
export const selectIsStudent = (state: RootState) => state.auth.user?.role === 'STUDENT'

export const selectCanManage = (state: RootState) => {
  const role = state.auth.user?.role
  return ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD'].includes(role || '')
}

export const selectCanViewSchedules = (state: RootState) => {
  const role = state.auth.user?.role
  return ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER', 'STUDENT'].includes(role || '')
}