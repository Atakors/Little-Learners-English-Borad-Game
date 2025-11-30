
import React, { useState, useEffect, useRef } from 'react';
import PlayerSetup from './components/PlayerSetup';
import Board from './components/Board';
import Dice from './components/Dice';
import TaskModal from './components/TaskModal';
import { Player, GameState, TileData } from './types';
import { TILES, BOARD_SIZE, PLAYER_COLORS } from './constants';
import { RefreshCcw, Wand2, Loader2, Database, Upload, Download, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerIcon } from './components/PlayerIcon';
import { generateTileImage } from './services/gemini';
import { loadImagesFromDB, saveImageToDB, exportBackup, importBackup } from './services/storage';
import { playDiceRollSound, playStepSound, playWinSound, playStartGameSound } from './services/audio';

// Helper to generate a unique signature for a tile's content
const getTileContentHash = (tile: TileData) => {
  return `${tile.id}:${tile.title}:${tile.description}:${tile.category}`;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    isRolling: false,
    isMoving: false,
    diceValue: 1,
    gameStatus: 'setup',
    currentTask: null,
    showTaskModal: false,
    winner: null
  });

  const [tileImages, setTileImages] = useState<Record<number, string>>({});
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images on mount from IndexedDB
  useEffect(() => {
    const initStorage = async () => {
        try {
            const images = await loadImagesFromDB(TILES, getTileContentHash);
            setTileImages(images);
        } catch (e) {
            console.error("Failed to load images from DB", e);
        }
    };
    initStorage();
  }, []);

  const handleStartGame = (players: Player[]) => {
    playStartGameSound();
    setGameState(prev => ({
      ...prev,
      players,
      gameStatus: 'playing'
    }));
  };

  const handleGenerateImages = async () => {
      if (isGeneratingImages) return;
      setIsGeneratingImages(true);

      // Only generate images for task tiles that don't already have a valid image in state
      const tilesToGenerate = TILES.filter(t => t.type === 'task' && !tileImages[t.id]);
      
      // Process one by one to avoid rate limits
      for (const tile of tilesToGenerate) {
          const image = await generateTileImage(tile.title, tile.description);
          if (image) {
              const hash = getTileContentHash(tile);
              
              // Update State
              setTileImages(prev => ({ ...prev, [tile.id]: image }));
              
              // Save to IndexedDB
              await saveImageToDB(tile.id, image, hash);
          }
          // Delay for API safety
          await new Promise(r => setTimeout(r, 1000));
      }
      setIsGeneratingImages(false);
  };

  const handleExportData = async () => {
      try {
          const json = await exportBackup();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `LittleLearners_Data_${new Date().toISOString().slice(0,10)}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setShowDataMenu(false);
      } catch (e) {
          alert("Failed to export data.");
          console.error(e);
      }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
          const text = ev.target?.result as string;
          if (text) {
              const success = await importBackup(text);
              if (success) {
                  // Reload images from DB
                  const images = await loadImagesFromDB(TILES, getTileContentHash);
                  setTileImages(images);
                  alert("Game data imported successfully!");
                  setShowDataMenu(false);
              } else {
                  alert("Failed to import data. Invalid format.");
              }
          }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rollDice = () => {
    if (gameState.isRolling || gameState.isMoving || gameState.showTaskModal) return;

    playDiceRollSound();
    setGameState(prev => ({ ...prev, isRolling: true }));

    // Simulate rolling time
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      
      // Stop rolling, show value
      setGameState(prev => ({
        ...prev,
        isRolling: false,
        diceValue: roll,
      }));
      
      // WAIT 2 seconds for the user to see the dice result clearly, then start moving
      setTimeout(() => {
        setGameState(prev => ({ ...prev, isMoving: true }));
        animateMove(roll);
      }, 2000);

    }, 1200);
  };

  const animateMove = (steps: number) => {
      const currentPlayerIndex = gameState.currentPlayerIndex;
      const startPos = gameState.players[currentPlayerIndex].position;
      const targetPos = Math.min(startPos + steps, BOARD_SIZE - 1);
      
      let currentStep = 0;
      const totalSteps = targetPos - startPos;

      if (totalSteps <= 0) {
          setGameState(prev => ({ ...prev, isMoving: false }));
          return;
      }

      const interval = setInterval(() => {
          playStepSound();
          currentStep++;
          const nextPos = startPos + currentStep;

          setGameState(prev => {
              const updatedPlayers = [...prev.players];
              updatedPlayers[currentPlayerIndex] = {
                  ...updatedPlayers[currentPlayerIndex],
                  position: nextPos
              };
              return { ...prev, players: updatedPlayers };
          });

          if (nextPos >= targetPos) {
              clearInterval(interval);
              setTimeout(() => {
                  handleMoveEnd(targetPos);
              }, 600);
          }
      }, 400); 
  };

  const handleMoveEnd = (finalPosition: number) => {
      if (finalPosition === BOARD_SIZE - 1) {
          const winner = gameState.players[gameState.currentPlayerIndex];
          handleWin(winner);
          return;
      }

      const landedTileId = finalPosition + 1;
      const landedTile = TILES.find(t => t.id === landedTileId);
      const shouldShowTask = landedTile && landedTile.type === 'task';

      setGameState(prev => ({
        ...prev,
        isMoving: false,
        currentTask: shouldShowTask ? landedTile : null,
        showTaskModal: shouldShowTask || false,
      }));
  };

  const handleTaskComplete = () => {
    setGameState(prev => {
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        return {
            ...prev,
            showTaskModal: false,
            currentTask: null,
            currentPlayerIndex: nextPlayerIndex,
        };
    });
  };

  const handleWin = (player: Player) => {
    playWinSound();
    setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: player,
        isMoving: false
    }));
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
  };
  
  const resetGame = () => {
      setGameState({
        players: [],
        currentPlayerIndex: 0,
        isRolling: false,
        isMoving: false,
        diceValue: 1,
        gameStatus: 'setup',
        currentTask: null,
        showTaskModal: false,
        winner: null
      });
  };

  if (gameState.gameStatus === 'setup') {
    return <PlayerSetup onStartGame={handleStartGame} />;
  }

  if (gameState.gameStatus === 'finished' && gameState.winner) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4">
              <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-in zoom-in">
                  <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${PLAYER_COLORS[gameState.winner.color]} text-white border-4 border-white shadow-lg`}>
                         <PlayerIcon icon={gameState.winner.icon} size={48} />
                      </div>
                  </div>
                  <h1 className="text-4xl font-extrabold mb-2">Winner!</h1>
                  <p className="text-xl mb-6">Congratulations <span className={`font-bold ${PLAYER_COLORS[gameState.winner.color].replace('bg-', 'text-').split(' ')[0]}`}>{gameState.winner.name}</span>!</p>
                  
                  <button 
                    onClick={resetGame}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                  >
                      <RefreshCcw /> Play Again
                  </button>
              </div>
          </div>
      );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const missingImagesCount = TILES.filter(t => t.type === 'task' && !tileImages[t.id]).length;

  return (
    <div className="min-h-screen bg-sky-50 py-4 px-2 sm:px-4 flex flex-col items-center pb-32 lg:pb-4">
      
      {/* Game Header */}
      <header className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm relative z-30">
         <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 hidden sm:block">Little Learners</h1>
            
            <div className="flex items-center gap-2">
                {/* Image Generation Button */}
                {!isGeneratingImages && missingImagesCount > 0 ? (
                    <button 
                        onClick={handleGenerateImages}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                        title="Generate watercolor illustrations for the board using AI"
                    >
                        <Wand2 size={16} /> Generate Art ({missingImagesCount})
                    </button>
                ) : isGeneratingImages ? (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-500 px-3 py-1.5">
                        <Loader2 size={16} className="animate-spin" /> Painting...
                    </div>
                ) : null}

                {/* Data / Backup Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setShowDataMenu(!showDataMenu)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                        title="Manage Game Data"
                    >
                        <Database size={16} /> Data
                    </button>
                    
                    {showDataMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 flex flex-col gap-1 animate-in slide-in-from-top-2">
                             <button 
                                onClick={handleExportData}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 rounded-lg"
                            >
                                <Download size={14} /> Backup (Save)
                            </button>
                             <button 
                                onClick={handleImportClick}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 rounded-lg"
                            >
                                <Upload size={14} /> Restore (Load)
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>
            </div>
         </div>
         
         {/* Current Player Indicator */}
         <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Turn:</span>
            <div className={`flex items-center gap-2 font-bold ${PLAYER_COLORS[currentPlayer.color].replace('bg-', 'text-').split(' ')[0]}`}>
                <PlayerIcon icon={currentPlayer.icon} />
                {currentPlayer.name}
            </div>
         </div>
      </header>

      {/* Main Game Area */}
      <div className="w-full max-w-4xl relative z-10">
          <Board players={gameState.players} tileImages={tileImages} />
          
          {/* Dice & Controls Overlay or Section */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:translate-x-0">
              <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-purple-100 flex flex-col items-center gap-4 group transition-transform">
                
                {/* Result Indicator (Only visible after rolling) */}
                {!gameState.isRolling && gameState.diceValue && (
                     <div className="absolute -top-12 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                         You rolled a {gameState.diceValue}!
                     </div>
                )}

                <div onClick={rollDice} className="cursor-pointer hover:scale-105 transition-transform">
                    <Dice value={gameState.diceValue} rolling={gameState.isRolling} />
                </div>
                <button 
                    onClick={rollDice} 
                    disabled={gameState.isRolling || gameState.isMoving || gameState.showTaskModal}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:shadow-lg transition-shadow"
                >
                    {gameState.isRolling ? 'Rolling...' : gameState.isMoving ? 'Moving...' : 'Roll Dice'}
                </button>
              </div>
          </div>
      </div>

      {/* Task Modal */}
      {gameState.showTaskModal && gameState.currentTask && (
        <TaskModal 
            task={gameState.currentTask} 
            currentPlayerName={gameState.players[gameState.currentPlayerIndex].name}
            onComplete={handleTaskComplete} 
        />
      )}

    </div>
  );
};

export default App;
