
import React, { useState } from 'react';
import { Player, PlayerColor } from '../types';
import { PLAYER_COLORS } from '../constants';
import { Play } from 'lucide-react';
import { PlayerIcon, ICON_KEYS } from './PlayerIcon';
import { playUIHoverSound } from '../services/audio';

interface Props {
  onStartGame: (players: Player[]) => void;
}

const PlayerSetup: React.FC<Props> = ({ onStartGame }) => {
  const [count, setCount] = useState(1);
  const [names, setNames] = useState<string[]>(['Player 1']);
  const [selectedIcons, setSelectedIcons] = useState<string[]>(['user']);

  const handleCountChange = (newCount: number) => {
    playUIHoverSound();
    setCount(newCount);
    const newNames = [...names];
    const newIcons = [...selectedIcons];
    
    if (newCount > names.length) {
      for (let i = names.length; i < newCount; i++) {
        newNames.push(`Player ${i + 1}`);
        // Assign a default icon based on index to ensure variety
        newIcons.push(ICON_KEYS[i % ICON_KEYS.length]);
      }
    } else {
      newNames.splice(newCount);
      newIcons.splice(newCount);
    }
    setNames(newNames);
    setSelectedIcons(newIcons);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
  };

  const handleIconSelect = (playerIndex: number, iconKey: string) => {
    playUIHoverSound();
    const newIcons = [...selectedIcons];
    newIcons[playerIndex] = iconKey;
    setSelectedIcons(newIcons);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
    const players: Player[] = names.map((name, index) => ({
      id: index,
      name,
      color: colors[index],
      icon: selectedIcons[index],
      position: 0,
      isFinished: false
    }));
    onStartGame(players);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                Little Learners
            </h1>
            <p className="text-gray-500">English Board Game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How many players?</label>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCountChange(num)}
                  onMouseEnter={() => playUIHoverSound()}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                    count === num
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-700">Players Setup</label>
            {names.map((name, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${PLAYER_COLORS[['red', 'blue', 'green', 'yellow'][index] as PlayerColor]} border-2 border-white shadow-md flex items-center justify-center text-white`}>
                        <PlayerIcon icon={selectedIcons[index]} size={20} />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="flex-1 border-gray-300 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder={`Player ${index + 1}`}
                        required
                    />
                 </div>
                 
                 {/* Icon Selection Grid */}
                 <div className="flex flex-wrap gap-2 justify-center sm:justify-start pl-2">
                     {ICON_KEYS.map((iconKey) => (
                         <button
                            key={iconKey}
                            type="button"
                            onClick={() => handleIconSelect(index, iconKey)}
                            onMouseEnter={() => playUIHoverSound()}
                            className={`p-2 rounded-lg transition-all ${
                                selectedIcons[index] === iconKey 
                                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500 scale-110' 
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                         >
                             <PlayerIcon icon={iconKey} size={18} />
                         </button>
                     ))}
                 </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            onMouseEnter={() => playUIHoverSound()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerSetup;
