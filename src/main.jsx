import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { AuthProvider } from './context/AuthContext'
import ReactGA from 'react-ga4';
ReactGA.initialize('G-VKPS37B8NT');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)