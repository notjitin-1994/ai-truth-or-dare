import React, { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Player, GameState, GameSettings, GeneratedQuestion, IntensityLevel } from '@/types/game';

const STORAGE_KEY = 'ai-truth-or-dare-game-data';

// Check if localStorage is available and working
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Get a unique ID that works across all browsers
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const defaultSettings: GameSettings = {
  intensityLevel: 'medium' as IntensityLevel,
  allowAdultContent: true,
  includeSameGenderDares: true,
  includeCrossGenderDares: true,
  categories: ['romantic', 'physical', 'revealing', 'fantasy'],
  useAI: false,
};

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  settings: defaultSettings,
  currentQuestion: null,
  questionHistory: [],
  isGameActive: false,
  round: 1,
};

function loadState(): GameState {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, using in-memory storage');
    return initialState;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        players: parsed.players || [],
        settings: { ...defaultSettings, ...parsed.settings },
        currentPlayerIndex: 0,
        currentQuestion: null,
        questionHistory: [],
        isGameActive: false,
        round: 1,
      };
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return initialState;
}

function saveState(state: GameState) {
  if (!isLocalStorageAvailable()) {
    return; // Silently skip saving if localStorage is not available
  }
  try {
    const toSave = {
      players: state.players,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // Handle quota exceeded error specifically
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, unable to save game state');
    } else {
      console.error('Failed to save game state:', e);
    }
  }
}

type GameAction =
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'SET_CURRENT_QUESTION'; payload: GeneratedQuestion | null }
  | { type: 'ADD_TO_HISTORY'; payload: GeneratedQuestion }
  | { type: 'NEXT_PLAYER' }
  | { type: 'SET_CURRENT_PLAYER'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_SAVED_STATE'; payload: GameState };

function gameReducer(state: GameState, action: GameAction): GameState {
  let newState: GameState;
  
  switch (action.type) {
    case 'ADD_PLAYER':
      newState = { ...state, players: [...state.players, action.payload] };
      break;
    case 'REMOVE_PLAYER':
      newState = { ...state, players: state.players.filter((p) => p.id !== action.payload) };
      break;
    case 'UPDATE_PLAYER':
      newState = {
        ...state,
        players: state.players.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
      break;
    case 'SET_PLAYERS':
      newState = { ...state, players: action.payload };
      break;
    case 'UPDATE_SETTINGS':
      newState = { ...state, settings: { ...state.settings, ...action.payload } };
      break;
    case 'SET_CURRENT_QUESTION':
      newState = { ...state, currentQuestion: action.payload };
      break;
    case 'ADD_TO_HISTORY':
      newState = { ...state, questionHistory: [action.payload, ...state.questionHistory] };
      break;
    case 'NEXT_PLAYER':
      newState = {
        ...state,
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      };
      break;
    case 'SET_CURRENT_PLAYER':
      newState = { ...state, currentPlayerIndex: action.payload };
      break;
    case 'START_GAME':
      newState = { ...state, isGameActive: true, currentPlayerIndex: 0, round: 1 };
      break;
    case 'END_GAME':
      newState = { ...state, isGameActive: false };
      break;
    case 'NEXT_ROUND':
      newState = { ...state, round: state.round + 1 };
      break;
    case 'RESET_GAME':
      newState = { ...initialState, players: state.players, settings: state.settings };
      break;
    case 'CLEAR_HISTORY':
      newState = { ...state, questionHistory: [] };
      break;
    case 'CLEAR_ALL_DATA':
      newState = initialState;
      break;
    case 'LOAD_SAVED_STATE':
      newState = action.payload;
      break;
    default:
      newState = state;
  }
  
  saveState(newState);
  return newState;
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (player: Player) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setCurrentQuestion: (question: GeneratedQuestion | null) => void;
  addToHistory: (question: GeneratedQuestion) => void;
  nextPlayer: () => void;
  startGame: () => void;
  endGame: () => void;
  nextRound: () => void;
  resetGame: () => void;
  clearHistory: () => void;
  clearAllData: () => void;
  getCurrentPlayer: () => Player | null;
  getRandomPlayer: (excludeId?: string) => Player | null;
  canStartGame: () => boolean;
  hasSavedData: () => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, loadState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const addPlayer = (player: Omit<Player, 'id' | 'createdAt'>) => {
    const newPlayer: Player = {
      ...player,
      id: generateId(),
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
  };

  const removePlayer = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  const updatePlayer = (player: Player) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: player });
  };

  const updateSettings = (settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const setCurrentQuestion = (question: GeneratedQuestion | null) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: question });
  };

  const addToHistory = (question: GeneratedQuestion) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: question });
  };

  const nextPlayer = () => {
    dispatch({ type: 'NEXT_PLAYER' });
  };

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const endGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  const nextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const clearAllData = () => {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    dispatch({ type: 'CLEAR_ALL_DATA' });
  };

  const getCurrentPlayer = () => {
    if (state.players.length === 0) return null;
    return state.players[state.currentPlayerIndex];
  };

  const getRandomPlayer = (excludeId?: string) => {
    const eligiblePlayers = excludeId
      ? state.players.filter((p) => p.id !== excludeId)
      : state.players;
    if (eligiblePlayers.length === 0) return null;
    return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
  };

  const canStartGame = () => {
    return state.players.length >= 2;
  };

  const hasSavedData = () => {
    return state.players.length > 0;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        addPlayer,
        removePlayer,
        updatePlayer,
        updateSettings,
        setCurrentQuestion,
        addToHistory,
        nextPlayer,
        startGame,
        endGame,
        nextRound,
        resetGame,
        clearHistory,
        clearAllData,
        getCurrentPlayer,
        getRandomPlayer,
        canStartGame,
        hasSavedData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
