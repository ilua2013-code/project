from unittest.mock import patch
from fastapi import status
import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.model import TaskResponse, PriorityModel
from backend.app import app



@pytest.mark.api_unit
class TestApi:
    client = TestClient(app)

    @pytest.fixture(autouse=True)
    def setup_mock_service(self, mock_task_service):
        with patch('backend.app.task_service', mock_task_service):
            yield


    
    def test_api_create_task(self, mock_task_service):
        mock_task_service.create.return_value = TaskResponse(
        id=1,
        title='Задача',
        description='Задача на день',
        priority=PriorityModel.LOW
    )
        
        response = self.client.post("/api/v1/tasks", json={
        "title": "Задача",
        "description": "Задача на день",
        "priority": "low"
    })
    
        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        
        assert response_data["id"] == 1
        assert response_data["title"] == "Задача"
        assert response_data["description"] == "Задача на день"
        assert response_data["priority"] == "low"
        
        mock_task_service.create.assert_called_once_with(
            title="Задача",
            description="Задача на день",
            priority="low"
        )
    
    @pytest.mark.parametrize('title', ['', None])
    def test_api_create_task_invalid_value(self, mock_task_service, title):
        
        response = self.client.post("/api/v1/tasks", json={
            "title": title,
            "description": "Задача на день",
            "priority": "low"
        })

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        mock_task_service.create.assert_not_called()

    def test_create_task_validation_error(self, mock_task_service):
        mock_task_service.create.side_effect = ValueError(
            "Task with this title already exists"
        )
        
        response = self.client.post("/api/v1/tasks", json={
            "title": "Существующая задача",
            "description": "Описание",
            "priority": "medium"
        })
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
        mock_task_service.create.assert_called_once()


    def test_api_get_all_task(self, mock_task_service):
        data = [
            {
                'id': 1,
                'title': 'Позвонить маме',
                'description': 'Поздравить с днем рождения',
                'priority': 'high'
            },
            {
                'id': 2,
                'title': 'Купить продукты',
                'description': 'Молоко, хлеб, яйца',
                'priority': 'medium'
            }
        ]
        
        mock_task_service.get_all.return_value = data
        response = self.client.get("/api/v1/tasks")
    
        assert response.status_code == 200
        assert mock_task_service.get_all.call_count == 1
        response_data = response.json()
        assert response_data == data

    def test_get_task_value_error(self, mock_task_service):
        mock_task_service.get.side_effect = ValueError("Invalid task ID format")
        
        response = self.client.get("/api/v1/tasks/123")  
        
        assert response.status_code == 404
        assert "Invalid task ID format" in response.json()["detail"]
        mock_task_service.get.assert_called_once_with(123)


    def test_api_get_task_on_id(self, mock_task_service):
        data = {
            'id': 1,
            'title': 'Позвонить маме',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        
        mock_task_service.get.return_value = data
        
        response = self.client.get("/api/v1/tasks/1")
        
        assert response.status_code == status.HTTP_200_OK
        assert mock_task_service.get.call_count == 1
        assert response.json() == data

    def test_api_get_task_on_invalid_id(self, mock_task_service):
        task_id = 999
        mock_task_service.get.return_value = None
        
        response = self.client.get(f"/api/v1/tasks/{task_id}")
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Task not found"
        mock_task_service.get.assert_called_once_with(999)


    def test_api_update_task(self, mock_task_service):
        task_id = 1
        
        updated_data = {
            'id': task_id,
            'title': 'Позвонить',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        
        mock_task_service.update.return_value = updated_data
        
        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={
                'title': 'Позвонить',
                'description': 'Поздравить с днем рождения',
                'priority': 'medium'
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == updated_data 
        mock_task_service.update.assert_called_once()


    def test_api_update_task_with_invalid_id(self, mock_task_service):
        task_id = 999
        mock_task_service.update.side_effect = ValueError(
            f"Task with id {task_id} not found")
        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={
                'title': 'Позвонить',
                'description': 'Поздравить с днем рождения',
                'priority': 'medium'
            }
        )
        assert mock_task_service.update.call_count == 1
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()['detail'] == f"Task with id {task_id} not found"


    def test_api_update_task_missing_title_field(self, mock_task_service):
        task_id = 1
        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={
                'description': 'Поздравить с днем рождения',
                'priority': 'medium'
            }
        )
        
        mock_task_service.update.assert_not_called() 
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

    def test_update_task_other_error(self, mock_task_service):
        task_id = 1
        mock_task_service.update.side_effect = ValueError(
            "Cannot update completed task"
        )
        
        response = self.client.put(f"/api/v1/tasks/{task_id}", json={
            "title": "Обновленная",
            "description": "Описание",
            "priority": "medium"
        })
        
        assert response.status_code == 400
        assert "cannot update" in response.json()["detail"].lower()
        mock_task_service.update.assert_called_once()
 
    def test_api_delete_task(self, mock_task_service):
        task_id = 1
        mock_task_service.delete.return_value = True
        response = self.client.delete(
            f"/api/v1/tasks/{task_id}"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"message": "Task deleted successfully"}
        mock_task_service.delete.assert_called_once_with(task_id)

    def test_api_delete_task_with_invalid_id(self, mock_task_service):
        task_id = 999
        mock_task_service.delete.side_effect = ValueError(
            f"Task with id {task_id} not found")
        response = self.client.delete(
            f"/api/v1/tasks/{task_id}"
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()['detail'] == f"Task with id {task_id} not found"
        mock_task_service.delete.assert_called_once_with(task_id)
    
    
    def test_delete_task_other_error(self, mock_task_service):
        task_id = 1
        mock_task_service.delete.side_effect = ValueError(
            "Cannot delete completed task"
        )
        
        response = self.client.delete(f"/api/v1/tasks/{task_id}")
        
        assert response.status_code == 400
        assert "cannot delete" in response.json()["detail"].lower()
        mock_task_service.delete.assert_called_once_with(1)

    