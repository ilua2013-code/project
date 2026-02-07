import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface SearchResult {
  show: boolean;
  loading: boolean;
  task?: Task;
  error?: string;
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css']
})
export class TaskManagerComponent implements OnInit {
  // Данные
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentTask: Task = this.createEmptyTask();
  
  // Поиск
  searchId: number = 0;
  searchResult: SearchResult = {
    show: false,
    loading: false
  };
  
  // Состояние
  loading: boolean = false;
  highlightedTaskId: number | null = null;
  showDeleteModal: boolean = false;
  taskToDeleteId: number | null = null;
  taskToDeleteData: Task | null = null;
  
  // Сообщения
  message: Message = { text: '', type: 'info' };
  
  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Создание пустой задачи
  createEmptyTask(): Task {
    return {
      title: '',
      description: '',
      priority: 'medium'
    };
  }

  // Загрузка всех задач
  loadTasks(): void {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.loading = false;
      },
      error: (error) => {
        this.showMessage(`Ошибка загрузки: ${this.extractErrorMessage(error)}`, 'error');
        this.loading = false;
      }
    });
  }

  // Поиск задачи по ID
  searchTaskById(): void {
    if (!this.searchId || this.searchId < 1) {
      this.showMessage('Пожалуйста, введите корректный ID задачи', 'error');
      return;
    }

    this.searchResult = {
      show: true,
      loading: true,
      task: undefined,
      error: undefined
    };

    this.taskService.getTaskById(this.searchId).subscribe({
      next: (task) => {
        this.searchResult = {
          show: true,
          loading: false,
          task: task,
          error: undefined
        };
        this.highlightTaskInTable(task.id!);
        this.showMessage(`Найдена задача #${task.id}`, 'success');
      },
      error: (error) => {
        this.searchResult = {
          show: true,
          loading: false,
          task: undefined,
          error: this.extractErrorMessage(error)
        };
        this.showMessage(`Ошибка поиска: ${this.extractErrorMessage(error)}`, 'error');
      }
    });
  }

  // Подсветка задачи в таблице
  highlightTaskInTable(taskId: number): void {
    this.highlightedTaskId = taskId;
    
    // Автосброс подсветки через 3 секунды
    setTimeout(() => {
      this.highlightedTaskId = null;
    }, 3000);
  }

  // Обработка формы
  onSubmit(): void {
    if (!this.currentTask.title.trim()) {
      this.showMessage('Пожалуйста, введите заголовок задачи', 'error');
      return;
    }

    if (this.currentTask.id) {
      // Обновление задачи
      this.taskService.updateTask(this.currentTask.id, this.currentTask).subscribe({
        next: (task) => {
          this.showMessage('Задача успешно обновлена!', 'success');
          this.resetForm();
          this.loadTasks();
          this.clearSearch();
        },
        error: (error) => {
          this.showMessage(`Ошибка: ${this.extractErrorMessage(error)}`, 'error');
        }
      });
    } else {
      // Создание новой задачи
      this.taskService.createTask(this.currentTask).subscribe({
        next: (task) => {
          this.showMessage('Задача успешно создана!', 'success');
          this.resetForm();
          this.loadTasks();
          this.clearSearch();
        },
        error: (error) => {
          this.showMessage(`Ошибка: ${this.extractErrorMessage(error)}`, 'error');
        }
      });
    }
  }

  // Редактирование задачи
  editTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.currentTask = { ...task };
        this.searchId = id;
        this.showMessage(`Редактирование задачи #${id}`, 'info');
      },
      error: (error) => {
        this.showMessage(`Ошибка: ${this.extractErrorMessage(error)}`, 'error');
      }
    });
  }

  // Открытие модального окна удаления
  openDeleteModal(id: number): void {
    this.taskToDeleteId = id;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.taskToDeleteData = task;
        this.showDeleteModal = true;
      },
      error: (error) => {
        this.showMessage(`Ошибка: ${this.extractErrorMessage(error)}`, 'error');
      }
    });
  }

  // Подтверждение удаления
  confirmDelete(): void {
    if (!this.taskToDeleteId) return;

    this.taskService.deleteTask(this.taskToDeleteId).subscribe({
      next: () => {
        this.showMessage('Задача успешно удалена!', 'success');
        this.closeModal();
        this.loadTasks();
        this.clearSearch();
      },
      error: (error) => {
        this.showMessage(`Ошибка: ${this.extractErrorMessage(error)}`, 'error');
        this.closeModal();
      }
    });
  }

  // Закрытие модального окна
  closeModal(): void {
    this.showDeleteModal = false;
    this.taskToDeleteId = null;
    this.taskToDeleteData = null;
  }

  // Сброс формы
  resetForm(): void {
    this.currentTask = this.createEmptyTask();
    this.searchId = 0;
  }

  // Очистка поиска
  clearSearch(): void {
    this.searchResult = {
      show: false,
      loading: false,
      task: undefined,
      error: undefined
    };
  }

  // Вспомогательные функции
  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'low': 'Низкий',
      'medium': 'Средний', 
      'high': 'Высокий'
    };
    return labels[priority] || priority;
  }

  showMessage(text: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.message = { text, type };
    
    // Автоскрытие сообщений
    if (type !== 'error') {
      setTimeout(() => {
        this.message = { text: '', type: 'info' };
      }, 4000);
    }
  }

  extractErrorMessage(error: any): string {
    if (!error) return 'Неизвестная ошибка';
    
    // Если это строка
    if (typeof error === 'string') {
      return this.translateError(error);
    }
    
    // Если это объект ошибки HTTP
    if (error.error) {
      const errorData = error.error;
      
      // FastAPI error detail
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          return this.translateError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          return errorData.detail.map((err: any) => {
            if (err.loc && err.msg) {
              const field = err.loc[err.loc.length - 1];
              const translatedField = this.translateFieldName(field);
              return `${translatedField}: ${this.translateSingleError(err.msg)}`;
            }
            if (err.msg) return this.translateError(err.msg);
            if (err.message) return this.translateError(err.message);
            return this.translateError(JSON.stringify(err));
          }).join(', ');
        }
      }
      
      // Другие форматы ошибок
      if (errorData.message) {
        return this.translateError(errorData.message);
      }
      
      if (typeof errorData === 'object') {
        const messages = [];
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            const translatedErrors = errorData[key].map((err: string) => this.translateError(err));
            messages.push(`${this.translateFieldName(key)}: ${translatedErrors.join(', ')}`);
          } else if (typeof errorData[key] === 'string') {
            messages.push(`${this.translateFieldName(key)}: ${this.translateError(errorData[key])}`);
          }
        }
        if (messages.length > 0) {
          return messages.join('; ');
        }
      }
    }
    
    // Статус ошибки
    if (error.status === 404) {
      return 'Задача не найдена';
    }
    
    if (error.status === 500) {
      return 'Внутренняя ошибка сервера';
    }
    
    return this.translateError(error.message || JSON.stringify(error));
  }

  translateError(errorText: string): string {
    if (!errorText) return 'Неизвестная ошибка';
    
    const lowerError = errorText.toLowerCase();
    
    const translations: Record<string, string> = {
      'field required': 'Поле обязательно для заполнения',
      'value must be a valid string': 'Значение должно быть строкой',
      'string should have at most': 'Слишком длинное значение',
      'string should have at least': 'Слишком короткое значение',
      'value is not a valid enumeration member': 'Неверное значение приоритета',
      'not found': 'Не найдено',
      'task not found': 'Задача не найдена',
      'internal server error': 'Внутренняя ошибка сервера',
      'bad request': 'Неверный запрос',
      'unauthorized': 'Не авторизован',
      'forbidden': 'Доступ запрещен',
      'failed to fetch': 'Ошибка соединения с сервером',
      'network error': 'Ошибка сети',
    };
    
    for (const [en, ru] of Object.entries(translations)) {
      if (lowerError.includes(en.toLowerCase())) {
        return ru;
      }
    }
    
    return errorText;
  }

  translateSingleError(errorText: string): string {
    const translations: Record<string, string> = {
      'ensure this value has at most': 'Слишком длинное значение',
      'ensure this value has at least': 'Слишком короткое значение',
      'field required': 'Обязательное поле',
    };
    
    for (const [en, ru] of Object.entries(translations)) {
      if (errorText.toLowerCase().includes(en.toLowerCase())) {
        const numMatch = errorText.match(/\d+/);
        if (numMatch) {
          if (en.includes('at most')) {
            return `${ru}. Максимальная длина: ${numMatch[0]} символов`;
          }
          if (en.includes('at least')) {
            return `${ru}. Минимальная длина: ${numMatch[0]} символов`;
          }
        }
        return ru;
      }
    }
    
    return errorText;
  }

  translateFieldName(fieldName: string): string {
    const fieldTranslations: Record<string, string> = {
      'title': 'Заголовок',
      'description': 'Описание',
      'priority': 'Приоритет',
      'status': 'Статус',
      'id': 'ID',
      'task_id': 'ID задачи',
    };
    
    return fieldTranslations[fieldName] || fieldName;
  }
}