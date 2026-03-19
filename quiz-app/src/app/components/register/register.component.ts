import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-wrap">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <div class="header-line"></div>
        </div>
        <div *ngIf="error" class="error-msg">{{ error }}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="Choose a username" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Create a password" required>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="role" name="role">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" class="btn-register" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Register' }}
          </button>
        </form>
        <p class="auth-link">Already have an account? <a routerLink="/login">Login here</a></p>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      animation: fadeSlideUp 0.5s ease both;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .auth-header { margin-bottom: 28px; }
    .auth-header h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 10px;
    }
    .header-line {
      width: 48px;
      height: 4px;
      background: linear-gradient(90deg, var(--accent-green), #16a34a);
      border-radius: 2px;
    }
    .form-group { margin-bottom: 20px; }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0.3px;
    }
    input, select {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      outline: none;
      appearance: none;
    }
    select option { background: #1a1a2e; color: #fff; }
    input::placeholder { color: rgba(255,255,255,0.25); }
    input:focus, select:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(79,142,247,0.15);
    }
    .btn-register {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s ease;
    }
    .btn-register:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-register:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 20px;
    }
    .auth-link {
      margin-top: 24px;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .auth-link a { color: var(--accent-blue); text-decoration: none; font-weight: 500; }
    .auth-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  username = '';
  password = '';
  role = 'User';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.register({ username: this.username, password: this.password, role: this.role }).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || 'Registration failed. Please try again.';
        this.error = typeof msg === 'string' ? msg : 'Registration failed. Username might be taken.';
        this.loading = false;
      }
    });
  }
}
