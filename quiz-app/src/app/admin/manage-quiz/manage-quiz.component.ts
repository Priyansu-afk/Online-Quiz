import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-manage-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container page-wrap">
      <h2 class="gradient-heading">Create New Quiz</h2>
      
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      
      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="section-title">Basics</div>

        <div class="form-group floating" [class.has-value]="!!quiz.title">
          <input type="text" id="title" [(ngModel)]="quiz.title" name="title" required class="form-control" placeholder=" ">
          <label for="title">Quiz Title</label>
        </div>
        
        <div class="form-group floating" [class.has-value]="!!quiz.description">
          <textarea id="description" [(ngModel)]="quiz.description" name="description" rows="3" required class="form-control" placeholder=" "></textarea>
          <label for="description">Description</label>
        </div>

        <hr class="divider">

        <div class="section-title">Classification</div>

        <div class="form-group floating has-value">
          <select id="category" [(ngModel)]="quiz.category" name="category" required class="form-control">
            <option value="Programming">Programming</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
          </select>
          <label for="category">Category</label>
        </div>

        <div class="form-group floating has-value">
          <select id="difficulty" [(ngModel)]="quiz.difficulty" name="difficulty" required class="form-control">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <label for="difficulty">Difficulty</label>
        </div>

        <hr class="divider">

        <div class="section-title">Settings</div>
        
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" [(ngModel)]="quiz.isActive" name="isActive"> Is Active?
          </label>
        </div>

        <div class="form-group floating has-value">
          <input type="number" id="duration" [(ngModel)]="quiz.duration" name="duration" min="1" max="180" required class="form-control" placeholder=" ">
          <label for="duration">Duration (minutes)</label>
        </div>
        
        <div class="actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Saving...' : 'Save Quiz' }}
          </button>
          <button type="button" class="btn btn-secondary ml-2" routerLink="/admin/dashboard">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { padding: 28px 20px; max-width: 700px; margin: 0 auto; }
    h2 { margin-bottom: 18px; font-size: 2rem; }
    .form-card {
      background: #f8fbff;
      padding: 26px;
      border-radius: 20px;
      border: 1px solid rgba(23, 32, 52, 0.08);
      box-shadow: 0 20px 48px rgba(0,0,0,0.22);
      color: #172036;
    }
    .section-title {
      margin-bottom: 12px;
      font-size: 0.78rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .divider {
      border: none;
      border-top: 1px solid rgba(23, 32, 52, 0.1);
      margin: 18px 0;
    }
    .form-group { margin-bottom: 16px; }
    .floating {
      position: relative;
    }
    .form-control {
      width: 100%;
      padding: 18px 14px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-sizing: border-box;
      background: #fff;
      color: #172036;
      font-size: 0.95rem;
      outline: none;
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    .floating label {
      position: absolute;
      left: 14px;
      top: 14px;
      color: #64748b;
      font-weight: 600;
      pointer-events: none;
      transform-origin: left top;
      transition: transform .2s ease, color .2s ease;
      background: #f8fbff;
      padding: 0 4px;
    }
    .floating:focus-within label,
    .floating.has-value label {
      transform: translateY(-24px) scale(0.8);
      color: #4f46e5;
    }
    .form-control:focus {
      border-color: #6c63ff;
      box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
    }
    .checkbox-group label { display: inline-flex; align-items: center; font-weight: 600; color: #1e293b; }
    .checkbox-group input { margin-right: 10px; }
    .actions { margin-top: 22px; display: flex; }
    .btn { padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer; text-decoration: none; font-weight: 700; }
    .btn-primary { background: var(--accent-gradient); color: white; }
    .btn-secondary { background: #334155; color: white; margin-left: 10px; }
    .btn:disabled { opacity: 0.7; }
    .alert-danger { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
  `]
})
export class ManageQuizComponent {
  quiz: Quiz = {
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Medium',
    isActive: true,
    duration: 10
  };
  loading = false;
  error = '';

  constructor(private quizService: QuizService, private router: Router) {}

  onSubmit() {
    if (!this.quiz.title || !this.quiz.description) {
      this.error = 'Title and description are required.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.quizService.createQuiz(this.quiz).subscribe({
      next: (newQuiz) => {
        this.router.navigate(['/admin/manage-questions', newQuiz.id]);
      },
      error: () => {
        this.error = 'Failed to create quiz.';
        this.loading = false;
      }
    });
  }
}
