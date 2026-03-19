import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResultService } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';
import { Result, QuizSubmissionResult } from '../../models/result.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-wrap">
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading results...</p>
      </div>

      <!-- Single result after quiz -->
      <div class="result-card" *ngIf="!loading && resultId && currentResult">
        <h2 class="result-title">Quiz Results</h2>
        <p class="quiz-name">{{ currentResult.quizTitle }}</p>

        <div class="score-ring-wrap">
          <div class="score-ring" [style.background]="getConicGradient()">
            <div class="score-inner">
              <span class="score-fraction">{{ currentResult.score }}/{{ currentResult.totalQuestions }}</span>
            </div>
          </div>
        </div>

        <p class="score-pct" [class.bad]="getPct() < 40" [class.ok]="getPct() >= 40 && getPct() < 70" [class.good]="getPct() >= 70">
          {{ getPct() | number:'1.0-1' }}%
        </p>
        <p class="score-label">{{ getLabel() }}</p>

        <div class="cert-banner" *ngIf="getPct() > 80">
          <span class="cert-icon">🏆</span>
          <span>You scored above 80% — you qualify for a certificate!</span>
          <button class="btn-cert" (click)="downloadCertificate()" [disabled]="certLoading">
            <span *ngIf="!certLoading">⬇ Download Certificate</span>
            <span *ngIf="certLoading">Generating…</span>
          </button>
        </div>

        <button class="btn-back" routerLink="/">← Back to Quizzes</button>
      </div>

      <div class="review-wrap" *ngIf="!loading && resultId && reviewItems.length > 0">
        <h3 class="review-title">Review Answers</h3>
        <div class="review-item" *ngFor="let item of reviewItems">
          <p class="review-question">{{ item.questionText }}</p>
          <p class="review-line">
            Your answer:
            <span [class.bad]="!item.isCorrect" [class.good]="item.isCorrect">
              {{ item.userAnswer || 'Not answered' }}
            </span>
          </p>
          <p class="review-line">Correct answer: <span class="good">{{ item.correctAnswer }}</span></p>
          <p class="review-explanation" *ngIf="item.explanation">Explanation: {{ item.explanation }}</p>
        </div>
      </div>

      <!-- Fallback if result not found -->
      <div class="result-card" *ngIf="!loading && resultId && !currentResult" style="text-align:center">
        <p style="color:var(--text-muted)">Could not load result. <a routerLink="/" style="color:var(--accent-blue)">Back to Quizzes</a></p>
      </div>

      <!-- All results history -->
      <div *ngIf="!loading && !resultId" class="history-wrap">
        <div class="page-header">
          <h2 class="page-title">My Results</h2>
          <p class="page-sub">Your quiz history</p>
        </div>

        <div *ngIf="allResults.length > 0" class="results-table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of allResults">
                <td>{{ res.quizTitle }}</td>
                <td>{{ res.score }} / {{ res.totalQuestions }}</td>
                <td>
                  <span class="pct-badge"
                    [class.bad]="(res.score/res.totalQuestions)*100 < 40"
                    [class.ok]="(res.score/res.totalQuestions)*100 >= 40 && (res.score/res.totalQuestions)*100 < 70"
                    [class.good]="(res.score/res.totalQuestions)*100 >= 70">
                    {{ (res.score / res.totalQuestions) * 100 | number:'1.0-1' }}%
                  </span>
                </td>
                <td class="muted">{{ res.completedAt | date:'mediumDate' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="allResults.length === 0">
          <p>You haven't taken any quizzes yet.</p>
        </div>
        <button class="btn-back" routerLink="/" style="margin-top:24px">Take a Quiz →</button>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      max-width: 600px;
      margin: 0 auto;
      padding: 48px 24px;
      animation: fadeSlideUp 0.5s ease both;
    }
    .result-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      text-align: center;
    }
    .review-wrap {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .review-title {
      color: #fff;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .review-item {
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 14px 16px;
      text-align: left;
    }
    .review-question {
      color: #fff;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .review-line {
      color: var(--text-muted);
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
    .review-explanation {
      color: #cbd5e1;
      margin-top: 8px;
      font-size: 0.85rem;
    }
    .bad { color: #f87171; font-weight: 600; }
    .good { color: #22c55e; font-weight: 600; }
    .result-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-blue), #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 6px;
    }
    .quiz-name { color: var(--text-muted); font-size: 1rem; margin-bottom: 32px; }
    .score-ring-wrap { display: flex; justify-content: center; margin-bottom: 20px; }
    .score-ring {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: drawCircle 0.6s cubic-bezier(0.4,0,0.2,1) both;
    }
    .score-inner {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: #0d0d1a;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-fraction { font-size: 1.5rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; }
    .score-pct {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 6px;
      font-family: 'Outfit', sans-serif;
    }
    .score-pct.bad { color: #f87171; }
    .score-pct.ok  { color: #fbbf24; }
    .score-pct.good { color: var(--accent-green); }
    .score-label { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; }
    .cert-banner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(167,139,250,0.12));
      border: 1px solid rgba(99,102,241,0.4);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 24px;
      color: #c4b5fd;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .cert-icon { font-size: 2rem; }
    .btn-cert {
      padding: 10px 26px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-cert:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.15); }
    .btn-cert:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-back {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, var(--accent-blue), #6366f1);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-back:hover { transform: translateY(-2px); filter: brightness(1.1); }
    .history-wrap { animation: fadeSlideUp 0.5s ease both; }
    .page-header { margin-bottom: 32px; }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-blue), #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .page-sub { color: var(--text-muted); margin-top: 6px; }
    .results-table-wrap {
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .results-table { width: 100%; border-collapse: collapse; }
    .results-table th {
      padding: 14px 20px;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .results-table td {
      padding: 14px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    .results-table tr:last-child td { border-bottom: none; }
    .results-table tr:hover td { background: rgba(255,255,255,0.02); }
    .pct-badge {
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .pct-badge.bad  { background: rgba(239,68,68,0.15); color: #f87171; }
    .pct-badge.ok   { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .pct-badge.good { background: rgba(34,197,94,0.15); color: var(--accent-green); }
    .muted { color: var(--text-muted) !important; }
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: var(--text-muted); }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ResultComponent implements OnInit {
  resultId: number | null = null;
  currentResult: Result | null = null;
  allResults: Result[] = [];
  reviewItems: QuizSubmissionResult['reviewItems'] = [];
  loading = true;
  certLoading = false;

  constructor(
    private route: ActivatedRoute,
    private resultService: ResultService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const user = this.authService.currentUserValue;

    if (!user) return;

    // If result was passed via router state (just submitted), use it directly
    const navState = history.state as { result?: QuizSubmissionResult };
    if (idParam && navState?.result) {
      this.resultId = Number(idParam);
      this.currentResult = navState.result;
      this.reviewItems = navState.result.reviewItems || [];
      this.loading = false;
      return;
    }

    const userId = Number(JSON.parse(atob(user.token.split('.')[1])).nameid);

    if (idParam) {
      this.resultId = Number(idParam);
      this.resultService.getUserResults(userId).subscribe({
        next: (results) => {
          this.currentResult = results.find(r => r.id === this.resultId) || null;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.resultService.getUserResults(userId).subscribe({
        next: (results) => {
          this.allResults = results;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  getPct(): number {
    if (!this.currentResult) return 0;
    return (this.currentResult.score / this.currentResult.totalQuestions) * 100;
  }

  getLabel(): string {
    const p = this.getPct();
    if (p >= 70) return '🎉 Great job!';
    if (p >= 40) return '👍 Not bad, keep practicing!';
    return '📚 Keep studying, you\'ll improve!';
  }

  getConicGradient(): string {
    const p = this.getPct();
    const color = p >= 70 ? '#22c55e' : p >= 40 ? '#fbbf24' : '#f87171';
    return `conic-gradient(${color} ${p}%, rgba(255,255,255,0.08) ${p}%)`;
  }

  downloadCertificate(): void {
    if (!this.resultId) return;
    this.certLoading = true;
    this.resultService.downloadCertificate(this.resultId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const username = this.currentResult?.username ?? 'user';
        const quiz = this.currentResult?.quizTitle?.replace(/\s+/g, '_') ?? 'quiz';
        a.download = `Certificate_${username}_${quiz}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.certLoading = false;
      },
      error: () => { this.certLoading = false; }
    });
  }
}
