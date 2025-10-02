import { useState } from 'react';
import { GameState } from './gameState';

// This is a mock hook. In a real app, this would use WebSockets,
// Firebase, or another real-time service.
export const useGameState = (gameId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock effect to simulate fetching initial state
  useState(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Mock data
      setGameState({
        gameId: gameId,
        hostId: 'host123',
        players: [],
        currentQuestion: null,
        questionNumber: 0,
        totalQuestions: 0,
        isStarted: false,
        isFinished: false,
      });
      setIsLoading(false);
    }, 1000);
  });

  const updateGameState = (newState: Partial<GameState>) => {
    setGameState(prev => prev ? { ...prev, ...newState } : null);
  };

  return { gameState, updateGameState, isLoading, error };
};
