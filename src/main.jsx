import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'
import App from './App.jsx'
import thinkIndiaFavicon from './assets/Think_India_Logo.svg'
import { AuthProvider } from './hooks/useAuth.jsx'

// Ensure favicon uses Think India logo in both dev and build
function setFavicon(href) {
  if (typeof document === 'undefined') return
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon']
  rels.forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`)
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', rel)
      document.head.appendChild(link)
    }
    link.setAttribute('href', href)
    // Prefer SVG type when applicable
    if (!link.getAttribute('type')) link.setAttribute('type', 'image/svg+xml')
  })
}

setFavicon(thinkIndiaFavicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
