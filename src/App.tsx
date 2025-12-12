// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import './App.scss';
import AppLogic from './components/AppLogic/AppLogic';
import { AuthProvider } from './components/Auth/AuthProvider';
import CookieConsentBanner from './components/CookieConsentBanner/CookieConsentBanner';

const BASE_PATH = import.meta.env.VITE_PUBLIC_URL;

function App() {
  return (
    <Router basename={BASE_PATH}>
      <CookieConsentBanner />
      <AuthProvider>
        <div className="app">
          <AppLogic></AppLogic>
        </div>
      </AuthProvider>
    </Router >
  );
}

export default App;