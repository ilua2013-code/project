# Unit Test

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

## Запуск проекта

Шаг 1: Клонирование проекта
bash
git clone https://github.com/ilua2013-code/project
cd project

Шаг 2: Сборка образов
docker-compose build

шаг 3: Запуск всех сервисов в фоновом режиме
docker-compose up -d

шаг 4: Зайти в контейнер backend
docker exec -it task-backend-dev bash

шаг 5: Зайти в директорию с тестами 
cd /app

шаг 6: Запуск тестов 
pytest -m "api_unit"
pytest -m "unit"

шаг 7: Остановка
docker compose down 