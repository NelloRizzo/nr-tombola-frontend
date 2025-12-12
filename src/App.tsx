// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import GamesList from './components/Games/GamesList';
import PrivateRoute from './components/Auth/PrivateRoute';
import PageLayout from './components/Layout/PageLayout';
import './App.scss';
import { AuthProvider } from './components/Auth/AuthProvider';
import GameControlPanel from './components/GameControl/GameControlPanel';
import GameTableManager from './components/Game/GameTableManager';

const BASE_PATH = import.meta.env.VITE_PUBLIC_URL;

function App() {
  return (
    <Router basename={BASE_PATH}>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Route con layout normale */}
            <Route path="/" element={
              <PageLayout>
                <Home />
              </PageLayout>
            } />

            <Route path="/login" element={
              <PageLayout>
                <Login />
              </PageLayout>
            } />

            <Route path="/register" element={
              <PageLayout>
                <Register />
              </PageLayout>
            } />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <PageLayout>
                  <Dashboard />
                </PageLayout>
              </PrivateRoute>
            } />

            <Route path="/games" element={
              <PageLayout >
                <GamesList />
              </PageLayout>
            } />

            {/* Route di CONTROLLO GIOCO PROTETTA (Solo per il proprietario/caller) */}
            <Route path="/game/control/:gameId" element={
              <PrivateRoute>
                <PageLayout>
                  <GameControlPanel />
                </PageLayout>
              </PrivateRoute>
            } />

            {/* Route del gioco SENZA layout (fullscreen) */}
            <Route path="/game/table/:gameId" element={
              <GameTableManager />
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router >
  );
}

export default App;