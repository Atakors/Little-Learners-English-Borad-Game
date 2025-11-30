
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  icon: string;
  position: number; // 0 to 19
  isFinished: boolean;
}

export type TileType = 'start' | 'finish' | 'task';

export type TaskCategory = 'speaking' | 'vocabulary' | 'grammar' | 'writing' | 'roleplay' | 'general';

export interface TileData {
  id: number;
  title: string;
  description: string;
  type: TileType;
  category: TaskCategory;
  content?: string[]; // For lists like pronunciation words
  prompt?: string; // System instruction for AI
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isRolling: boolean;
  isMoving: boolean;
  diceValue: number | null;
  gameStatus: 'setup' | 'playing' | 'finished';
  currentTask: TileData | null;
  showTaskModal: boolean;
  winner: Player | null;
}