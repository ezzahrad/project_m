// User Types
export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  role: 'ADMIN' | 'DEPT_HEAD' | 'PROG_HEAD' | 'TEACHER' | 'STUDENT'
  phone?: string
  avatar?: string
  is_email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Academic Types
export interface Department {
  id: number
  name: string
  code: string
  description?: string
  head?: User
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Program {
  id: number
  name: string
  code: string
  level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'D1' | 'D2' | 'D3'
  department: Department
  head?: User
  duration_years: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: number
  name: string
  code: string
  program: Program
  teacher?: User
  credits: number
  hours_per_week: number
  course_type: 'CM' | 'TD' | 'TP' | 'PROJET' | 'SEMINAIRE'
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: number
  name: string
  code: string
  capacity: number
  equipment: string[]
  location?: string
  is_available: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Scheduling Types
export interface TimeSlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Schedule {
  id: number
  subject: Subject
  classroom: Classroom
  teacher: User
  time_slot: TimeSlot
  date: string
  week_type: 'A' | 'B' | 'ALL'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conflict {
  id: string
  type: 'TEACHER_CONFLICT' | 'CLASSROOM_CONFLICT' | 'STUDENT_CONFLICT'
  schedules: Schedule[]
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  resolved: boolean
}

// API Response Types
export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface APIResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: string
}

// Filter Types
export interface DepartmentFilters {
  search?: string
  is_active?: boolean
}

export interface ProgramFilters {
  search?: string
  department?: number
  level?: string
  is_active?: boolean
}

export interface ScheduleFilters {
  date_from?: string
  date_to?: string
  teacher?: number
  classroom?: number
  program?: number
  subject?: number
}

// Export Types
export interface ExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV'
  data_type: 'SCHEDULE' | 'TEACHERS' | 'STUDENTS' | 'CLASSROOMS'
  filters?: any
  date_range?: {
    start: string
    end: string
  }
}
