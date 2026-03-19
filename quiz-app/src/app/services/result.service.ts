import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result, QuizSubmission, LeaderboardEntry, QuizSubmissionResult, QuizHistoryItem, AdminAnalytics } from '../models/result.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ResultService {
  private apiUrl = 'http://localhost:5000/api/result';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      Authorization: `Bearer ${user?.token || ''}`
    });
  }

  submitQuiz(submission: QuizSubmission): Observable<QuizSubmissionResult> {
    return this.http.post<QuizSubmissionResult>(`${this.apiUrl}/submit`, submission, { headers: this.getAuthHeaders() });
  }

  getUserResults(userId: number): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  getQuizHistory(userId: number): Observable<QuizHistoryItem[]> {
    return this.http.get<QuizHistoryItem[]>(`${this.apiUrl}/history/${userId}`, { headers: this.getAuthHeaders() });
  }

  /** Fetch leaderboard — top N players sorted by score descending. */
  getLeaderboard(topN: number = 20): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(
      `${this.apiUrl}/leaderboard?topN=${topN}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAdminAnalytics(): Observable<AdminAnalytics> {
    return this.http.get<AdminAnalytics>(`${this.apiUrl}/admin/analytics`, { headers: this.getAuthHeaders() });
  }

  /** Download a PDF certificate for a result (only available when score > 80%). */
  downloadCertificate(resultId: number): Observable<Blob> {
    return this.http.get(
      `http://localhost:5000/api/certificate/${resultId}`,
      { headers: this.getAuthHeaders(), responseType: 'blob' }
    );
  }
}
