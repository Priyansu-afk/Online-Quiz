import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/" routerLinkActive="active-brand" [routerLinkActiveOptions]="{ exact: true }">Quiz System</a>
      </div>
      <div class="nav-links">
        <ng-container *ngIf="user$ | async as user; else loggedOut">
          <span class="user-info">Welcome, {{ user.username }}</span>
          <ng-container *ngIf="user.role === 'Admin'">
            <a routerLink="/admin/dashboard" routerLinkActive="active-link" class="nav-item">Admin Dashboard</a>
            <a routerLink="/leaderboard" routerLinkActive="active-link" class="nav-item">🏆 Leaderboard</a>
          </ng-container>
          <ng-container *ngIf="user.role === 'User'">
            <a routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">Quizzes</a>
            <a routerLink="/history" routerLinkActive="active-link" class="nav-item">History</a>
            <a routerLink="/leaderboard" routerLinkActive="active-link" class="nav-item">🏆 Leaderboard</a>
          </ng-container>
          <a (click)="logout()" class="nav-item logout-btn">Logout</a>
        </ng-container>
        <ng-template #loggedOut>
          <a routerLink="/login" routerLinkActive="active-link" class="nav-item">Login</a>
          <a routerLink="/register" routerLinkActive="active-link" class="nav-item">Register</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(8,11,20,0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 0 32px;
      min-height: 64px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand a {
      font-family: 'Syne', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
      letter-spacing: -0.03em;
      transition: all 0.3s ease;
    }
    .active-brand,
    .nav-brand a:hover {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links { display: flex; align-items: center; gap: 8px; }
    .nav-item {
      color: var(--text-muted);
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
    }
    .nav-item::after {
      content: '';
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 4px;
      height: 2px;
      transform: scaleX(0);
      transform-origin: left;
      background: var(--accent-gradient);
      border-radius: 2px;
      transition: transform 0.3s ease;
    }
    .nav-item:hover { color: var(--text-primary); }
    .nav-item:hover::after { transform: scaleX(1); }
    .nav-item.active-link {
      background: linear-gradient(135deg, #fff 0%, #a8a4ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-item.active-link::after {
      transform: scaleX(1);
    }
    .user-info {
      font-style: italic;
      color: #a8a4ff;
      font-size: 0.85rem;
      margin-right: 8px;
    }
    .logout-btn {
      border: 1px solid rgba(239,68,68,0.5);
      color: #f87171;
      border-radius: 50px;
      transition: all 0.3s ease;
    }
    .logout-btn:hover {
      background: #ef4444;
      color: #fff;
      border-color: #ef4444;
    }
    .logout-btn::after { display: none; }

    @media (max-width: 860px) {
      .navbar {
        padding: 12px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .nav-links {
        flex-wrap: wrap;
      }
    }
  `]
})
export class NavbarComponent {
  user$ = this.authService.currentUser$;

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
