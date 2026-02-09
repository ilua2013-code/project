import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API_BASE_URL = 'http://localhost:8000/api/v1/tasks';

export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  // Получить все задачи
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(API_BASE_URL)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Получить задачу по ID
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${API_BASE_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Создать новую задачу
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(API_BASE_URL, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Обновить существующую задачу
  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${API_BASE_URL}/${id}`, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Удалить задачу
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Обработка ошибок HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла ошибка';
    
    if (error.error instanceof ErrorEvent) {
      // Ошибка клиента
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // Ошибка сервера
      errorMessage = `Код ошибки: ${error.status}, сообщение: ${error.message}`;
      
      // Добавляем детали ошибки если есть
      if (error.error && typeof error.error === 'object') {
        if (error.error.detail) {
          if (typeof error.error.detail === 'string') {
            errorMessage = error.error.detail;
          } else if (Array.isArray(error.error.detail)) {
            errorMessage = error.error.detail.map((err: any) => 
              err.msg || JSON.stringify(err)
            ).join(', ');
          }
        }
      }
    }
    
    console.error('Ошибка HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }
}