import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = 'http://localhost:5000/api/question';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      Authorization: `Bearer ${user?.token || ''}`
    });
  }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/quiz/${quizId}`);
  }

  getRandomizedQuestionsByQuizId(quizId: number, count?: number): Observable<Question[]> {
    const url = count && count > 0
      ? `${this.apiUrl}/quiz/${quizId}/play?count=${count}`
      : `${this.apiUrl}/quiz/${quizId}/play`;
    return this.http.get<Question[]>(url);
  }

  addQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question, { headers: this.getAuthHeaders() });
  }
}
