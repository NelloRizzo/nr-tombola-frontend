import NumberTile from './NumberTile';
import styles from './Table.module.scss';

interface TableProps {
    drawnNumbers: number[];
    latestNumber?: number;
    gameName?: string;
    totalDrawn?: number;
    onNumberClick?: (number: number) => void;
    onBackClick?: () => void;
}

const Table: React.FC<TableProps> = (({
    drawnNumbers,
    latestNumber,
    gameName = "Tombola Game",
    onBackClick,
    onNumberClick
}) => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    return (
        <div className={styles.tableContainer}>
            {/* 🟢 PULSANTE BACK IN ALTO A SINISTRA */}
            {onBackClick && (
                <button
                    className={styles.backButton}
                    onClick={onBackClick}
                    title="Torna alla pagina precedente"
                >
                    ←
                </button>
            )}
            <div className={styles.tableWrapper}>
                {/* Titolo verticale a sinistra */}
                <div className={styles.verticalGameTitle}>
                    {gameName}
                </div>

                {/* Contenitore principale */}
                <div style={{ position: 'relative', flex: 1 }}>

                    {/* Tabellone */}
                    <div className={styles.tableGrid}>
                        {allNumbers.map((number) => (
                            <NumberTile
                                key={number}
                                number={number}
                                isDrawn={drawnNumbers.includes(number)}
                                isLatest={number === latestNumber}
                                onClick={() => onNumberClick?.(number)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Table;