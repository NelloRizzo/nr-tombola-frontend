// src/components/Table/GameTableManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import gameService, { type CalledNumber } from '../../services/gameService';
import Table from './Table'; // Importa il tuo componente Tabella presentazionale
import styles from './Table.module.scss'; // Stili

// Intervallo di aggiornamento: 30 secondi
const REFRESH_INTERVAL_MS = 30000;

const GameTableManager: React.FC = () => {
    // Recupera gameId dalla rotta (es. /game/:gameId)
    const { gameId } = useParams<{ gameId: string }>();
    const id = Number(gameId);
    // Stato per l'array di numeri estratti
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
    // Stato per l'ultimo numero estratto
    const [latestNumber, setLatestNumber] = useState<number | undefined>(undefined);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameName, setGameName] = useState("Caricamento...");

    // Funzione di fetching che recupera i numeri estratti
    const fetchGameData = useCallback(async () => {
        if (isNaN(id)) return;

        setError(null);

        try {
            // 1. Otteniamo lo stato del gioco per il nome e l'ultimo numero (opzionale)
            const statusResult = await gameService.getGameStatus(id);

            if (statusResult.success && statusResult.game) {
                setGameName(statusResult.game.name);

                // Usiamo l'array di numeri estratti dal GameStatus per il tabellone
                const numbers = statusResult.game.drawnNumbers || [];
                setDrawnNumbers(numbers);

                // Aggiorniamo l'ultimo numero estratto
                setLatestNumber(statusResult.game.lastDraw?.number);
                console.log(statusResult.game.lastDraw)
            } else {
                // Se non riusciamo a recuperare lo stato completo, fallback all'elenco dei numeri
                const numbersResult = await gameService.getCalledNumbers(id);
                if (numbersResult.success === false) {
                    throw new Error(numbersResult.error || "Impossibile caricare i numeri.");
                }

                const calledNumbersList: CalledNumber[] = numbersResult as CalledNumber[];
                const numbers = calledNumbersList.map(cn => cn.number);
                setDrawnNumbers(numbers);

                // L'ultimo numero sarà il primo se l'ordinamento è DESC come suggerito (drawnAt: 'DESC')
                setLatestNumber(calledNumbersList.length > 0 ? calledNumbersList[0].number : undefined);
            }

        } catch (err: any) {
            setError(err.message || 'Errore durante l\'aggiornamento dei numeri.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // useEffect per il Polling
    useEffect(() => {
        // Esegue il primo fetch al mount
        fetchGameData();

        const intervalId = setInterval(fetchGameData, REFRESH_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [fetchGameData]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            const expectedKey = `gameRefreshKey_${gameId}`;
            if (event.key === expectedKey) {
                fetchGameData();
            }
        }
        window.addEventListener('storage', handleStorageChange);

        return () => { window.removeEventListener('storage', handleStorageChange); }
    }, [gameId, fetchGameData]);

    if (loading) return <div className={styles.tableContainer}><p>Caricamento tabellone e numeri...</p></div>;
    if (error) return <div className={styles.tableContainer}><p className="error-message">Errore: {error}</p></div>;

    return (
        <Table
            drawnNumbers={drawnNumbers}
            latestNumber={latestNumber}
            gameName={gameName}
        />
    );
};

export default GameTableManager;