import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';
import { ResultService } from '../../services/result.service';
import { AdminAnalytics } from '../../models/result.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2>Admin Dashboard</h2>

      <div class="analytics-grid" *ngIf="analytics">
        <div class="analytics-card">
          <p class="card-label">Total Users</p>
          <p class="card-value">{{ analytics.totalUsers }}</p>
        </div>
        <div class="analytics-card">
          <p class="card-label">Total Quiz Attempts</p>
          <p class="card-value">{{ analytics.totalQuizzesAttempted }}</p>
        </div>
        <div class="analytics-card">
          <p class="card-label">Average Score</p>
          <p class="card-value">{{ analytics.averageScorePercent | number:'1.0-2' }}%</p>
        </div>
        <div class="analytics-card">
          <p class="card-label">Most Popular Quiz</p>
          <p class="card-value small">{{ analytics.mostPopularQuiz?.quizTitle || 'N/A' }}</p>
          <p class="card-note" *ngIf="analytics.mostPopularQuiz">{{ analytics.mostPopularQuiz.attemptCount }} attempts</p>
        </div>
      </div>

      <div class="chart-wrap" *ngIf="analytics && analytics.quizAttempts.length > 0">
        <h3>Quiz Attempts Distribution</h3>
        <canvas #attemptChart></canvas>
      </div>
      
      <div class="actions mb-20">
        <button class="btn btn-primary" routerLink="/admin/manage-quiz">Create New Quiz</button>
      </div>

      <div *ngIf="loading">Loading quizzes...</div>
      
      <div class="table-wrap" *ngIf="!loading && quizzes.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quiz of quizzes">
              <td>{{ quiz.id }}</td>
              <td>{{ quiz.title }}</td>
              <td>
                <span class="badge" [ngClass]="{'bg-success': quiz.isActive, 'bg-secondary': !quiz.isActive}">
                  {{ quiz.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info mr-2" routerLink="/admin/manage-questions/{{ quiz.id }}">Manage Questions</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="!loading && quizzes.length === 0">
        <p class="empty">No quizzes found. Create one to get started.</p>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 30px; max-width: 1000px; margin: 0 auto; color: #f0f0f5; }
    h2 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 24px; }
    h3 { color: #fff; margin: 0 0 14px; font-size: 1rem; font-weight: 700; }
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }
    .analytics-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 14px;
    }
    .card-label { color: #94a3b8; font-size: 0.78rem; margin-bottom: 6px; }
    .card-value { color: #fff; font-size: 1.5rem; font-weight: 700; margin: 0; }
    .card-value.small { font-size: 1.05rem; }
    .card-note { color: #60a5fa; font-size: 0.8rem; margin-top: 6px; }
    .chart-wrap {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 22px;
    }
    .mb-20 { margin-bottom: 20px; }
    .mr-2 { margin-right: 10px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #8b8b9e;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
    }
    .table td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #f0f0f5;
      font-size: 0.9rem;
    }
    .table tr:hover td { background: rgba(255,255,255,0.02); }
    .table tr:last-child td { border-bottom: none; }
    .table-wrap {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .btn { padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s ease; }
    .btn-sm { padding: 6px 14px; font-size: 0.82rem; }
    .btn-primary { background: linear-gradient(135deg, #4f8ef7, #6366f1); color: white; }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-info { background: rgba(79,142,247,0.15); color: #4f8ef7; border: 1px solid rgba(79,142,247,0.3); }
    .btn-info:hover { background: rgba(79,142,247,0.25); }
    .badge { padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
    .bg-success { background: rgba(34,197,94,0.15); color: #22c55e; }
    .bg-secondary { background: rgba(255,255,255,0.08); color: #8b8b9e; }
    .empty { color: #8b8b9e; padding: 20px 0; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('attemptChart') attemptChart?: ElementRef<HTMLCanvasElement>;

  quizzes: Quiz[] = [];
  analytics: AdminAnalytics | null = null;
  loading = true;
  private attemptsChart: Chart | null = null;

  constructor(private quizService: QuizService, private resultService: ResultService) {}

  ngOnInit() {
    this.quizService.getAllQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.resultService.getAdminAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        setTimeout(() => this.renderAttemptsChart(), 0);
      },
      error: () => {
        this.analytics = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.attemptsChart) {
      this.attemptsChart.destroy();
    }
  }

  private renderAttemptsChart(): void {
    if (!this.analytics || !this.attemptChart?.nativeElement) {
      return;
    }

    if (this.attemptsChart) {
      this.attemptsChart.destroy();
    }

    this.attemptsChart = new Chart(this.attemptChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.analytics.quizAttempts.map((q) => q.quizTitle),
        datasets: [
          {
            label: 'Attempts',
            data: this.analytics.quizAttempts.map((q) => q.attemptCount),
            backgroundColor: 'rgba(79, 142, 247, 0.7)',
            borderColor: 'rgba(79, 142, 247, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#e2e8f0'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          },
          y: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          }
        }
      }
    });
  }
}
