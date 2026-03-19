export interface Result {
  id?: number;
  userId: number;
  username?: string;
  quizId: number;
  quizTitle?: string;
  score: number;
  totalQuestions: number;
  completedAt?: Date;
}

export interface QuizReviewItem {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmissionResult extends Result {
  reviewItems: QuizReviewItem[];
}

export interface QuizHistoryItem {
  userId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  dateAttempted: Date;
}

export interface TopQuizAnalytics {
  quizId: number;
  quizTitle: string;
  attemptCount: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalQuizzesAttempted: number;
  averageScorePercent: number;
  mostPopularQuiz?: TopQuizAnalytics;
  quizAttempts: TopQuizAnalytics[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  dateTaken: Date;
}

export interface AnswerSubmit {
  questionId: number;
  selectedOption: string;
}

export interface QuizSubmission {
  quizId: number;
  userId: number;
  answers: AnswerSubmit[];
}
