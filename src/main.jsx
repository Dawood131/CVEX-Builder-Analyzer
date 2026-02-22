import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { CVProvider } from './context/CVContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CVProvider>
      <App />
    </CVProvider>
  </StrictMode>,
)
