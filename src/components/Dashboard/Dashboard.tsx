// src/components/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import gameService from '../../services/gameService';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newGameName, setNewGameName] = useState('');

    useEffect(() => {
        loadGames();
    }, [navigate]);

    const loadGames = async () => {
        setLoading(true);
        const result = await gameService.getMyGames();
        if (result.success) {
            setGames(result.games || []);
        }
        setLoading(false);
    };

    const handleCreateGame = async () => {
        if (!newGameName.trim()) return;

        const result = await gameService.createGame(newGameName);
        if (result.success && result.game) {
            navigate(`/game/control/${result.game.id}`);
        } else {
            alert(result.error || 'Failed to create game');
        }
    };

    const handleLogout = () => {
        authService.logout();
    };

    const getGameRoute = (game: any) => {
        // game.ownerId dovrebbe essere fornito dal backend nel GameService.getUserGames
        if (game.ownerId === user?.id) {
            // Se l'utente è il proprietario, va al Pannello di Controllo
            return `/game/control/${game.id}`;
        } else {
            // Altrimenti, va al Tabellone pubblico
            return `/game/${game.id}`;
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="user-info">
                    <h2>Welcome, {user?.name}</h2>
                    <p>{user?.email}</p>
                    <div className="user-roles">
                        {user?.roles?.map(role => (
                            <span key={role} className="role-badge">{role}</span>
                        ))}
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <main className="dashboard-content">
                <div className="create-game-section">
                    <h3>Create New Game</h3>
                    <div className="create-game-form">
                        <input
                            type="text"
                            placeholder="Enter game name"
                            value={newGameName}
                            onChange={(e) => setNewGameName(e.target.value)}
                        />
                        <button onClick={handleCreateGame} disabled={!authService.isCaller()}>
                            {authService.isCaller() ? 'Create Game' : 'Caller Role Required'}
                        </button>
                    </div>
                </div>

                <div className="games-section">
                    <h3>My Games</h3>
                    {loading ? (
                        <p>Loading games...</p>
                    ) : games.length === 0 ? (
                        <p>No games yet. Create your first game!</p>
                    ) : (
                        <div className="games-grid">
                            {games.map(game => (
                                <div key={game.id} className="game-card" onClick={() => navigate(getGameRoute(game))}>
                                    <h4>{game.name}</h4>
                                    <p>Status: {game.isActive ? 'Active' : 'Ended'}</p>
                                    <p>Numbers drawn: {game.totalNumbersDrawn || 0}/90</p>
                                    <p>Started: {new Date(game.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;