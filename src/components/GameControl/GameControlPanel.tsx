// src/components/GameControl/GameControlPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameService, { type GameStatus as GameStatusAPI, type Game, type CalledNumber } from '../../services/gameService';
import authService from '../../services/authService';

import './GameControl.scss';
import GameTableSmall from '../Game/GameTableSmall'; // Componente Tabellone (necessario per la UI)
// import { useGameRefresh } from '../Game/GameRefreshContext'; // Context per aggiornamenti (necessario per la UI)
import Modal from '../Common/Modal'; // Componente Modal (necessario per la UI)
import CardDisplay from '../Card/CardDisplay'; // Componente Cartella 3x9 (necessario per la UI)
import GamesList from '../Games/GamesList';

// Tipi di base
interface Card {
    id: number;
    name: string;
    cells: number[]; // Array piatto di 15 numeri (R1: 0-4, R2: 5-9, R3: 10-14)
}

interface GameControlState {
    id: number;
    name: string;
    drawnNumbers: number[];
    latestNumber: number | null;
    isStarted: boolean; // Mappa game.isActive
}

// DATI DI MOCK PER IL TEST DELLA UI (Con numeri validi per la griglia 3x9)
const MOCK_CARDS: Card[] = Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    name: `Tombolata 2025 [ S. ${Math.floor(i / 5) + 1}] <n. ${i % 5 + 1}>`,
    cells: [
        // RIGA 1 (5 numeri)
        (3 + i * 2) % 90 + 1, (15 + i * 2) % 90 + 1, (24 + i * 2) % 90 + 1, (67 + i * 2) % 90 + 1, (81 + i * 2) % 90 + 1,
        // RIGA 2 (5 numeri)
        (7 + i * 2) % 90 + 1, (18 + i * 2) % 90 + 1, (31 + i * 2) % 90 + 1, (52 + i * 2) % 90 + 1, (78 + i * 2) % 90 + 1,
        // RIGA 3 (5 numeri)
        (1 + i * 2) % 90 + 1, (43 + i * 2) % 90 + 1, (55 + i * 2) % 90 + 1, (77 + i * 2) % 90 + 1, (89 + i * 2) % 90 + 1
    ].filter(n => n > 0).slice(0, 15)
        .map(n => n === 90 ? 90 : n % 90 === 0 ? 90 : n % 90) // Assicura 1-90
}));

const PAGE_SIZE = 10;

const GameControlPanel: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    // Stato del gioco (usiamo GameStatus interface)
    const [game, setGame] = useState<GameControlState | null>(null);
    const [loading, setLoading] = useState(false);
    const [manualNumber, setManualNumber] = useState('');
    const [error, setError] = useState('');

    // --- STATI PER IL MODAL E LA VERIFICA VINCITE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allCards] = useState<Card[]>(MOCK_CARDS); // Lista fissa delle cartelle
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [winCheckMessage, setWinCheckMessage] = useState<{ cardId: number, message: string } | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [winLevelForDisplay, setWinLevelForDisplay] = useState<number | undefined>(undefined);

    // ----------------------------------------------------------------------
    // LOGICA DI CARICAMENTO E API (GAME SERVICE)
    // ----------------------------------------------------------------------

    const loadGameDetails = useCallback(async () => {
        setLoading(true);
        const id = Number(gameId);
        if (!gameId || isNaN(id)) {
            setError('ID Partita non valido.');
            setLoading(false);
            return;
        }

        try {
            const statusResult = await gameService.getGameStatus(id);

            if (statusResult.success && statusResult.game) {
                const apiStatus: GameStatusAPI = statusResult;

                // Mappa i dati dell'API nello stato locale
                setGame({
                    id: apiStatus.game.id,
                    name: apiStatus.game.name,
                    drawnNumbers: apiStatus.game.drawnNumbers,
                    latestNumber: apiStatus.game.lastDraw?.number || null,
                    isStarted: apiStatus.game.startedAt !== null,
                });

                setError('');
            } else {
                setError(statusResult.error || 'Impossibile recuperare lo stato del gioco.');
            }
        } catch (err) {
            setError('Errore nel caricamento dei dettagli del gioco.');
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    const handleStartStopGame = async (start: boolean) => {
        if (!game) return;

        if (start) {
            await gameService.startGame(game.id);
            setGame(prev => prev ? { ...prev, isStarted: true } : null);
        }
        else {
            await gameService.endGame(game.id);
            setGame(prev => prev ? { ...prev, drawnNumbers: [], latestNumber: null, isStarted: false } : null); // Resetta i numeri alla fine
        }
    };

    const handleDraw = async () => {
        if (!game || !game.isStarted) {
            setError('La partita non è iniziata. Premi "Inizia Partita".');
            return;
        }
        setLoading(true);

        try {
            const result = await gameService.drawRandomNumber(game.id);

            if (result.success) {
                triggerRefresh();
                // Ricarica i dettagli per aggiornare il tabellone e l'ultimo numero
                await loadGameDetails();
                setError('');
            } else {
                setError(result.error || 'Estrazione casuale fallita.');
            }
        } catch (err) {
            setError('Errore di rete durante l\'estrazione.');
        } finally {
            setLoading(false);
        }
    };

    const triggerRefresh = () => {
        const key = `gameRefreshKey_${game?.id}`;
        console.log(game?.id, key)
        localStorage.setItem(`gameRefreshKey_${game?.id}`, Date.now().toString());
    }

    const handleManualDraw = async () => {
        if (!game || !game.isStarted) {
            setError('La partita non è iniziata. Premi "Inizia Partita".');
            return;
        }

        const num = Number(manualNumber);
        if (num < 1 || num > 90 || isNaN(num)) {
            setError('Inserisci un numero valido (1-90).');
            return;
        }
        setLoading(true);

        try {
            const result = await gameService.drawSpecificNumber(game.id, num);

            if (result.success) {
                triggerRefresh();
                setManualNumber('');
                // Ricarica i dettagli per aggiornare il tabellone
                await loadGameDetails();
                setError('');
            } else {
                setError(result.error || 'Estrazione manuale fallita.');
            }
        } catch (err) {
            setError('Errore di rete durante l\'estrazione manuale.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPublicBoard = () => {
        if (gameId) {
            const publicUrl = `/game/${gameId}`;
            // Aprire in una nuova finestra/tab (comportamento standard)
            window.open(publicUrl, '_blank');
        }
    };

    // Esecuzione al caricamento
    useEffect(() => {
        loadGameDetails();
    }, [loadGameDetails]);


    // ----------------------------------------------------------------------
    // LOGICA MODAL E VINCITE
    // ----------------------------------------------------------------------

    const handleCheckWin = (card: Card) => {
        if (!game) return;

        // 1. Fase Immediata: Imposta il feedback di caricamento e la cartella da visualizzare
        setWinCheckMessage({ cardId: card.id, message: 'Verifica in corso...' });
        setSelectedCard(card);
        setWinLevelForDisplay(undefined);

        // 2. Fase Ritardata (Simulazione API)
        setTimeout(() => {
            const drawnSet = new Set(game.drawnNumbers);
            // Logica per trovare i numeri abbinati (su tutte le 3 righe)
            const matchedNumbers = card.cells.filter(cell => drawnSet.has(cell));

            let mockLevel = 0;
            let description = 'Nessuna Vincita';

            // Verifica delle vincite riga per riga (i 15 numeri sono salvati per riga: 0-4, 5-9, 10-14)
            for (let i = 0; i < 3; i++) {
                const row = card.cells.slice(i * 5, (i + 1) * 5);
                const rowMatches = row.filter(cell => drawnSet.has(cell)).length;

                // Aggiorna il livello di vincita massimo trovato
                if (rowMatches > mockLevel) {
                    mockLevel = rowMatches;
                }
            }

            if (mockLevel === 15) {
                description = 'TOMBOLA!';
            } else if (mockLevel === 5) {
                description = 'CINQUINA!';
            } else if (mockLevel >= 2) {
                description = `${mockLevel} numeri su una riga`;
            } else {
                description = 'Nessuna Vincita Trovata';
            }


            setWinLevelForDisplay(mockLevel);
            setWinCheckMessage({
                cardId: card.id,
                message: `RISULTATO: ${description} (${matchedNumbers.length}/15 totali)`
            });
        }, 600); // Ritardo simulato
    };

    // LOGICA DI FILTRO E PAGINAZIONE LATO CLIENT
    const filteredCards = allCards
        .filter(card =>
            card.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const totalFilteredCards = filteredCards.length;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalFilteredCards / PAGE_SIZE);

    const handleOpenCardsModal = () => {
        setIsModalOpen(true);
        setSelectedCard(null); // Resetta la visualizzazione della cartella
        setWinLevelForDisplay(undefined);
        setWinCheckMessage(null);
        setCurrentPage(1);
    };


    // ----------------------------------------------------------------------
    // RENDER DEL COMPONENTE
    // ----------------------------------------------------------------------

    if (loading) return <div>Caricamento Pannello di Controllo...</div>;
    if (!game) return <div>Partita non trovata o non autorizzata.</div>;

    return (
        <div className="game-control-panel">
            <div className="control-header">
                <h2>Pannello di Controllo: {game.name}</h2>
            </div>


            <div className="control-layout">

                {/* 1. Blocco Tabellone Piccolo (Colonna 1) */}
                <div className="action-block board-preview-block">
                    <h4>Tabellone in Tempo Reale</h4>

                    {/* Pulsanti Inizio/Fine Partita */}
                    <div className="game-status-controls">
                        <button
                            onClick={() => handleStartStopGame(!game.isStarted)}
                            className={game.isStarted ? 'btn-danger' : 'btn-primary'}
                        >
                            {game.isStarted ? 'Ferma Partita' : 'Inizia Partita'}
                        </button>
                        <button
                            onClick={handleOpenPublicBoard}
                            className="btn-secondary"
                            disabled={!game.isStarted}
                        >
                            Apri Tabellone Pubblico
                        </button>
                    </div>
                    <GameTableSmall drawnNumbers={game.drawnNumbers} latestNumber={game.latestNumber} />
                </div>

                {/* 2. Controlli Secondari (Colonna 2) */}
                <div className="secondary-controls">

                    {/* Blocco 2a: Estrazione e Input Manuale */}
                    <div className="action-block draw-block">
                        <h4>Estrazione Numeri</h4>
                        <button
                            onClick={handleDraw}
                            className="main-draw-btn"
                            disabled={!game.isStarted}
                        >
                            Estrai Numero Casuale
                        </button>
                        <div className="manual-input-group">
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={manualNumber}
                                onChange={(e) => setManualNumber(e.target.value)}
                                placeholder="Numero manuale (1-90)"
                                disabled={!game.isStarted}
                            />
                            <button
                                onClick={handleManualDraw}
                                className="secondary-btn"
                                disabled={!game.isStarted}
                            >
                                Estrai
                            </button>
                        </div>
                        {error && <p className="input-error">{error}</p>}
                    </div>

                    {/* Blocco 2b: Ultimi Numeri Estratti */}
                    <div className="action-block drawn-numbers-list">
                        <h4>Ultimi 5 Estratti</h4>
                        <ul className="number-list">
                            {game.drawnNumbers?.slice(0, 5).map((num: number, index: number) => (
                                <li key={index} className="number-item">{num}</li>
                            ))}
                            {game.drawnNumbers?.length === 0 && <li className="number-item-empty">Nessun numero estratto.</li>}
                        </ul>
                    </div>{/* 2b. Blocco Controllo Cartelle (Esteso su due colonne) */}
                    <div className="action-block card-control-block">
                        <h4>Verifica Vincite Cartelle</h4>
                        <p>Controlla lo stato di vincita di una specifica cartella.</p>
                        <button onClick={handleOpenCardsModal} className="primary-btn">
                            Apri Lista Cartelle ({totalFilteredCards} totali)
                        </button>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MODAL PER L'ELENCO E IL CONTROLLO DELLE CARTELLE */}
            {/* ------------------------------------------------------------- */}
            {isModalOpen && (
                <Modal
                    title="Elenco Cartelle e Verifica Vincite"
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCard(null);
                        setWinLevelForDisplay(undefined);
                    }}
                >
                    <div className="card-modal-content">

                        {/* INPUT DI RICERCA */}
                        <input
                            type="text"
                            placeholder="Cerca per nome cartella..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />

                        {/* LISTA DELLE CARTELLE */}
                        <ul className="cards-list">
                            {paginatedCards.length === 0 ? (
                                <p>Nessuna cartella trovata per "{searchTerm}".</p>
                            ) : (
                                paginatedCards.map(card => (
                                    <li key={card.id} className="card-item-row">
                                        <span className="card-name">{card.name}</span>
                                        <button
                                            onClick={() => handleCheckWin(card)}
                                            className="secondary-btn small-btn"
                                            disabled={!game.isStarted || (winCheckMessage?.cardId === card.id && winCheckMessage.message.includes('corso'))}
                                        >
                                            Controlla Vincita
                                        </button>
                                        {winCheckMessage?.cardId === card.id && (
                                            <span className="win-message">{winCheckMessage.message}</span>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>

                        {/* PAGINAZIONE */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    &lt; Precedente
                                </button>
                                <span>Pagina {currentPage} di {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Successiva &gt;
                                </button>
                            </div>
                        )}
                        <p className="total-count">Totale cartelle filtrate: {totalFilteredCards}</p>

                        {/* VISUALIZZAZIONE CARTELLE SELEZIONATA */}
                        {selectedCard && (
                            <CardDisplay
                                card={selectedCard}
                                drawnNumbers={game.drawnNumbers}
                                winLevel={winLevelForDisplay}
                            />
                        )}

                    </div>
                </Modal>
            )}

        </div>
    );
};

export default GameControlPanel;