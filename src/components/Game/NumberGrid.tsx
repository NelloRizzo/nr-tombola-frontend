// src/components/Game/NumberGrid.tsx
import React from 'react';
import NumberTile from './NumberTile';
import './NumberGrid.scss';

interface NumberGridProps {
  drawnNumbers: number[];
  latestNumber?: number;
  onNumberClick?: (number: number) => void;
}

const NumberGrid: React.FC<NumberGridProps> = ({ 
  drawnNumbers, 
  latestNumber,
  onNumberClick 
}) => {
  return (
    <div className="number-grid">
      {Array.from({ length: 90 }, (_, i) => i + 1).map(number => (
        <NumberTile
          key={number}
          number={number}
          isDrawn={drawnNumbers.includes(number)}
          isLatest={number === latestNumber}
          onClick={() => onNumberClick?.(number)}
        />
      ))}
    </div>
  );
};

export default NumberGrid;