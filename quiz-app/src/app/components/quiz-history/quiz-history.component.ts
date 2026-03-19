import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultService } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';
import { QuizHistoryItem } from '../../models/result.model';

@Component({
  selector: 'app-quiz-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h2 class="page-title gradient-heading">Quiz History</h2>
        <p class="page-sub">Every attempt you have made</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="history-card skeleton" *ngFor="let i of [1,2,3]"></div>
      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>

      <div class="history-list" *ngIf="!loading && history.length > 0">
        <article class="history-card" *ngFor="let row of history; let i = index" [style.animation-delay]="i * 0.08 + 's'">
          <div class="ring-wrap">
            <svg viewBox="0 0 90 90" class="score-ring" aria-hidden="true">
              <circle cx="45" cy="45" r="38" class="ring-bg"></circle>
              <circle cx="45" cy="45" r="38" class="ring-fill" [style.stroke-dashoffset]="dashOffset(row)"></circle>
            </svg>
            <span class="ring-value">{{ getPct(row) | number:'1.0-0' }}%</span>
          </div>

          <div class="card-info">
            <h3>{{ row.quizTitle }}</h3>
            <p>Score {{ row.score }}/{{ row.totalQuestions }} • {{ row.dateAttempted | date:'medium' }}</p>
          </div>

          <span class="status-badge" [ngClass]="statusClass(row)">{{ statusLabel(row) }}</span>
        </article>
      </div>

      <div class="empty-state" *ngIf="!loading && history.length === 0">
        <svg class="empty-illu" viewBox="0 0 220 160" aria-hidden="true">
          <rect x="34" y="30" width="152" height="100" rx="16" fill="rgba(108,99,255,0.18)"></rect>
          <rect x="56" y="52" width="108" height="12" rx="6" fill="rgba(255,255,255,0.22)"></rect>
          <rect x="56" y="76" width="70" height="10" rx="5" fill="rgba(0,212,170,0.35)"></rect>
          <circle cx="154" cy="96" r="18" fill="rgba(255,255,255,0.2)"></circle>
          <path d="M146 96h16" stroke="#fff" stroke-width="2" stroke-linecap="round"></path>
          <path d="M154 88v16" stroke="#fff" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        <p>No quiz attempts yet.</p>
        <a class="empty-link" routerLink="/">Take a quiz</a>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { max-width: 960px; margin: 0 auto; padding: 48px 24px; animation: fadeSlideIn .45s ease both; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 2rem; font-weight: 800; margin-bottom: 6px; }
    .page-sub { color: var(--text-muted); }

    .history-list { display: grid; gap: 14px; }

    .history-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(15, 22, 41, 0.82);
      animation: fadeSlideIn .45s ease both;
    }

    .ring-wrap { position: relative; width: 82px; height: 82px; flex-shrink: 0; }
    .score-ring { width: 82px; height: 82px; transform: rotate(-90deg); }
    .ring-bg, .ring-fill { fill: none; stroke-width: 8; }
    .ring-bg { stroke: rgba(255,255,255,0.1); }
    .ring-fill {
      stroke: #6c63ff;
      stroke-linecap: round;
      stroke-dasharray: 239;
      stroke-dashoffset: 239;
      transition: stroke-dashoffset .7s ease;
      animation: ringIntro .7s ease both;
    }
    .ring-value {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .card-info { flex: 1; }
    .card-info h3 { font-size: 1.05rem; color: #fff; margin-bottom: 4px; }
    .card-info p { color: var(--text-muted); font-size: 0.88rem; }

    .status-badge {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid transparent;
      flex-shrink: 0;
    }
    .status-strong { color: #34d399; background: rgba(16, 185, 129, 0.14); border-color: rgba(16, 185, 129, 0.3); }
    .status-average { color: #fbbf24; background: rgba(251, 191, 36, 0.16); border-color: rgba(251, 191, 36, 0.28); }
    .status-needs { color: #fb7185; background: rgba(251, 113, 133, 0.14); border-color: rgba(251, 113, 133, 0.3); }

    .loading-state { display: grid; gap: 14px; padding: 6px 0; }
    .loading-state .history-card { min-height: 108px; }

    .empty-state {
      text-align: center;
      color: var(--text-muted);
      padding: 36px 20px;
      border: 1px dashed rgba(255,255,255,0.12);
      border-radius: 18px;
      background: rgba(255,255,255,0.02);
    }
    .empty-illu {
      width: 180px;
      margin-bottom: 10px;
      animation: floatY 2s ease-in-out infinite alternate;
    }
    .empty-link {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      text-decoration: none;
      color: #fff;
      background: var(--accent-gradient);
    }

    .error-msg { color: #f87171; padding: 18px 0; }

    @keyframes ringIntro { from { opacity: .2; } to { opacity: 1; } }
    @keyframes floatY { from { transform: translateY(0); } to { transform: translateY(-7px); } }

    @media (max-width: 700px) {
      .history-card { flex-wrap: wrap; }
      .status-badge { margin-left: 98px; }
    }
  `]
})
export class QuizHistoryComponent implements OnInit {
  history: QuizHistoryItem[] = [];
  loading = true;
  error = '';

  constructor(
    private resultService: ResultService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user?.token) {
      this.error = 'You must be logged in to view history.';
      this.loading = false;
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
      const userId = Number(tokenPayload.nameid);

      this.resultService.getQuizHistory(userId).subscribe({
        next: (history) => {
          this.history = history;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load quiz history.';
          this.loading = false;
        }
      });
    } catch {
      this.error = 'Invalid user session.';
      this.loading = false;
    }
  }

  getPct(item: QuizHistoryItem): number {
    if (!item.totalQuestions) {
      return 0;
    }

    return (item.score / item.totalQuestions) * 100;
  }

  dashOffset(item: QuizHistoryItem): string {
    const pct = this.getPct(item);
    const circumference = 239;
    const offset = circumference - (Math.max(0, Math.min(100, pct)) / 100) * circumference;
    return String(offset);
  }

  statusClass(item: QuizHistoryItem): string {
    const pct = this.getPct(item);
    if (pct >= 75) {
      return 'status-strong';
    }
    if (pct >= 45) {
      return 'status-average';
    }
    return 'status-needs';
  }

  statusLabel(item: QuizHistoryItem): string {
    const pct = this.getPct(item);
    if (pct >= 75) {
      return 'Excellent';
    }
    if (pct >= 45) {
      return 'Good';
    }
    return 'Needs Practice';
  }
}
