import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Department, Program, Subject, Classroom } from '../../types'

interface AcademicState {
  departments: Department[]
  programs: Program[]
  subjects: Subject[]
  classrooms: Classroom[]
  isLoading: boolean
  error: string | null
}

const initialState: AcademicState = {
  departments: [],
  programs: [],
  subjects: [],
  classrooms: [],
  isLoading: false,
  error: null,
}

// Async thunks - placeholder pour l'instant
export const fetchDepartments = createAsyncThunk(
  'academic/fetchDepartments',
  async () => {
    // API call ici
    return []
  }
)

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload
    },
    setPrograms: (state, action: PayloadAction<Program[]>) => {
      state.programs = action.payload
    },
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload
    },
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false
        state.departments = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Erreur lors du chargement'
      })
  },
})

export const { setDepartments, setPrograms, setSubjects, setClassrooms, clearError } = academicSlice.actions
export default academicSlice.reducer
