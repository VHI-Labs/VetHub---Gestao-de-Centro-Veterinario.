import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import './styles/global.css'
import { initAutomaticAudioSystem } from './core/audio'
import { initDatabase } from './core/engine'
import { loadQueueStore } from './store/queueStore'

initAutomaticAudioSystem()
initDatabase().then(() => loadQueueStore()).catch(console.warn)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
