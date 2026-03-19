import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizPlayerComponent } from './components/quiz-player/quiz-player.component';
import { ResultComponent } from './components/result/result.component';
import { LeaderboardComponent } from './components/leaderboard.component';
import { QuizHistoryComponent } from './components/quiz-history/quiz-history.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ManageQuizComponent } from './admin/manage-quiz/manage-quiz.component';
import { ManageQuestionsComponent } from './admin/manage-questions/manage-questions.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: QuizListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'quiz-player/:id', component: QuizPlayerComponent, canActivate: [AuthGuard] },
  { path: 'result', component: ResultComponent, canActivate: [AuthGuard] },
  { path: 'result/:id', component: ResultComponent, canActivate: [AuthGuard] },
  { path: 'history', component: QuizHistoryComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },

  // Admin Routes
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'admin/manage-quiz', component: ManageQuizComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'admin/manage-questions/:id', component: ManageQuestionsComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },

  { path: '**', redirectTo: '' }
];
