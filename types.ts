// FIX: Define all necessary types for the application.
export interface Student {
  id: string;
  name: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
}

export interface Question {
  questionText: string;
  questionType: 'multiple-choice' | 'theory';
  options?: string[]; // Only for multiple-choice
  correctAnswer: string; // For MCQs, the correct option. For theory, the ideal answer.
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Answer {
  questionText: string;
  questionType: 'multiple-choice' | 'theory';
  selectedAnswer: string;
  correctAnswer: string; // The ideal/correct answer
  isCorrect: boolean;
  feedback?: string; // Optional feedback, especially for theory
}

export interface QuizResult {
  student: Student;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  answers: Answer[];
  feedback: string;
}