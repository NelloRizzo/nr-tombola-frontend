import React, { memo } from 'react';
import styles from './NumberTile.module.scss';

interface NumberTileProps {
  number: number;
  isDrawn: boolean;
  isLatest?: boolean;
  onClick?: () => void;
}

const NumberTile: React.FC<NumberTileProps> = memo(({
  number,
  isDrawn,
  isLatest = false,
  onClick
}) => {
  return (
    <div
      className={`${styles.tileContainer} ${isLatest ? styles.latest : ''}`}
      onClick={onClick}
      title={`Number ${number} ${isDrawn ? 'drawn' : 'not drawn'}`}
    >
      <div className={styles.woodenCylinder}>
        <div className={`${styles.numberDisplay} ${isDrawn ? styles.drawn : ''}`}>
          {number.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
});

export default NumberTile;