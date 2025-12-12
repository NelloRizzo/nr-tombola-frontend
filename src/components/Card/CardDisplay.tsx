// src/components/Card/CardDisplay.tsx

import React from 'react';
import './CardDisplay.scss'; // Importiamo gli stili

// Tipi di base
interface Card {
    id: number;
    name: string;
    cells: number[]; // Array piatto di 15 numeri (R1: 0-4, R2: 5-9, R3: 10-14)
}

interface CardDisplayProps {
    card: Card;
    drawnNumbers: number[]; // Tutti i numeri estratti finora
    winLevel?: number; // Livello di vincita (es. 2=Ambo, 5=Cinquina, 15=Tombola)
}

/**
 * Componente che visualizza la cartella della Tombola nel formato 3 righe x 9 colonne,
 * evidenziando i numeri estratti.
 */
const CardDisplay: React.FC<CardDisplayProps> = ({ card, drawnNumbers, winLevel }) => {

    // Controllo di sicurezza: se i dati non sono validi, non renderizziamo la griglia
    if (!card || !card.cells || card.cells.length !== 15) {
        return (
            <div className="card-display-error">
                **Impossibile visualizzare la cartella:** Dati incompleti o non validi ({card?.cells?.length ?? 0}/15 numeri).
            </div>
        );
    }

    const drawnSet = new Set(drawnNumbers);

    // --- MAPPATURA LOGICA 15 NUMERI -> GRIGLIA 3x9 ---
    const grid: (number | null)[][] = Array(3).fill(null).map(() => Array(9).fill(null));

    // 1. Suddivisione dell'array piatto in 3 righe logiche
    // Assumiamo che i primi 5 numeri siano R1, 5-10 R2, 10-15 R3
    const row1 = card.cells.slice(0, 5);
    const row2 = card.cells.slice(5, 10);
    const row3 = card.cells.slice(10, 15);
    const logicalRows = [row1, row2, row3];

    // 2. Popolamento della griglia 3x9
    logicalRows.forEach((row, rowIndex) => {
        row.forEach(number => {
            let columnIndex: number;

            if (number >= 1 && number <= 90) {

                // Mappatura Tombola Standard (Colonna 1 = 1-10, Colonna 9 = 80-90)
                if (number === 90) {
                    // Il 90 appartiene all'ultima colonna (indice 8)
                    columnIndex = 8;
                } else {
                    // La formula Math.floor((N-1) / 10) funziona correttamente 
                    // per la divisione 1-10, 11-20, ecc. fino a 81-89.
                    columnIndex = Math.floor((number - 1) / 10);
                }
            } else {
                return;
            }

            // Inserisce il numero nella posizione calcolata
            grid[rowIndex][columnIndex] = number;
        });
    });
    // --- FINE MAPPATURA ---

    const isDrawn = (number: number) => drawnSet.has(number);

    const getWinClass = () => {
        if (winLevel === 15) return 'win-tombola';
        if (winLevel && winLevel >= 2) return 'win-line'; // Cinquina, Quaterna, Terno, Ambo, etc.
        return '';
    };

    return (
        <div className={`card-display-container ${getWinClass()}`}>
            <h4>Visualizzazione: {card.name}</h4>
            {winLevel !== undefined && winLevel > 0 && (
                <p className="win-status">Vincita massima attuale: **{winLevel === 15 ? 'TOMBOLA' : winLevel === 5 ? 'CINQUINA o superiore' : `Riga da ${winLevel} numeri`}**</p>
            )}

            <div className="card-grid-full">
                {/* Visualizzazione della griglia 3x9 */}
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="card-row-full">
                        {row.map((cellNumber, colIndex) => (
                            <div
                                key={colIndex}
                                // Determina la classe in base a: è un numero? è estratto?
                                className={`card-cell-full ${cellNumber !== null ? 'is-number' : 'is-empty'} ${cellNumber && isDrawn(cellNumber) ? 'is-drawn' : ''}`}
                            >
                                {cellNumber !== null ? cellNumber : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardDisplay;