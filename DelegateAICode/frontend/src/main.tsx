import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'

// Environment initialization
const initializeApp = () => {
  try {
    // Initialize environment logging only in development
    if (import.meta.env.DEV) {
      console.log('🚀 Delegate AI starting...')
      console.log('Environment:', import.meta.env.MODE)
      console.log('API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api')
    }

    // Remove loading screen if it exists
    const loadingScreen = document.querySelector('.loading-screen')
    if (loadingScreen) {
      loadingScreen.remove()
    }

    // Log any environment warnings
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn('⚠️ VITE_API_BASE_URL not configured, using default')
    }

  } catch (error) {
    console.error('❌ Error initializing app:', error)
  }
}

// Initialize the app
initializeApp()

// Render the React app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)