import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h2 class="page-title gradient-heading">Available Quizzes</h2>
        <p class="page-sub">Choose a quiz and test your knowledge</p>
      </div>

      <div class="filters">
        <select [(ngModel)]="selectedCategory" (change)="loadQuizzes()" class="filter-select">
          <option value="">All Categories</option>
          <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
        </select>

        <select [(ngModel)]="selectedDifficulty" (change)="loadQuizzes()" class="filter-select">
          <option value="">All Difficulties</option>
          <option *ngFor="let difficulty of difficulties" [value]="difficulty">{{ difficulty }}</option>
        </select>

        <button class="clear-btn" *ngIf="selectedCategory || selectedDifficulty" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let item of [1,2,3,4,5,6]">
            <div class="skeleton title"></div>
            <div class="skeleton line"></div>
            <div class="skeleton line short"></div>
            <div class="skeleton badge"></div>
            <div class="skeleton btn"></div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>

      <div class="quiz-grid" *ngIf="!loading && quizzes.length > 0">
        <div class="quiz-card" *ngFor="let quiz of quizzes; let i = index"
             [ngClass]="categoryClass(quiz.category)"
             [style.animation-delay]="i * 0.1 + 's'">
          <div class="card-body">
            <h3>{{ quiz.title }}</h3>
            <p>{{ quiz.description }}</p>
            <div class="meta-row">
              <span class="meta-pill">{{ quiz.category }}</span>
              <span class="meta-pill difficulty" [ngClass]="difficultyClass(quiz.difficulty)">{{ quiz.difficulty }}</span>
            </div>
          </div>
          <button (click)="startQuiz(quiz.id!)" class="btn-start" [disabled]="!quiz.isActive">
            {{ quiz.isActive ? 'Start Quiz →' : 'Inactive' }}
          </button>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && quizzes.length === 0">
        <p>No quizzes available at the moment.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px;
      animation: fadeSlideUp 0.5s ease both;
    }
    .page-header { margin-bottom: 40px; }
    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .page-sub { color: var(--text-muted); font-size: 1rem; }
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filter-select {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
      color: #fff;
      min-width: 180px;
      outline: none;
    }
    .filter-select option {
      background: #0f172a;
      color: #fff;
    }
    .clear-btn {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
    }
    .clear-btn:hover {
      color: #fff;
      border-color: rgba(255,255,255,0.4);
    }
    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .quiz-card {
      position: relative;
      overflow: hidden;
      background: #0f1629;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: fadeSlideUp 0.5s ease both;
    }
    .quiz-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6c63ff, #00d4aa);
    }
    .quiz-card.cat-programming::before {
      background: linear-gradient(90deg, #6c63ff, #8b80ff);
    }
    .quiz-card.cat-math::before {
      background: linear-gradient(90deg, #00d4aa, #2dd4bf);
    }
    .quiz-card.cat-science::before {
      background: linear-gradient(90deg, #5d6dff, #38bdf8);
    }
    .quiz-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(108,99,255,0.12);
    }
    .card-body h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .card-body p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .meta-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .meta-pill {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(79,142,247,0.15);
      color: #93c5fd;
      border: 1px solid rgba(79,142,247,0.3);
    }
    .meta-pill.difficulty {
      color: #fff;
      border: none;
    }
    .meta-pill.diff-easy {
      background: linear-gradient(135deg, #14b8a6, #2dd4bf);
    }
    .meta-pill.diff-medium {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      color: #2d1b00;
    }
    .meta-pill.diff-hard {
      background: linear-gradient(135deg, #fb7185, #ff8b6b);
    }
    .btn-start {
      padding: 11px 22px;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      align-self: flex-start;
      transition: all 0.2s ease;
    }
    .btn-start:hover:not(:disabled) { transform: scale(1.02) translateY(-2px); filter: brightness(1.1); }
    .btn-start:disabled { background: rgba(255,255,255,0.1); color: var(--text-muted); cursor: not-allowed; }
    .loading-state { padding: 10px 0 30px; }
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .skeleton-card {
      background: rgba(15, 22, 41, 0.75);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 220px;
    }
    .skeleton.title { height: 20px; width: 68%; }
    .skeleton.line { height: 13px; width: 100%; }
    .skeleton.line.short { width: 72%; }
    .skeleton.badge { height: 22px; width: 42%; border-radius: 999px; margin-top: 10px; }
    .skeleton.btn { height: 40px; width: 46%; border-radius: 999px; margin-top: auto; }
    .error-msg {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;
  error = '';
  categories: string[] = ['Programming', 'Math', 'Science'];
  difficulties: string[] = ['Easy', 'Medium', 'Hard'];
  selectedCategory = '';
  selectedDifficulty = '';

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit() {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.loading = true;
    this.quizService.getAllQuizzes(this.selectedCategory || undefined, this.selectedDifficulty || undefined).subscribe({
      next: (data) => {
        this.quizzes = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load quizzes.';
        this.loading = false;
      }
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.selectedDifficulty = '';
    this.loadQuizzes();
  }

  startQuiz(id: number) {
    this.router.navigate(['/quiz-player', id]);
  }

  categoryClass(category: string): string {
    const key = category.toLowerCase();
    if (key.includes('program')) {
      return 'cat-programming';
    }
    if (key.includes('math')) {
      return 'cat-math';
    }
    if (key.includes('science')) {
      return 'cat-science';
    }
    return '';
  }

  difficultyClass(difficulty: string): string {
    const key = difficulty.toLowerCase();
    if (key === 'easy') {
      return 'diff-easy';
    }
    if (key === 'medium') {
      return 'diff-medium';
    }
    if (key === 'hard') {
      return 'diff-hard';
    }
    return '';
  }
}
