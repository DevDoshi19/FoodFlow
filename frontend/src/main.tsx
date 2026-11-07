import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';

export const authService = import.meta.env.VITE_AUTH_SERVICE || 'http://localhost:5000'
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || 'http://localhost:5001'

const clientID = import.meta.env.VITE_CLIENT_ID 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientID}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
