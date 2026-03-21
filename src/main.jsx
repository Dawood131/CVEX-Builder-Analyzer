import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { CVProvider } from './context/CVContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CVProvider>
        <App />
      </CVProvider>
    </AuthProvider>
  </StrictMode>,
)