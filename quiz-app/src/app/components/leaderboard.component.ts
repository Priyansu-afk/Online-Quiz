import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultService } from '../services/result.service';
import { LeaderboardEntry } from '../models/result.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-wrap">
      <!-- Header -->
      <div class="lb-header">
        <div class="trophy-icon">🏆</div>
        <h1 class="gradient-heading">Leaderboard</h1>
        <p class="sub">Top performers across all quizzes</p>
      </div>

      <!-- Top-N toggle -->
      <div class="controls">
        <button class="toggle-btn" [class.active]="topN === 10" (click)="loadLeaderboard(10)">Top 10</button>
        <button class="toggle-btn" [class.active]="topN === 20" (click)="loadLeaderboard(20)">Top 20</button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="skeleton-head skeleton"></div>
        <div class="skeleton-row skeleton" *ngFor="let row of [1,2,3,4,5]"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="error-state">
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadLeaderboard(topN)">Retry</button>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && entries.length > 0" class="lb-table-wrap">
        <table class="lb-table">
          <thead>
            <tr>
              <th class="col-rank">Rank</th>
              <th class="col-user">Username</th>
              <th class="col-quiz">Quiz Title</th>
              <th class="col-score">Score</th>
              <th class="col-date">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let entry of entries; let i = index"
              [class.gold]="entry.rank === 1"
              [class.silver]="entry.rank === 2"
              [class.bronze]="entry.rank === 3"
              [class.top-score]="entry.score === maxScore"
              [style.--i]="i">
              <td class="col-rank">
                <span class="rank-badge" [ngClass]="rankClass(entry.rank)">
                  {{ rankLabel(entry.rank) }}
                </span>
              </td>
              <td class="col-user"><span class="username">{{ entry.username }}</span></td>
              <td class="col-quiz">{{ entry.quizTitle }}</td>
              <td class="col-score">
                <span class="score-pill">{{ entry.score }} / {{ entry.totalQuestions }}</span>
              </td>
              <td class="col-date">{{ entry.dateTaken | date:'MMM d, y' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && entries.length === 0" class="empty-state">
        <p>No quiz results yet. Be the first to complete a quiz!</p>
        <a routerLink="/" class="cta-btn">Take a Quiz</a>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
      animation: fadeSlideUp 0.5s ease both;
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Header ── */
    .lb-header { text-align: center; margin-bottom: 36px; }
    .trophy-icon {
      font-size: 3.5rem;
      margin-bottom: 12px;
      display: block;
      animation: pulse-glow 1.8s ease-in-out infinite;
    }
    @keyframes pulse-glow {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 0 rgba(255, 221, 110, 0));
      }
      50% {
        transform: scale(1.08);
        filter: drop-shadow(0 0 14px rgba(255, 221, 110, 0.55));
      }
    }
    .lb-header h1 { font-size: 2.4rem; font-weight: 800; color: #fff; margin: 0 0 8px; }
    .sub { color: var(--text-muted, #a0a0b5); font-size: 0.95rem; }

    /* ── Top-N toggle ── */
    .controls { display: flex; justify-content: center; gap: 12px; margin-bottom: 32px; }
    .toggle-btn {
      padding: 8px 24px;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.06);
      color: #a0a0b5;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .toggle-btn.active, .toggle-btn:hover {
      background: var(--accent-blue, #4f8ef7);
      border-color: var(--accent-blue, #4f8ef7);
      color: #fff;
    }

    /* ── Table ── */
    .lb-table-wrap {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    }
    .lb-table { width: 100%; border-collapse: collapse; }
    .lb-table thead tr {
      background: rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .lb-table th {
      padding: 14px 20px;
      text-align: left;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #a0a0b5;
    }
    .lb-table td {
      padding: 16px 20px;
      font-size: 0.92rem;
      color: #e0e0f0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      vertical-align: middle;
    }
    .lb-table tbody tr:last-child td { border-bottom: none; }
    .lb-table tbody tr { transition: background 0.2s ease; }
    .lb-table tbody tr:hover { background: rgba(255,255,255,0.04); }
    .lb-table tbody tr {
      animation: slideInUp 0.4s ease both;
      animation-delay: calc(var(--i) * 0.05s);
    }
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Medal rows */
    .lb-table tbody tr.gold {
      background: linear-gradient(90deg, rgba(250, 204, 21, 0.24), rgba(251, 191, 36, 0.08));
    }
    .lb-table tbody tr.silver {
      background: linear-gradient(90deg, rgba(203, 213, 225, 0.2), rgba(148, 163, 184, 0.06));
    }
    .lb-table tbody tr.bronze {
      background: linear-gradient(90deg, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.06));
    }
    /* Highlight row with highest score */
    .lb-table tbody tr.top-score td { color: #fff; font-weight: 600; }

    /* ── Rank badge ── */
    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.95rem;
      background: rgba(255,255,255,0.08);
      color: #a0a0b5;
    }
    .rank-badge.rank-gold   { background: rgba(251,191,36,0.2);  color: #fbbf24; font-size: 1.2rem; }
    .rank-badge.rank-silver { background: rgba(148,163,184,0.2); color: #94a3b8; font-size: 1.2rem; }
    .rank-badge.rank-bronze { background: rgba(180,106,60,0.2);  color: #b46a3c; font-size: 1.2rem; }

    .username   { font-weight: 600; color: #fff; }
    .score-pill {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(79,142,247,0.15);
      border: 1px solid rgba(79,142,247,0.3);
      border-radius: 50px;
      color: var(--accent-blue, #4f8ef7);
      font-weight: 700;
      font-size: 0.85rem;
    }
    .col-rank  { width: 80px; }
    .col-score { width: 130px; }
    .col-date  { width: 130px; }

    /* ── States ── */
    .loading-state, .empty-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      padding: 80px 24px;
      color: #a0a0b5;
      text-align: center;
    }
    .skeleton-head {
      height: 44px;
      width: 100%;
      border-radius: 12px;
    }
    .skeleton-row {
      height: 52px;
      width: 100%;
      border-radius: 10px;
    }
    .retry-btn, .cta-btn {
      padding: 10px 28px;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .retry-btn:hover, .cta-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
  `]
})
export class LeaderboardComponent implements OnInit {
  entries: LeaderboardEntry[] = [];
  loading = false;
  error = '';
  topN = 20;

  /** Highest score in the current dataset — used to highlight that row. */
  get maxScore(): number {
    return this.entries.length ? Math.max(...this.entries.map(e => e.score)) : 0;
  }

  constructor(private resultService: ResultService) {}

  ngOnInit() {
    this.loadLeaderboard(this.topN);
  }

  loadLeaderboard(topN: number) {
    this.topN = topN;
    this.loading = true;
    this.error = '';
    this.resultService.getLeaderboard(topN).subscribe({
      next: (data) => { this.entries = data; this.loading = false; },
      error: (err) => {
        console.error('Leaderboard fetch error:', err);
        this.error = 'Failed to load leaderboard. Please try again.';
        this.loading = false;
      }
    });
  }

  rankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  rankLabel(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return String(rank);
  }
}
