import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setGtmDefaultConsent } from './components/CookieConsentBanner/CookieConsentBanner'
import './index.scss'

setGtmDefaultConsent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
