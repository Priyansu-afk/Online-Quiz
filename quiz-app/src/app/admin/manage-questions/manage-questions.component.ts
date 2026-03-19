import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { QuizService } from '../../services/quiz.service';
import { Question } from '../../models/question.model';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-manage-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="header-actions">
        <h2>Manage Questions <span *ngIf="quiz">for: {{ quiz.title }}</span></h2>
        <button class="btn btn-secondary" routerLink="/admin/dashboard">Back to Dashboard</button>
      </div>
      
      <div class="row">
        <div class="col-list">
          <h3>Current Questions ({{ questions.length }})</h3>
          <div *ngIf="loading">Loading...</div>
          <div class="question-list" *ngIf="!loading">
            <div class="q-item" *ngFor="let q of questions; let i = index">
              <strong>Q{{ i + 1 }}:</strong> {{ q.text }}
              <div class="q-options">
                <span [class.correct]="q.correctOption === 'A'">A: {{ q.optionA }}</span> | 
                <span [class.correct]="q.correctOption === 'B'">B: {{ q.optionB }}</span> | 
                <span [class.correct]="q.correctOption === 'C'">C: {{ q.optionC }}</span> | 
                <span [class.correct]="q.correctOption === 'D'">D: {{ q.optionD }}</span>
              </div>
              <p class="q-explanation" *ngIf="q.explanation">Explanation: {{ q.explanation }}</p>
            </div>
            <div *ngIf="questions.length === 0" class="empty-state">No questions added yet.</div>
          </div>
        </div>
        
        <div class="col-form">
          <h3>Add New Question</h3>
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
          
          <form (ngSubmit)="addQuestion()" class="form-card">
            <div class="form-group">
              <label>Question Text</label>
              <textarea [(ngModel)]="newQuestion.text" name="text" rows="2" required class="form-control"></textarea>
            </div>
            
            <div class="form-group">
              <label>Option A</label>
              <input type="text" [(ngModel)]="newQuestion.optionA" name="optionA" required class="form-control">
            </div>
            <div class="form-group">
              <label>Option B</label>
              <input type="text" [(ngModel)]="newQuestion.optionB" name="optionB" required class="form-control">
            </div>
            <div class="form-group">
              <label>Option C</label>
              <input type="text" [(ngModel)]="newQuestion.optionC" name="optionC" required class="form-control">
            </div>
            <div class="form-group">
              <label>Option D</label>
              <input type="text" [(ngModel)]="newQuestion.optionD" name="optionD" required class="form-control">
            </div>
            
            <div class="form-group">
              <label>Correct Option</label>
              <select [(ngModel)]="newQuestion.correctOption" name="correctOption" required class="form-control">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div class="form-group">
              <label>Explanation</label>
              <textarea [(ngModel)]="newQuestion.explanation" name="explanation" rows="2" class="form-control"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Add Question' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 30px; max-width: 1200px; margin: 0 auto; color: #f0f0f5; }
    h2, h3 { color: #fff; font-family: 'Outfit', sans-serif; }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .row { display: flex; gap: 30px; flex-wrap: wrap; }
    .col-list { flex: 1; min-width: 400px; }
    .col-form { flex: 1; min-width: 350px; }
    .question-list { max-height: 600px; overflow-y: auto; }
    .q-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 15px; margin-bottom: 10px; border-radius: 10px; color: #f0f0f5; }
    .q-options { font-size: 0.9em; margin-top: 8px; color: #8b8b9e; }
    .q-explanation { margin-top: 8px; color: #cbd5e1; font-size: 0.86rem; }
    .correct { color: #22c55e; font-weight: bold; }
    .empty-state { padding: 20px; text-align: center; color: #8b8b9e; border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; }
    .form-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); padding: 24px; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; }
    .form-group { margin-bottom: 16px; }
    .form-control { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
    .form-control:focus { border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,0.15); }
    textarea.form-control { resize: vertical; }
    select.form-control option { background: #1a1a2e; }
    label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.85rem; color: #8b8b9e; }
    .btn { padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s ease; }
    .btn-primary { background: linear-gradient(135deg, #4f8ef7, #6366f1); color: white; }
    .btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: rgba(255,255,255,0.08); color: #ccc; border: 1px solid rgba(255,255,255,0.12); }
    .btn-secondary:hover { background: rgba(255,255,255,0.14); color: #fff; }
    .alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 15px; font-size: 0.875rem; }
    .alert-danger { color: #f87171; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); }
    .alert-success { color: #4ade80; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); }
  `]
})
export class ManageQuestionsComponent implements OnInit {
  quizId!: number;
  quiz?: Quiz;
  questions: Question[] = [];
  
  newQuestion: Partial<Question> = {
    text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: ''
  };
  
  loading = true;
  saving = false;
  error = '';
  successMsg = '';

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (q) => this.quiz = q,
      error: () => console.error('Failed to load quiz snippet')
    });

    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;
    this.questionService.getQuestionsByQuizId(this.quizId).subscribe({
      next: (data) => {
        this.questions = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  addQuestion() {
    if (!this.newQuestion.text || !this.newQuestion.optionA || !this.newQuestion.optionB || !this.newQuestion.correctOption) {
      this.error = 'Please fill all required fields.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.successMsg = '';

    const qToSave: Question = {
      quizId: this.quizId,
      text: this.newQuestion.text!,
      optionA: this.newQuestion.optionA!,
      optionB: this.newQuestion.optionB!,
      optionC: this.newQuestion.optionC || '',
      optionD: this.newQuestion.optionD || '',
      correctOption: this.newQuestion.correctOption!,
      explanation: this.newQuestion.explanation || ''
    };

    this.questionService.addQuestion(qToSave).subscribe({
      next: (q) => {
        this.questions.push(q);
        this.saving = false;
        this.successMsg = 'Question added successfully!';
        // Reset form
        this.newQuestion = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' };
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.error = 'Failed to add question.';
        this.saving = false;
      }
    });
  }
}
