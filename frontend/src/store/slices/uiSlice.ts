import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: boolean
  language: 'fr' | 'en'
  loading: {
    [key: string]: boolean
  }
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: true,
  language: 'fr',
  loading: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications
    },
    setLanguage: (state, action: PayloadAction<'fr' | 'en'>) => {
      state.language = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading
    },
    clearLoading: (state) => {
      state.loading = {}
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleNotifications,
  setLanguage,
  setLoading,
  clearLoading,
} = uiSlice.actions

export default uiSlice.reducer
