export interface Department {
  id: number
  name: string
  code: string
  description?: string
  head?: number
  head_name?: string
  programs_count: number
  teachers_count: number
  is_active: boolean
  created_at: string
}

export interface Program {
  id: number
  name: string
  code: string
  level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'D1' | 'D2' | 'D3'
  level_display: string
  duration_years: number
  department: number
  department_name: string
  head?: number
  head_name?: string
  max_students: number
  current_students_count: number
  description?: string
  is_active: boolean
  created_at: string
}

export interface Subject {
  id: number
  name: string
  code: string
  description?: string
  subject_type: 'COURSE' | 'TD' | 'TP' | 'PROJECT' | 'SEMINAR'
  subject_type_display: string
  credits: number
  hours_per_week: number
  department: number
  department_name: string
  assigned_teachers: Array<{
    id: number
    name: string
    employee_id: string
  }>
  is_active: boolean
  created_at: string
}

export interface Room {
  id: number
  name: string
  code: string
  room_type: 'AMPHITHEATER' | 'CLASSROOM' | 'LAB' | 'COMPUTER_LAB' | 'CONFERENCE' | 'WORKSHOP'
  room_type_display: string
  capacity: number
  building: string
  floor: string
  equipment?: string
  department?: number
  department_name?: string
  is_available: boolean
  is_active: boolean
  created_at: string
}