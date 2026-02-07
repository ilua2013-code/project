const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/tasks';

// Элементы DOM
const tasksTableBody = document.querySelector('#tasksTable tbody');
const taskForm = document.querySelector('#taskForm');
const submitBtn = document.querySelector('#submitBtn');
const cancelBtn = document.querySelector('#cancelBtn');
const messageArea = document.querySelector('#messageArea');
const loadingIndicator = document.querySelector('#loadingIndicator');
const emptyState = document.querySelector('#emptyState');

// Элементы для поиска
const searchIdField = document.getElementById('searchId');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');

// Элементы модального окна
const deleteModal = document.getElementById('deleteModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const modalMessage = document.getElementById('modalMessage');
const taskPreview = document.getElementById('taskPreview');

// Поля формы
const taskIdField = document.getElementById('taskId');
const titleField = document.getElementById('title');
const descriptionField = document.getElementById('description');
const priorityField = document.getElementById('priority');

// Переменные
let currentEditId = null;
let taskToDeleteId = null;
let taskToDeleteData = null;

// Загрузка задач при запуске
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Обработчики для поиска
    if (searchBtn) {
        searchBtn.addEventListener('click', searchTaskById);
    }
    
    if (searchIdField) {
        searchIdField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchTaskById();
            }
        });
    }
    
    // Обработчики для модального окна
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', confirmDelete);
    
    // Закрытие модального окна при клике на фон
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeModal();
        }
    });
    
    // Закрытие модального окна по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal.classList.contains('show')) {
            closeModal();
        }
    });
});

// Функция для извлечения и перевода сообщения об ошибке
function extractErrorMessage(errorData) {
    if (!errorData) {
        return 'Неизвестная ошибка сервера';
    }
    
    // Если это строка, переводим если нужно
    if (typeof errorData === 'string') {
        return translateError(errorData);
    }
    
    // Если это объект с полем detail (стандарт FastAPI)
    if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
            return translateError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
            return errorData.detail.map(err => {
                if (err.loc && err.msg) {
                    // Если есть информация о месте ошибки (например: ["body", "title"])
                    const field = err.loc[err.loc.length - 1];
                    const translatedField = translateFieldName(field);
                    return `${translatedField}: ${translateSingleError(err.msg)}`;
                }
                if (err.msg) return translateError(err.msg);
                if (err.message) return translateError(err.message);
                return translateError(JSON.stringify(err));
            }).join(', ');
        }
    }
    
    // Если это объект с полем message
    if (errorData.message) {
        return translateError(errorData.message);
    }
    
    // Если это массив ошибок
    if (Array.isArray(errorData)) {
        return errorData.map(err => {
            if (err.msg) return translateError(err.msg);
            if (err.message) return translateError(err.message);
            if (typeof err === 'string') return translateError(err);
            return translateError(JSON.stringify(err));
        }).join(', ');
    }
    
    // Если это объект с ошибками валидации
    if (typeof errorData === 'object') {
        const messages = [];
        for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
                const translatedErrors = errorData[key].map(err => translateError(err));
                messages.push(`${translateFieldName(key)}: ${translatedErrors.join(', ')}`);
            } else if (typeof errorData[key] === 'string') {
                messages.push(`${translateFieldName(key)}: ${translateError(errorData[key])}`);
            } else if (typeof errorData[key] === 'object') {
                messages.push(`${translateFieldName(key)}: ${translateError(JSON.stringify(errorData[key]))}`);
            }
        }
        if (messages.length > 0) {
            return messages.join('; ');
        }
    }
    
    // В крайнем случае преобразуем в строку и переводим
    try {
        const errorStr = JSON.stringify(errorData);
        return translateError(errorStr);
    } catch {
        return 'Ошибка сервера';
    }
}

// Функция перевода ошибок с английского на русский
function translateError(errorText) {
    if (!errorText) return 'Неизвестная ошибка';
    
    const lowerError = errorText.toLowerCase();
    
    // Общие ошибки
    const translations = {
        // Ошибки валидации
        'field required': 'Поле обязательно для заполнения',
        'value must be a valid string': 'Значение должно быть строкой',
        'value must be a valid integer': 'Значение должно быть целым числом',
        'string should have at most': 'Слишком длинное значение',
        'string should have at least': 'Слишком короткое значение',
        'string is too long': 'Слишком длинное значение',
        'string is too short': 'Слишком короткое значение',
        'value is not a valid string': 'Неверный формат строки',
        'value is not a valid integer': 'Неверный формат числа',
        'ensure this field has no more than': 'Поле содержит слишком много символов',
        'ensure this field has at least': 'Поле содержит слишком мало символов',
        
        // Ошибки приоритета
        'value is not a valid enumeration member': 'Неверное значение приоритета',
        'unexpected value': 'Неверное значение',
        
        // Общие HTTP ошибки
        'not found': 'Не найдено',
        'task not found': 'Задача не найдена',
        'internal server error': 'Внутренняя ошибка сервера',
        'bad request': 'Неверный запрос',
        'unauthorized': 'Не авторизован',
        'forbidden': 'Доступ запрещен',
        
        // Ошибки создания/обновления
        'error creating task': 'Ошибка создания задачи',
        'error updating task': 'Ошибка обновления задачи',
        'error deleting task': 'Ошибка удаления задачи',
        
        // Ошибки соединения
        'failed to fetch': 'Ошибка соединения с сервером',
        'network error': 'Ошибка сети',
        'connection refused': 'Соединение отклонено',
        
        // Ошибки JSON
        'unexpected token': 'Ошибка в данных',
        'json parse error': 'Ошибка обработки данных',
    };
    
    // Обработка ошибок с указанием поля (например: "title: ensure this value has at most 100 characters")
    const fieldErrorMatch = errorText.match(/^(\w+):\s*(.+)$/);
    if (fieldErrorMatch) {
        const fieldName = fieldErrorMatch[1];
        const errorMessage = fieldErrorMatch[2];
        const translatedField = translateFieldName(fieldName);
        const translatedError = translateSingleError(errorMessage);
        
        return `${translatedField}: ${translatedError}`;
    }
    
    // Обработка ошибок длины с числами для конкретных полей
    const fieldLengthMatch = errorText.match(/^(\w+):\s*ensure this value has at most (\d+) characters/);
    if (fieldLengthMatch) {
        const fieldName = fieldLengthMatch[1];
        const maxLength = fieldLengthMatch[2];
        const translatedField = translateFieldName(fieldName);
        
        return `${translatedField}: Слишком длинное значение. Максимальная длина: ${maxLength} символов`;
    }
    
    const fieldMinLengthMatch = errorText.match(/^(\w+):\s*ensure this value has at least (\d+) characters/);
    if (fieldMinLengthMatch) {
        const fieldName = fieldMinLengthMatch[1];
        const minLength = fieldMinLengthMatch[2];
        const translatedField = translateFieldName(fieldName);
        
        return `${translatedField}: Слишком короткое значение. Минимальная длина: ${minLength} символов`;
    }
    
    // Общие ошибки длины (без указания поля)
    const maxLengthMatch = errorText.match(/ensure this value has at most (\d+) characters/);
    if (maxLengthMatch) {
        return `Слишком длинное значение. Максимальная длина: ${maxLengthMatch[1]} символов`;
    }
    
    const minLengthMatch = errorText.match(/ensure this value has at least (\d+) characters/);
    if (minLengthMatch) {
        return `Слишком короткое значение. Минимальная длина: ${minLengthMatch[1]} символов`;
    }
    
    const maxLengthMatch2 = errorText.match(/string should have at most (\d+) characters/);
    if (maxLengthMatch2) {
        return `Слишком длинное значение. Максимальная длина: ${maxLengthMatch2[1]} символов`;
    }
    
    const minLengthMatch2 = errorText.match(/string should have at least (\d+) characters/);
    if (minLengthMatch2) {
        return `Слишком короткое значение. Минимальная длина: ${minLengthMatch2[1]} символов`;
    }
    
    // Проверяем общие переводы
    for (const [en, ru] of Object.entries(translations)) {
        if (lowerError.includes(en.toLowerCase())) {
            return ru;
        }
    }
    
    // Если не нашли перевод, возвращаем оригинал
    return errorText;
}

// Функция для перевода отдельных ошибок (без указания поля)
function translateSingleError(errorText) {
    if (!errorText) return 'Неизвестная ошибка';
    
    const lowerError = errorText.toLowerCase();
    
    const translations = {
        'ensure this value has at most': 'Слишком длинное значение',
        'ensure this value has at least': 'Слишком короткое значение',
        'field required': 'Обязательное поле',
        'value must be a valid string': 'Значение должно быть строкой',
    };
    
    for (const [en, ru] of Object.entries(translations)) {
        if (lowerError.includes(en.toLowerCase())) {
            // Извлекаем число если есть
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

// Функция перевода названий полей
function translateFieldName(fieldName) {
    const fieldTranslations = {
        'title': 'Заголовок',
        'description': 'Описание',
        'priority': 'Приоритет',
        'status': 'Статус',
        'id': 'ID',
        'task_id': 'ID задачи',
        'created_at': 'Дата создания',
        'updated_at': 'Дата обновления',
    };
    
    return fieldTranslations[fieldName] || fieldName;
}

// Функция поиска задачи по ID
async function searchTaskById() {
    const taskId = searchIdField.value.trim();
    
    if (!taskId || isNaN(taskId) || taskId < 1) {
        showMessage('Пожалуйста, введите корректный ID задачи', 'error');
        return;
    }
    
    try {
        searchResult.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>';
        searchResult.classList.add('show');
        
        const response = await fetch(`${API_BASE_URL}/${taskId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Задача с ID ${taskId} не найдена`);
            }
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка сервера: ${response.status}`);
        }
        
        const task = await response.json();
        displaySingleTask(task);
        highlightTaskInTable(task.id);
        searchResult.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        searchResult.innerHTML = `
            <div class="text-danger">
                <i class="fas fa-exclamation-triangle"></i>
                ${error.message}
            </div>
        `;
        searchResult.classList.add('show');
        showMessage(`Ошибка поиска: ${error.message}`, 'error');
    }
}

// Отображение найденной задачи
function displaySingleTask(task) {
    const description = task.description || '—';
    
    searchResult.innerHTML = `
        <div class="single-task">
            <h4><i class="fas fa-tasks"></i> Задача #${task.id}: ${escapeHtml(task.title)}</h4>
            <p><strong>Описание:</strong> ${escapeHtml(description)}</p>
            <p><strong>Приоритет:</strong> 
                <span class="priority-badge priority-${task.priority}">
                    ${getPriorityLabel(task.priority)}
                </span>
            </p>
            <div class="mt-3">
                <button class="btn btn-sm btn-primary" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="btn btn-sm btn-danger ms-2" onclick="openDeleteModal(${task.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `;
    searchResult.classList.add('show');
}

// Подсветка задачи в таблице
function highlightTaskInTable(taskId) {
    const allRows = tasksTableBody.querySelectorAll('tr');
    allRows.forEach(row => {
        row.classList.remove('highlighted');
    });
    
    const targetRow = tasksTableBody.querySelector(`tr[data-task-id="${taskId}"]`);
    if (targetRow) {
        targetRow.classList.add('highlighted');
        targetRow.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        setTimeout(() => {
            targetRow.classList.remove('highlighted');
        }, 3000);
    }
}

// Обработчик формы
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleField.value.trim();
    const description = descriptionField.value.trim();
    const priority = priorityField.value;
    const taskId = taskIdField.value;
    
    if (!title) {
        showMessage('Пожалуйста, введите заголовок задачи', 'error');
        return;
    }

    const taskData = { 
        title, 
        description: description || '', 
        priority: priority || 'medium'
    };

    try {
        let response;
        
        if (taskId) {
            // Обновление существующей задачи
            response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(taskData),
            });
        } else {
            // Создание новой задачи
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(taskData),
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (taskId) {
            showMessage('Задача успешно обновлена!', 'success');
        } else {
            console.log('Создана задача:', result);
            showMessage('Задача успешно создана!', 'success');
        }
        
        resetForm();
        await loadTasks();
        
        searchResult.innerHTML = '';
        searchResult.classList.remove('show');
        searchIdField.value = '';
        
    } catch (error) {
        console.error('Ошибка сохранения задачи:', error);
        showMessage(`Ошибка: ${error.message}`, 'error');
    }
});

// Кнопка отмены
if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
}

// Загрузка всех задач
async function loadTasks() {
    try {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        const response = await fetch(API_BASE_URL, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка сервера: ${response.status}`);
        }
        
        const tasks = await response.json();
        console.log('Загружено задач:', tasks.length);
        renderTasks(tasks);
        
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        showMessage(`Ошибка загрузки: ${error.message}`, 'error');
        tasksTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-3">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${error.message}
                </td>
            </tr>
        `;
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// Отображение задач в таблице
function renderTasks(tasks) {
    tasksTableBody.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    tasks.sort((a, b) => b.id - a.id).forEach(task => {
        const row = document.createElement('tr');
        row.setAttribute('data-task-id', task.id);
        
        const description = task.description || '—';
        
        row.innerHTML = `
            <td>${task.id}</td>
            <td><strong>${escapeHtml(task.title)}</strong></td>
            <td>${escapeHtml(description)}</td>
            <td>
                <span class="priority-badge priority-${task.priority}">
                    ${getPriorityLabel(task.priority)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editTask(${task.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal(${task.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tasksTableBody.appendChild(row);
    });
}

// Редактирование задачи
async function editTask(id) {
    try {
        console.log(`Загрузка задачи ${id} для редактирования...`);
        
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка загрузки задачи: ${response.status}`);
        }
        
        const task = await response.json();
        console.log('Задача для редактирования:', task);
        
        taskIdField.value = task.id;
        titleField.value = task.title;
        descriptionField.value = task.description || '';
        priorityField.value = task.priority;
        
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
        
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }
        
        taskForm.scrollIntoView({ behavior: 'smooth' });
        searchIdField.value = task.id;
        
        showMessage(`Редактирование задачи #${id}`, 'info');
        
    } catch (error) {
        console.error('Ошибка при загрузке задачи:', error);
        showMessage(`Ошибка: ${error.message}`, 'error');
    }
}

// Открытие модального окна для удаления
async function openDeleteModal(id) {
    taskToDeleteId = id;
    
    try {
        // Получаем данные задачи для показа в модальном окне
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка загрузки данных задачи: ${response.status}`);
        }
        
        taskToDeleteData = await response.json();
        
        // Заполняем модальное окно
        modalMessage.textContent = `Вы уверены, что хотите удалить задачу #${id}?`;
        
        const description = taskToDeleteData.description || '—';
        taskPreview.innerHTML = `
            <h4>${escapeHtml(taskToDeleteData.title)}</h4>
            <p><strong>Описание:</strong> ${escapeHtml(description)}</p>
            <p><strong>Приоритет:</strong> 
                <span class="priority-badge priority-${taskToDeleteData.priority}">
                    ${getPriorityLabel(taskToDeleteData.priority)}
                </span>
            </p>
        `;
        
        // Показываем модальное окно
        deleteModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Ошибка при загрузке данных задачи:', error);
        showMessage(`Ошибка: ${error.message}`, 'error');
    }
}

// Закрытие модального окна
function closeModal() {
    deleteModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    taskToDeleteId = null;
    taskToDeleteData = null;
}

// Подтверждение удаления
async function confirmDelete() {
    if (!taskToDeleteId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${taskToDeleteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(extractErrorMessage(errorData) || `Ошибка удаления: ${response.status}`);
        }
        
        showMessage('Задача успешно удалена!', 'success');
        closeModal();
        
        // Удаляем строку из таблицы
        const row = document.querySelector(`tr[data-task-id="${taskToDeleteId}"]`);
        if (row) {
            row.remove();
        }
        
        // Очищаем результаты поиска
        searchResult.innerHTML = '';
        searchResult.classList.remove('show');
        searchIdField.value = '';
        
        // Обновляем список
        await loadTasks();
        
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showMessage(`Ошибка: ${error.message}`, 'error');
        closeModal();
    }
}

// Сброс формы
function resetForm() {
    taskForm.reset();
    taskIdField.value = '';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Создать задачу';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-primary');
    
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

// Вспомогательные функции
function getPriorityLabel(priority) {
    const labels = {
        'low': 'Низкий',
        'medium': 'Средний', 
        'high': 'Высокий'
    };
    return labels[priority] || priority;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Сообщения пользователю
function showMessage(msg, type) {
    if (!messageArea) return;
    
    // Убираем префикс "Ошибка: " если он уже есть
    let displayMessage = msg;
    if (displayMessage.startsWith('Ошибка: ')) {
        displayMessage = displayMessage.substring(8);
    }
    
    // Убираем код статуса если есть
    displayMessage = displayMessage.replace(/Ошибка сервера: \d+/, 'Ошибка сервера');
    
    const alertClass = type === 'error' ? 'message-error' : 'message-success';
    
    messageArea.innerHTML = `
        <div class="message ${alertClass}">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            <span>${displayMessage}</span>
        </div>
    `;
    
    setTimeout(() => {
        messageArea.innerHTML = '';
    }, 4000);
}

// Экспортируем функции
window.editTask = editTask;
window.openDeleteModal = openDeleteModal;
window.searchTaskById = searchTaskById;
window.highlightTaskInTable = highlightTaskInTable;