export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'ADMIN' | 'DEPT_HEAD' | 'PROG_HEAD' | 'TEACHER' | 'STUDENT'
  role_display: string
  phone?: string
  avatar?: string
  is_email_verified: boolean
  date_joined: string
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: string
  phone?: string
}

export interface AuthResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface TeacherProfile {
  id: number
  user: User
  employee_id: string
  teacher_type: 'FULL_TIME' | 'PART_TIME' | 'VISITING'
  teacher_type_display: string
  specialization?: string
  office_location?: string
  max_hours_per_week: number
  is_active: boolean
}

export interface StudentProfile {
  id: number
  user: User
  student_id: string
  program: number
  program_name: string
  department_name: string
  enrollment_year: number
  current_semester: number
  academic_year: number
  is_active: boolean
}