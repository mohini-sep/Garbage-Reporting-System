import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add error boundary
const renderApp = () => {
  try {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <App />
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Something went wrong</h1>
        <p>${error.message}</p>
        <p>Check the console for more details.</p>
      </div>
    `
  }
}

renderApp()
