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
        gameId: number,
        page: number,
        limit: number,
        searchTerm: string = ''
    ): Promise<PaginatedResult<Card> | { error: string }> {
        try {
            const response = await api.get(`${this.baseUrl}/game/${gameId}`, {
                params: {
                    page,
                    limit,
                    // Si assume che il backend supporti il filtro tramite il parametro 'search'
                    ...(searchTerm && { search: searchTerm })
                }
            });
            // Assumo che la risposta sia già nel formato PaginatedResult
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
            // Si assume che ci sia un endpoint dedicato alla verifica della vincita
            const response = await api.post<WinCheckResponse>(`${this.baseUrl}/check-win`, {
                gameId,
                cardId
            });
            return response.data;
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