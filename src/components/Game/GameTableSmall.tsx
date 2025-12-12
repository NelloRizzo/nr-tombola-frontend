import React from 'react';
import './GameTableSmall.scss';

interface GameTableSmallProps {
    // Array di numeri estratti (e.g., [5, 12, 30])
    drawnNumbers: number[];
    latestNumber: number | null;
}

const GameTableSmall: React.FC<GameTableSmallProps> = ({ drawnNumbers }) => {
    // Crea un array di numeri da 1 a 90
    const cells: number[] = Array.from({ length: 90 }, (_, i) => i + 1);

    // Usa un Set per lookup più veloci
    const drawnSet = new Set(drawnNumbers);

    return (
        <div className="tombola-board-small">
            {cells.map(number => (
                <div
                    key={number}
                    className={`board-cell-small ${drawnSet.has(number) ? 'drawn' : ''}`}
                >
                    {number}
                </div>
            ))}
        </div>
    );
};

export default GameTableSmall;