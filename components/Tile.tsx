
import React from 'react';
import { TileData, Player } from '../types';
import { PLAYER_COLORS } from '../constants';
import { Star, Flag, MessageCircle, PenTool, Mic, ArrowRight, ArrowLeft, ArrowDown } from 'lucide-react';
import { PlayerIcon } from './PlayerIcon';

interface Props {
  tile: TileData;
  playersOnTile: Player[];
  index: number;
  imageUrl?: string;
}

const Tile: React.FC<Props> = ({ tile, playersOnTile, imageUrl }) => {
  // Determine color/icon based on category
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'speaking': return { bg: 'bg-orange-50', border: 'border-orange-200', icon: <Mic className="text-orange-500" size={14} /> };
      case 'vocabulary': return { bg: 'bg-green-50', border: 'border-green-200', icon: <Flag className="text-green-500" size={14} /> };
      case 'grammar': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: <PenTool className="text-blue-500" size={14} /> };
      case 'writing': return { bg: 'bg-purple-50', border: 'border-purple-200', icon: <PenTool className="text-purple-500" size={14} /> };
      case 'roleplay': return { bg: 'bg-pink-50', border: 'border-pink-200', icon: <MessageCircle className="text-pink-500" size={14} /> };
      default: return { bg: 'bg-white', border: 'border-gray-200', icon: <Star className="text-yellow-500" size={14} /> };
    }
  };

  const { bg, border, icon } = getCategoryStyles(tile.category);
  
  // Special styling for Start/Finish
  const isStart = tile.type === 'start';
  const isFinish = tile.type === 'finish';
  
  const containerClass = isStart ? 'bg-red-500 text-white border-red-600' : 
                         isFinish ? 'bg-indigo-600 text-white border-indigo-700' : 
                         `${bg} ${border} text-gray-800`;

  // Arrow Logic for Itinerary
  const getArrow = (id: number) => {
    if (id === 20) return null; // Finish has no arrow

    const isLastInRow = id % 4 === 0;
    const currentRow = Math.ceil(id / 4);

    // Arrow Style
    const arrowContainerClass = "absolute z-20 bg-white border border-gray-200 rounded-full p-1 shadow-md text-purple-600 pointer-events-none";

    if (isLastInRow) {
        // End of row, point down
        return (
            <div className={`${arrowContainerClass} -bottom-4 left-1/2 -translate-x-1/2`}>
                <ArrowDown size={14} strokeWidth={3} />
            </div>
        );
    }
    
    if (currentRow % 2 === 0) {
        // Even row: 5, 6, 7 -> Left
        return (
            <div className={`${arrowContainerClass} top-1/2 -left-4 -translate-y-1/2`}>
                <ArrowLeft size={14} strokeWidth={3} />
            </div>
        );
    } else {
        // Odd row: 1, 2, 3 -> Right
        return (
            <div className={`${arrowContainerClass} top-1/2 -right-4 -translate-y-1/2`}>
                <ArrowRight size={14} strokeWidth={3} />
            </div>
        );
    }
  };

  return (
    // Outer wrapper handles positioning, hover scale, but NOT clipping
    // This allows arrows to exist outside the box borders
    <div className={`relative w-full h-28 sm:h-36 transition-transform hover:scale-[1.02] hover:z-30 group`}>
        
        {/* Direction Arrow */}
        {getArrow(tile.id)}

        {/* Inner Container: Handles Content, Borders, Background, Clipping */}
        <div className={`w-full h-full rounded-xl shadow-sm border-2 overflow-hidden flex flex-col hover:shadow-md ${containerClass}`}>
            
            {/* Background Image Layer */}
            {imageUrl && !isStart && !isFinish && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={imageUrl} 
                        alt={tile.title} 
                        className="w-full h-full object-cover opacity-90" 
                    />
                </div>
            )}

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full w-full">
                
                {/* Header / Title Section */}
                <div className={`flex flex-col items-center justify-center p-1 w-full ${imageUrl && !isStart && !isFinish ? 'bg-white/85 backdrop-blur-sm border-b border-gray-100' : ''}`}>
                    <div className="flex items-center gap-1">
                        {!isStart && !isFinish && (
                            <span className={`text-[10px] font-bold opacity-70 ${imageUrl ? 'text-gray-600' : ''}`}>{tile.id}</span>
                        )}
                        <div className="scale-90">
                            {isStart ? <PlayIcon /> : isFinish ? <TrophyIcon /> : icon}
                        </div>
                    </div>
                    <h3 className={`font-bold leading-tight text-center px-1 ${isStart || isFinish ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} ${imageUrl ? 'text-gray-900' : ''}`}>
                        {tile.title}
                    </h3>
                </div>

                {/* Middle / Description Section */}
                <div className="flex-1 flex items-center justify-center p-1">
                    {!imageUrl && !isStart && !isFinish && (
                        <p className="text-[10px] opacity-70 text-center line-clamp-3">
                            {tile.description}
                        </p>
                    )}
                </div>

                {/* Players Section (Bottom) */}
                <div className={`h-8 w-full flex items-center justify-center gap-1 ${imageUrl && !isStart && !isFinish ? 'bg-white/60 backdrop-blur-sm' : ''}`}>
                    {playersOnTile.map(player => (
                        <div 
                            key={player.id} 
                            className={`w-6 h-6 rounded-full border border-white shadow-sm flex items-center justify-center text-white ${PLAYER_COLORS[player.color].split(' ')[0]}`}
                            title={player.name}
                        >
                            <PlayerIcon icon={player.icon} size={12} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

export default Tile;
