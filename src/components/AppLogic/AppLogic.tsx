// Esempio: Contenuto di src/components/AppLogic/AppLogic.tsx (o analogo)

import { Routes, Route } from 'react-router-dom';
import { useTracking } from '../../hooks/useTracking'; // Il tuo hook di GA
import Login from '../Auth/Login';
import PrivateRoute from '../Auth/PrivateRoute';
import Register from '../Auth/Register';
import Dashboard from '../Dashboard/Dashboard';
import GameTableManager from '../Game/GameTableManager';
import GameControlPanel from '../GameControl/GameControlPanel';
import GamesList from '../Games/GamesList';
import Home from '../Home/Home';
import PageLayout from '../Layout/PageLayout';
import PrivacyPolicyPage from '../PrivacyPolicyPage/PrivacyPolicyPage';

const AppLogic = () => {
    useTracking();

    return (
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


            <Route path="/privacy-policy" element={<PageLayout><PrivacyPolicyPage /></PageLayout>} />

        </Routes>
    );
};

export default AppLogic;