import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'
import { useStore } from '@/store/useStore';
import './index.css'
import App from './App.tsx'

useStore.getState().hydrateFromStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
