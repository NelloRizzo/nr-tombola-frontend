// src/services/CardService.ts
import api from './api'; // Assumo che esista un file api.ts per l'istanza Axios configurata

// --- Tipi di Dati ---
export interface Card {
    id: number;
    name: string;
    cells: number[]; // Array piatto di 15 numeri
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

export interface WinCheckResponse {
    success: boolean;
    winLevel?: number; // 2=Ambo, 3=Terno, ..., 5=Cinquina, 15=Tombola
    error?: string;
    message?: string; // Messaggio descrittivo della vincita
}


class CardService {
    private readonly baseUrl = '/cards';

    /**
     * Recupera le cartelle con supporto per la paginazione e la ricerca.
     * Corrisponde al metodo paginate del BaseRepository sul backend.
     */
    async getPaginatedCards(
        page: number,
        limit: number,
        searchTerm: string = ''
    ): Promise<PaginatedResult<Card> | { error: string }> {
        try {
            const response = await api.get(`${this.baseUrl}`, {
                params: {
                    page,
                    limit,
                    ...(searchTerm && { search: searchTerm })
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Errore nel recupero delle cartelle:", error);
            return { error: error.response?.data?.error || 'Impossibile recuperare le cartelle.' };
        }
    }

    /**
     * Invia una cartella per la verifica della vincita contro i numeri estratti.
     */
    async checkCardWin(
        gameId: number,
        cardId: number
    ): Promise<WinCheckResponse> {
        try {
            const response = await api.get<WinCheckResponse>(`/games/${gameId}/card/${cardId}`);
            if (response.status === 200) {
                return ({
                    success: response.status === 200,
                    winLevel: response.data.winLevel,
                    message: response.data.message
                })
            }
            return {
                success: false,
                error: 'Verifica vincita fallita.'
            };

        } catch (error: any) {
            console.error("Errore nella verifica della vincita:", error);
            return {
                success: false,
                error: error.response?.data?.error || 'Verifica vincita fallita.'
            };
        }
    }
}

export default new CardService();