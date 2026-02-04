# Unit Task 

REST API для управления задачами с использованием Python, FastAPI/Flask и базой данных.

## Особенности

- Полный CRUD (Create, Read, Update, Delete) для задач
- Валидация входных данных
- Обработка ошибок и исключений
- Модульные тесты с моками
- Контейнеризация с Docker

## Технологии

- **Python 3.11+**
- **FastAPI** или **Flask** (основа API)
- **Pydantic** (валидация данных)
- **Pytest** (тестирование)
- **Docker** (контейнеризация)
- **Allure** (отчеты о тестировании)


## Запуск тестов

python -m pytest tests/ -v

# Только API тесты
python -m pytest -k "TestApi" 

# С покрытием кода
python -m pytest --cov=api --cov-report=term-missing

# Генерация Allure отчетов
python -m pytest --alluredir=./allure-results