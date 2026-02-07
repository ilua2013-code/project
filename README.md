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
Шаг 2: Запуск приложения
bash

# Запуск всех сервисов в фоновом режиме
docker-compose up -d

# Проверка статуса
docker-compose ps

Шаг 3: Открытие в браузере
Фронтенд: http://localhost:3000

Бэкенд API: http://localhost:8000

Документация API: http://localhost:8000/docs


# Запуск всех тестов (26 тестов)
docker-compose up tests

# Запуск с пересборкой
docker-compose up --build tests

# Запуск с детальным выводом
docker-compose run --rm tests pytest tests_backend/ -v

# Только API тесты (16 тестов)
docker-compose run --rm tests pytest tests_backend/ -k "TestApi" -v

# Только юнит-тесты сервисов (10 тестов)

docker-compose run --rm tests pytest tests_backend/ -k "TestTaskService" -v

# С покрытием кода
python -m pytest --cov=api --cov-report=term-missing

# остановить сервисы
docker-compose stop  # остановить сервисы

# остановить и удалить контейнеры
docker-compose down  # остановить и удалить контейнеры