import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx is executing')

const rootElement = document.getElementById('root')

if (rootElement) {
  try {
    console.log('Attempting to render App')
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('App rendered successfully')
  } catch (error) {
    console.error('Error rendering the app:', error)
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h1>Error Rendering App</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre>${error instanceof Error && error.stack ? error.stack : 'No stack trace available'}</pre>
      </div>
    `
  }
} else {
  console.error('Root element not found')
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found</div>'
}