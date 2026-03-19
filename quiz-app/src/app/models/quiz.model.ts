import { Question } from './question.model';

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  /** Duration in minutes for the countdown timer */
  duration?: number;
  questions?: Question[];
}
