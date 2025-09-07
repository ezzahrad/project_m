import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types'
import { authAPI } from '../../services/authAPI'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials)
      localStorage.setItem('token', response.access)
      localStorage.setItem('refreshToken', response.refresh)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erreur de connexion')
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: string
  }) => {
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erreur d\'inscription')
    }
  }
)

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    try {
      const response = await authAPI.getCurrentUser()
      return response
    } catch (error: any) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      throw new Error('Session expirée')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.access
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Erreur de connexion'
        state.isAuthenticated = false
      })
      
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Erreur d\'inscription'
      })
      
      // Get current user
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUserAsync.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError, setToken } = authSlice.actions
export default authSlice.reducer
