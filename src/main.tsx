import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './stores/auth.store'
import { useThemeStore } from './stores/theme.store'
import { useSidebarStore } from './stores/sidebar.store'
import './index.css'
import App from './App.tsx'

// Khôi phục phiên làm việc và cấu hình giao diện ngay khi nạp ứng dụng
useAuthStore.getState().initAuth()
useThemeStore.getState().initTheme()
useSidebarStore.getState().initSidebar()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
