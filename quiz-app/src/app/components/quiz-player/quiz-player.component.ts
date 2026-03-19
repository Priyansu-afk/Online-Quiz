import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { QuestionService } from '../../services/question.service';
import { ResultService } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';
import { Quiz } from '../../models/quiz.model';
import { Question } from '../../models/question.model';
import { QuizSubmission, AnswerSubmit } from '../../models/result.model';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap" *ngIf="quiz">
      <div class="quiz-header">
        <h2>{{ quiz.title }}</h2>
        <p class="desc">{{ quiz.description }}</p>
      </div>

      <!-- Countdown Timer -->
      <div class="timer-bar" *ngIf="!loading && questions.length > 0">
        <div class="timer-display" [class.timer-warning]="timeLeft <= 60" [class.timer-danger]="timeLeft <= 30">
          <span class="timer-icon">⏱</span>
          <span class="timer-value">{{ formattedTime }}</span>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading questions...</p>
      </div>

      <div *ngIf="!loading && questions.length > 0" class="quiz-body">
        <div class="progress-header">
          <span class="progress-label">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
          <span class="progress-pct">{{ ((currentIndex + 1) / questions.length * 100) | number:'1.0-0' }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="(currentIndex + 1) / questions.length * 100"></div>
        </div>

        <div class="question-card">
          <p class="question-text">{{ currentQuestion.text }}</p>
          <div class="options">
            <label class="option-label" [class.selected]="selectedKey === 'A'">
              <input type="radio" name="option" [value]="currentQuestion.optionA" [(ngModel)]="selectedOption" hidden>
              <span class="opt-key">A</span>
              <span class="opt-text">{{ currentQuestion.optionA }}</span>
            </label>
            <label class="option-label" [class.selected]="selectedKey === 'B'">
              <input type="radio" name="option" [value]="currentQuestion.optionB" [(ngModel)]="selectedOption" hidden>
              <span class="opt-key">B</span>
              <span class="opt-text">{{ currentQuestion.optionB }}</span>
            </label>
            <label class="option-label" [class.selected]="selectedKey === 'C'">
              <input type="radio" name="option" [value]="currentQuestion.optionC" [(ngModel)]="selectedOption" hidden>
              <span class="opt-key">C</span>
              <span class="opt-text">{{ currentQuestion.optionC }}</span>
            </label>
            <label class="option-label" [class.selected]="selectedKey === 'D'">
              <input type="radio" name="option" [value]="currentQuestion.optionD" [(ngModel)]="selectedOption" hidden>
              <span class="opt-key">D</span>
              <span class="opt-text">{{ currentQuestion.optionD }}</span>
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-prev" *ngIf="currentIndex > 0" (click)="prev()">← Previous</button>
          <div style="flex:1"></div>
          <button class="btn-next" *ngIf="currentIndex < questions.length - 1" (click)="next()" [disabled]="!selectedOption">Next →</button>
          <button class="btn-submit" *ngIf="currentIndex === questions.length - 1" (click)="submit()" [disabled]="!selectedOption || submitting">
            {{ submitting ? 'Submitting...' : 'Submit Quiz ✓' }}
          </button>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && questions.length === 0">
        <p>This quiz has no questions yet.</p>
        <a routerLink="/" class="btn-next">Go Back</a>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 48px 24px;
      animation: fadeSlideUp 0.5s ease both;
    }
    .quiz-header { margin-bottom: 16px; }
    .quiz-header h2 {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
    }
    .desc { color: var(--text-muted); font-size: 0.95rem; }

    /* ── Timer ── */
    .timer-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .timer-display {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 50px;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 1px;
      transition: all 0.3s ease;
    }
    .timer-display.timer-warning {
      border-color: rgba(251,191,36,0.6);
      background: rgba(251,191,36,0.08);
      color: #fbbf24;
    }
    .timer-display.timer-danger {
      border-color: rgba(239,68,68,0.6);
      background: rgba(239,68,68,0.1);
      color: #f87171;
      animation: timerPulse 1s ease infinite;
    }
    @keyframes timerPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .timer-icon { font-size: 1rem; }

    /* ── Progress ── */
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .progress-label {
      color: var(--accent-blue);
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
    }
    .progress-pct { color: var(--text-muted); font-size: 0.85rem; }
    .progress-track {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      margin-bottom: 28px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-green));
      border-radius: 2px;
      transition: width 0.4s ease;
    }

    /* ── Question card ── */
    .question-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      margin-bottom: 24px;
    }
    .question-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: #fff;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .options { display: flex; flex-direction: column; gap: 10px; }
    .option-label {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .option-label:hover {
      border-color: var(--accent-blue);
      background: rgba(79,142,247,0.08);
    }
    .option-label.selected {
      border-color: var(--accent-blue);
      background: rgba(79,142,247,0.12);
    }
    .opt-key {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .option-label.selected .opt-key {
      background: var(--accent-blue);
      color: #fff;
    }
    .opt-text { color: #fff; font-size: 0.95rem; }
    .actions { display: flex; align-items: center; gap: 12px; }
    .btn-prev {
      padding: 11px 22px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted);
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-prev:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
    .btn-next, .btn-submit {
      padding: 11px 26px;
      background: linear-gradient(135deg, var(--accent-blue), #6366f1);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-submit { background: linear-gradient(135deg, var(--accent-green), #16a34a); }
    .btn-next:hover:not(:disabled), .btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
    .btn-next:disabled, .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: var(--text-muted); }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  quizId!: number;
  quiz?: Quiz;
  questions: Question[] = [];

  currentIndex = 0;
  answers: { [questionId: number]: string } = {};
  selectedOption = '';

  loading = true;
  submitting = false;

  // ── Timer state ──
  timeLeft = 0;          // seconds remaining
  private timerSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private questionService: QuestionService,
    private resultService: ResultService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));

    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.questionService.getRandomizedQuestionsByQuizId(this.quizId).subscribe({
          next: (questions) => {
            this.questions = questions;
            this.loading = false;
            this.loadCurrentAnswer();
            this.startTimer();   // ← start timer once questions are loaded
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  /** Cleanup timer subscription to prevent memory leaks. */
  ngOnDestroy() {
    this.stopTimer();
  }

  // ── Timer helpers ──

  /** Returns time left formatted as mm:ss. */
  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private startTimer() {
    const durationMinutes = this.quiz?.duration ?? 10;
    this.timeLeft = durationMinutes * 60;

    // Tick every second using RxJS interval
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.stopTimer();
        // Auto-submit when time runs out
        this.submit(true);
      }
    });
  }

  private stopTimer() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
  }

  // ── Navigation ──

  get currentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  get selectedKey(): 'A' | 'B' | 'C' | 'D' | '' {
    if (!this.currentQuestion) {
      return '';
    }

    if (this.selectedOption === this.currentQuestion.optionA) {
      return 'A';
    }

    if (this.selectedOption === this.currentQuestion.optionB) {
      return 'B';
    }

    if (this.selectedOption === this.currentQuestion.optionC) {
      return 'C';
    }

    if (this.selectedOption === this.currentQuestion.optionD) {
      return 'D';
    }

    return '';
  }

  next() {
    this.saveCurrentAnswer();
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.loadCurrentAnswer();
    }
  }

  prev() {
    this.saveCurrentAnswer();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadCurrentAnswer();
    }
  }

  saveCurrentAnswer() {
    if (this.selectedOption && this.currentQuestion?.id) {
      this.answers[this.currentQuestion.id!] = this.selectedOption;
    }
  }

  loadCurrentAnswer() {
    if (!this.currentQuestion?.id) {
      this.selectedOption = '';
      return;
    }

    this.selectedOption = this.answers[this.currentQuestion.id] || '';
  }

  // ── Submission ──

  /** @param autoSubmit - true when called from the timer expiry */
  submit(autoSubmit = false) {
    this.stopTimer();   // stop timer whether manual or auto submit
    this.saveCurrentAnswer();
    this.submitting = true;

    const formattedAnswers: AnswerSubmit[] = Object.keys(this.answers).map(qId => ({
      questionId: Number(qId),
      selectedOption: this.answers[Number(qId)]
    }));

    const user = this.authService.currentUserValue;
    if (!user || !user.token) {
      console.error('No user or token found');
      alert('Error: Not authenticated. Please log in again.');
      this.submitting = false;
      return;
    }

    let userId = 0;
    try {
      const tokenParts = user.token.split('.');
      if (tokenParts.length !== 3) throw new Error('Invalid token format');
      const payload = JSON.parse(atob(tokenParts[1]));
      userId = parseInt(payload.nameid, 10);
      if (isNaN(userId)) throw new Error('Invalid userId in token');
    } catch (err) {
      console.error('Error extracting userId from token:', err);
      alert('Error: Cannot extract user information from token.');
      this.submitting = false;
      return;
    }

    const submission: QuizSubmission = {
      quizId: this.quizId,
      userId,
      answers: formattedAnswers
    };

    this.resultService.submitQuiz(submission).subscribe({
      next: (res) => {
        this.router.navigate(['/result', res.id], { state: { result: res } });
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        const msg = error?.error?.error || error?.error?.details || error?.message || error?.statusText || 'Unknown error';
        alert(`Quiz submission failed: ${msg}`);
        this.submitting = false;
        this.startTimer(); // resume timer if submission failed
      }
    });
  }
}

