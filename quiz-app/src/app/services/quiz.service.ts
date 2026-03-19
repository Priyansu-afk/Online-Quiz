import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz } from '../models/quiz.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = 'http://localhost:5000/api/quiz';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      Authorization: `Bearer ${user?.token || ''}`
    });
  }

  getAllQuizzes(category?: string, difficulty?: string): Observable<Quiz[]> {
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    if (difficulty) {
      params.set('difficulty', difficulty);
    }

    const query = params.toString();
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;
    return this.http.get<Quiz[]>(url);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz, { headers: this.getAuthHeaders() });
  }
}
