export interface TimeSlot {
  id: number
  day_of_week: number
  day_display: string
  start_time: string
  end_time: string
  duration_minutes: number
  name?: string
  is_active: boolean
  created_at: string
}

export interface Schedule {
  id: number
  title: string
  subject: number
  subject_name: string
  teacher: number
  teacher_name: string
  room: number
  room_name: string
  time_slot: number
  time_slot_display: string
  programs_list: Array<{
    id: number
    program: number
    program_name: string
    is_mandatory: boolean
  }>
  start_date: string
  end_date: string
  student_count: number
  notes?: string
  is_cancelled: boolean
  cancellation_reason?: string
  is_active: boolean
  created_at: string
}

export interface WeeklySchedule {
  week_start: string
  week_end: string
  schedule: {
    [key: number]: {
      date: string
      day_name: string
      schedules: Schedule[]
    }
  }
}

export interface TeacherUnavailability {
  id: number
  teacher: number
  teacher_name: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  unavailability_type: string
  unavailability_type_display: string
  reason: string
  is_all_day: boolean
  is_active: boolean
  created_at: string
}

export interface MakeupSession {
  id: number
  original_schedule: number
  original_subject: string
  original_teacher: string
  proposed_date: string
  proposed_time_slot: number
  proposed_time_display: string
  proposed_room: number
  proposed_room_name: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  status_display: string
  reason: string
  approved_by?: number
  approved_by_name?: string
  approval_date?: string
  is_active: boolean
  created_at: string
}