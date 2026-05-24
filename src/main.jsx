import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { runMigrationIfNeeded, seedIfNeeded } from './utils/init'

async function bootstrap() {
  await runMigrationIfNeeded()
  await seedIfNeeded()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter basename="/health-habit-tracker">
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

bootstrap()
