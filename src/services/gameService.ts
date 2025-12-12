// src/services/gameService.ts
import api from './api';

export interface Game {
    id: number;
    name: string;
    startedAt?: string;
    endedAt?: string;
    ownerId: number;
    ownerName?: string;
    isActive: boolean;
    totalNumbersDrawn: number;
    drawnNumbers: number[];
    lastDraw?: CalledNumber;
}

export interface CalledNumber {
    id: number;
    number: number;
    drawnAt: string;
    gameId: number;
}

export interface GameStatus {
    game: Game;
}

class GameService {
    async createGame(name: string): Promise<any> {
        try {
            const response = await api.post('/games', { name });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create game'
            };
        }
    }

    async getActiveGames(): Promise<any> {
        try {
            const response = await api.get('/games/active');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch active games'
            };
        }
    }

    async getMyGames(): Promise<any> {
        try {
            const response = await api.get('/games/my-games');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch my games'
            };
        }
    }

    async startGame(gameId: number): Promise<any> {
        try {
            const response = await api.post(`/games/${gameId}/start`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to start game'
            };
        }
    }

    async endGame(gameId: number): Promise<any> {
        try {
            console.log(gameId)
            const response = await api.post(`/games/${gameId}/end`);
            console.log(response)
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to end game'
            };
        }
    }

    async drawRandomNumber(gameId: number): Promise<any> {
        try {
            const response = await api.post(`/games/${gameId}/draw/random`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to draw number'
            };
        }
    }

    async drawSpecificNumber(gameId: number, number: number): Promise<any> {
        try {
            const response = await api.post(`/games/${gameId}/draw`, { number });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to draw number'
            };
        }
    }

    async getCalledNumbers(gameId: number): Promise<any> {
        try {
            const response = await api.get(`/games/${gameId}/numbers`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch called numbers'
            };
        }
    }

    async getGameStatus(gameId: number): Promise<any> {
        try {
            const response = await api.get(`/games/${gameId}/status`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch game status'
            };
        }
    }

    async getLatestNumbers(gameId: number, limit: number = 10): Promise<any> {
        try {
            const response = await api.get(`/games/${gameId}/numbers/latest?limit=${limit}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch latest numbers'
            };
        }
    }
}

export default new GameService();