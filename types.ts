export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type StudyMode = 'browse' | 'exam';

export interface StudyStats {
  mastered: string[]; // array of card IDs
  currentStreak: number;
}