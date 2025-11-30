import React from 'react';
import { TILES } from '../constants';
import Tile from './Tile';
import { Player } from '../types';

interface Props {
  players: Player[];
  tileImages: Record<number, string>;
}

const Board: React.FC<Props> = ({ players, tileImages }) => {
  // We need to render tiles in snake order to visually match the movement
  // Row 1: 0, 1, 2, 3
  // Row 2: 7, 6, 5, 4
  // Row 3: 8, 9, 10, 11
  // Row 4: 15, 14, 13, 12
  // Row 5: 16, 17, 18, 19
  
  // Note: Tile IDs in TILES array are 1-based (1..20), so index is id-1.
  
  const getOrderedTiles = () => {
    const rows = 5;
    const cols = 4;
    const ordered = [];
    
    for (let r = 0; r < rows; r++) {
      const rowTiles = [];
      for (let c = 0; c < cols; c++) {
        // Linear index if grid was standard LTR
        const linearIdx = r * cols + c;
        rowTiles.push(TILES[linearIdx]);
      }
      
      // If row is odd (1, 3...), reverse it
      if (r % 2 !== 0) {
        rowTiles.reverse();
      }
      ordered.push(...rowTiles);
    }
    return ordered;
  };

  const orderedTiles = getOrderedTiles();

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl">
      {orderedTiles.map((tile, idx) => (
        <Tile 
          key={tile.id} 
          tile={tile} 
          index={idx}
          playersOnTile={players.filter(p => p.position === (tile.id - 1))} // Tiles are 1-based ID, position is 0-based index
          imageUrl={tileImages[tile.id]}
        />
      ))}
    </div>
  );
};

export default Board;