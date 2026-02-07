from unittest.mock import Mock
import pytest
from backend.database import PureDatabase
from backend.task import TaskService
from backend.database import PureDatabase


@pytest.fixture
def mock_database()->Mock:
    """Фикстура для мока базы данных"""
    mock_db = Mock()
    mock_db = Mock(spec=PureDatabase, autospec=True) 
    return mock_db

@pytest.fixture
def task_service(mock_database) -> TaskService:
    """Фикстура для сервиса задач с подмененной БД"""
    service = TaskService()
    service.db = mock_database  
    return service

@pytest.fixture
def mock_task_service():
    """Мок TaskService (для тестирования исключений)"""
    return Mock(spec=TaskService)