export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface LiveQuestion {
  question: string;
  options: string[];
  // answer is not sent to clients
}

export interface GameState {
  gameId: string;
  hostId: string;
  players: Player[];
  currentQuestion: LiveQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  isStarted: boolean;
  isFinished: boolean;
}
