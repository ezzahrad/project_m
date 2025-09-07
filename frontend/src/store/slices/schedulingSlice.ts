import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SchedulingState {
  currentView: 'week' | 'month' | 'day'
  selectedDate: string
  events: any[]
  conflicts: any[]
  isLoading: boolean
  error: string | null
}

const initialState: SchedulingState = {
  currentView: 'week',
  selectedDate: new Date().toISOString().split('T')[0],
  events: [],
  conflicts: [],
  isLoading: false,
  error: null,
}

const schedulingSlice = createSlice({
  name: 'scheduling',
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<'week' | 'month' | 'day'>) => {
      state.currentView = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setEvents: (state, action: PayloadAction<any[]>) => {
      state.events = action.payload
    },
    setConflicts: (state, action: PayloadAction<any[]>) => {
      state.conflicts = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setCurrentView, setSelectedDate, setEvents, setConflicts, clearError } = schedulingSlice.actions
export default schedulingSlice.reducer
