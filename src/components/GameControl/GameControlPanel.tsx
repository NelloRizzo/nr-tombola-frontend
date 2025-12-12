// src/components/GameControl/GameControlPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import gameService, { type GameStatus as GameStatusAPI } from '../../services/gameService';
import cardService, { type PaginatedResult, type WinCheckResponse } from '../../services/cardService';

import './GameControl.scss';
import GameTableSmall from '../Game/GameTableSmall'; // Componente Tabellone (necessario per la UI)
// import { useGameRefresh } from '../Game/GameRefreshContext'; // Context per aggiornamenti (necessario per la UI)
import Modal from '../Common/Modal'; // Componente Modal (necessario per la UI)
import CardDisplay from '../Card/CardDisplay'; // Componente Cartella 3x9 (necessario per la UI)

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
    isEnded: boolean
}

const PAGE_SIZE = 10;

// Tipo per gestire il risultato della paginazione
const INITIAL_PAGINATED_RESULT: PaginatedResult<Card> = {
    data: [],
    total: 0,
    page: 1,
    pages: 0,
    limit: PAGE_SIZE
};

const GameControlPanel: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    // Stato del gioco (usiamo GameStatus interface)
    const [game, setGame] = useState<GameControlState | null>(null);
    const [loading, setLoading] = useState(false);
    const [manualNumber, setManualNumber] = useState('');
    const [error, setError] = useState('');

    // --- STATI PER IL MODAL E LA VERIFICA VINCITE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [winCheckMessage, setWinCheckMessage] = useState<{ cardId: number, message: string } | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [winLevelForDisplay, setWinLevelForDisplay] = useState<number | undefined>(undefined);
    const [isCardsLoading, setIsCardsLoading] = useState(false)
    const [paginatedCardsResult, setPaginatedCardsResult] = useState<PaginatedResult<Card>>(INITIAL_PAGINATED_RESULT);

    // -----------------------------
    // LOGICA API: GESTIONE CARTELLE
    // -----------------------------

    const fetchCards = useCallback(async (page: number, term: string) => {
        if (!game) return;
        setIsCardsLoading(true);
        setError('');

        try {
            const result = await cardService.getPaginatedCards(
                page,
                PAGE_SIZE,
                term
            );

            if ('error' in result) {
                setError(result.error);
                setPaginatedCardsResult(INITIAL_PAGINATED_RESULT);
            } else {
                setPaginatedCardsResult(result);
            }
        } catch (err) {
            setError('Errore di rete nel recupero delle cartelle.');
            setPaginatedCardsResult(INITIAL_PAGINATED_RESULT);
        } finally {
            setIsCardsLoading(false);
        }
    }, [game]);

    // Effetto per rifare il fetch quando cambia la pagina o il termine di ricerca
    useEffect(() => {
        if (isModalOpen && game) {
            fetchCards(currentPage, searchTerm);
        }
    }, [isModalOpen, currentPage, searchTerm, game, fetchCards]);

    // Funzione per aprire il Modal e iniziare il fetch
    const handleOpenCardsModal = () => {
        setIsModalOpen(true);
        setSearchTerm(''); // Resetta la ricerca
        setCurrentPage(1); // Va alla prima pagina
        setSelectedCard(null);
        setWinLevelForDisplay(undefined);
        setWinCheckMessage(null);
        // Il fetch verrà attivato dall'useEffect
    };

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
                    isEnded: apiStatus.game.endedAt !== null
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
            const result = await gameService.startGame(game.id);
            if (result.success) {
                setGame(prev => prev ? { ...prev, isStarted: true } : null);
            }
        }
        else {
            const result = await gameService.endGame(game.id);
            if (result.success) {
                setGame(prev => prev ? { ...prev, drawnNumbers: [], latestNumber: null, isEnded: true } : null); // Resetta i numeri alla fine
            }
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
            const publicUrl = `/game/table/${gameId}`;
            // Aprire in una nuova finestra/tab (comportamento standard)
            window.open(publicUrl, '_blank');
        }
    };

    // Esecuzione al caricamento
    useEffect(() => {
        loadGameDetails();
    }, [loadGameDetails]);

    // ----------------------------------------------------------------------
    // LOGICA API: VERIFICA VINCITE (Sostituzione del Mock)
    // ----------------------------------------------------------------------

    const handleCheckWin = async (card: Card) => {
        if (!game) return;

        // 1. Reset e Messaggio di Attesa
        setWinCheckMessage({ cardId: card.id, message: 'Verifica vincita in corso...' });
        setSelectedCard(card);
        setWinLevelForDisplay(undefined);

        try {
            // 2. Chiamata API al backend per la verifica
            const result: WinCheckResponse = await cardService.checkCardWin(
                game.id,
                card.id
            );

            // 3. Elaborazione della Risposta
            if (result.success) {

                // winLevel è il numero di numeri vincenti sulla riga più vincente (es. 5 per Cinquina)
                const winLevel = result.winLevel ?? 0;

                setWinLevelForDisplay(winLevel);
                setWinCheckMessage({
                    cardId: card.id,
                    // Il messaggio viene fornito direttamente dall'API
                    message: `RISULTATO: ${result.message || 'Verifica completata.'}`
                });

            } else {
                // Gestione di errori specifici (es. partita non attiva)
                setWinLevelForDisplay(0);
                setWinCheckMessage({
                    cardId: card.id,
                    message: `ERRORE: ${result.error || 'Verifica vincita fallita.'}`
                });
            }

        } catch (error) {
            // Gestione errori di rete
            console.error('Errore di rete durante la verifica vincita:', error);
            setWinLevelForDisplay(0);
            setWinCheckMessage({
                cardId: card.id,
                message: 'ERRORE: Errore di rete nella verifica vincita.'
            });
        }
    };

    // ESTRAZIONE DELLE VARIABILI DAL RISULTATO API 
    const { data: paginatedCards, total: totalFilteredCards, pages: totalPages } = paginatedCardsResult;

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
                        <button disabled={game.isEnded}
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
                            disabled={!game.isStarted || game.isEnded}
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
                                disabled={!game.isStarted || game.isEnded}
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
                            {isCardsLoading ? (
                                <p>Caricamento cartelle...</p>
                            ) : paginatedCards.length === 0 ? (
                                <p>Nessuna cartella trovata per "{searchTerm}".</p>
                            ) : (
                                paginatedCards.map((card: Card) => (
                                    <li key={card.id} className="card-item-row">
                                        <span className="card-name">{card.name}</span>
                                        <button
                                            onClick={() => handleCheckWin(card)}
                                            className="secondary-btn small-btn"
                                            // Disabilita se la partita non è iniziata O se la verifica è già in corso
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