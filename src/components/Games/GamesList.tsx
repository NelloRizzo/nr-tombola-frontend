// src/components/Games/GamesList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../../services/gameService';
import authService from '../../services/authService';
import './GamesList.scss';

interface ActiveGame {
    id: number;
    name: string;
    ownerId: number;
    ownerName: string;
    startedAt: string;
    endedAt?: string;
    isActive: boolean;
    totalNumbersDrawn: number;
    playerCount: number;
}

const GamesList: React.FC = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<ActiveGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        loadActiveGames();
    }, []);

    const loadActiveGames = async () => {
        try {
            if (!refreshing) setLoading(true);
            const result = await gameService.getActiveGames();

            if (result.success) {
                setGames(result.games || []);
                setError('');
            } else {
                setError(result.error || 'Failed to load games');
                setGames([]);
            }
        } catch (error) {
            setError('Network error - Cannot connect to server');
            console.error('Failed to load active games:', error);
            setGames([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadActiveGames();
    };

    const joinGame = (gameId: number) => {
        navigate(`/game/${gameId}`);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getGameStatus = (totalNumbers: number, isActive: boolean) => {
        if (!isActive) return 'Ended';
        if (totalNumbers === 0) return 'Starting';
        if (totalNumbers < 30) return 'Early';
        if (totalNumbers < 60) return 'Mid';
        if (totalNumbers < 90) return 'Late';
        return 'Almost Full';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Starting': return '#FFA500';
            case 'Early': return '#4CAF50';
            case 'Mid': return '#2196F3';
            case 'Late': return '#FF5722';
            case 'Almost Full': return '#9C27B0';
            case 'Ended': return '#dc3545';
            default: return '#666';
        }
    };

    return (
        <div className="games-list-container">
            <div className="games-list-header">
                <h1>🎯 Active Tombola Games</h1>
                <p>Join a game in progress or start your own</p>

                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-number">{games.length}</span>
                        <span className="stat-label">Active Games</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {games.reduce((sum, game) => sum + (game.playerCount || 0), 0)}
                        </span>
                        <span className="stat-label">Total Players</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {games.filter(g => g.isActive).length}
                        </span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
            </div>

            <div className="games-list-content">
                <div className="games-controls">
                    <button
                        onClick={handleRefresh}
                        className="refresh-btn"
                        disabled={refreshing}
                    >
                        {refreshing ? '🔄 Refreshing...' : '🔄 Refresh List'}
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="create-btn">
                        🎲 Create New Game
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading active games...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button onClick={handleRefresh} className="retry-btn" disabled={refreshing}>
                            {refreshing ? 'Retrying...' : 'Try Again'}
                        </button>
                    </div>
                ) : games.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎲</div>
                        <h3>No Active Games Found</h3>
                        <p>Be the first to start a Tombola game!</p>
                        <button onClick={() => navigate('/dashboard')} className="start-game-btn">
                            Start Your First Game
                        </button>
                    </div>
                ) : (
                    <div className="games-table-container">
                        <table className="games-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Game Name</th>
                                    <th>Host</th>
                                    <th>Players</th>
                                    <th>Started</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game) => {
                                    const status = getGameStatus(game.totalNumbersDrawn, game.isActive);
                                    const statusColor = getStatusColor(status);

                                    return (
                                        <tr key={game.id} className="game-row">
                                            <td>
                                                <div className="status-cell">
                                                    <span
                                                        className="status-indicator"
                                                        style={{ backgroundColor: statusColor }}
                                                    />
                                                    <span className="status-text">{status}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="game-name-cell">
                                                    <span className="game-name">{game.name}</span>
                                                    <span className="game-id">ID: #{game.id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="host-cell">
                                                    <span className="host-name">{game.ownerName}</span>
                                                    {game.ownerId === currentUser?.id && (
                                                        <span className="you-badge">You</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="players-cell">
                                                    <span className="players-count">{game.playerCount || 0}</span>
                                                    <span className="players-label">players</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="time-cell">
                                                    {formatTime(game.startedAt)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="progress-cell">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${(game.totalNumbersDrawn / 90) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="progress-text">
                                                        {game.totalNumbersDrawn}/90
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => joinGame(game.id)}
                                                    className="join-btn"
                                                >
                                                    {game.ownerId === currentUser?.id ? 'Rejoin' : 'Join'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesList;