import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import academicSlice from './slices/academicSlice'
import schedulingSlice from './slices/schedulingSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    academic: academicSlice,
    scheduling: schedulingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch