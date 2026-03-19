import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-wrap">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="gradient-heading">Welcome Back</h2>
          <div class="header-line"></div>
        </div>
        <div *ngIf="error" class="error-msg">{{ error }}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter password" required>
          </div>
          <button type="submit" class="btn-login" [disabled]="loading">
            <span>{{ loading ? 'Signing in...' : 'Login' }}</span>
          </button>
        </form>
        <p class="auth-link">Don't have an account? <a routerLink="/register">Register here</a></p>
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
      background: rgba(15,22,41,0.8);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(108,99,255,0.2);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 0 60px rgba(108,99,255,0.08), 0 20px 48px rgba(0,0,0,0.45);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .auth-card:hover {
      border-color: rgba(108,99,255,0.38);
      box-shadow: 0 0 40px rgba(108,99,255,0.25), 0 24px 54px rgba(0,0,0,0.5);
    }
    .auth-header { margin-bottom: 28px; }
    .auth-header h2 {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .header-line {
      width: 48px;
      height: 4px;
      background: var(--accent-gradient);
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
    input {
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
    }
    input::placeholder { color: rgba(255,255,255,0.25); }
    input:focus {
      border-color: #6c63ff;
      box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
    }
    .btn-login {
      width: 100%;
      padding: 13px;
      position: relative;
      overflow: hidden;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s ease;
    }
    .btn-login::before {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%);
      transition: transform 0.6s ease;
    }
    .btn-login span {
      position: relative;
      z-index: 1;
    }
    .btn-login:hover::before {
      transform: translateX(100%);
    }
    .btn-login:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
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
export class LoginComponent {
  username = '';
  password = '';
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
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (user) => {
        if (user.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || null;
        this.error = typeof msg === 'string' ? msg : 'Invalid username or password.';
        this.loading = false;
      }
    });
  }
}
