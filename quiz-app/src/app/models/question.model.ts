export interface Question {
  id?: number;
  quizId: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string; // Optional for users taking the quiz
  explanation?: string;
}
