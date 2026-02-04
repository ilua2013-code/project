import pytest
from unittest.mock import Mock
from api.model import PriorityModel, TaskRequest, TaskResponse
from api.task import TaskService

@pytest.mark.unit
class TestTaskService:
    
    def test_create_task(self, task_service: TaskService, mock_database: Mock):
        mock_database.sql_insert_task.return_value = 1
        
        result = task_service.create(title='Задача', description ='Задача на день', priority=PriorityModel.LOW)
        
        expect_resuly = TaskResponse(
            id= 1,
            title = 'Задача',
            description ='Задача на день',
            priority=PriorityModel.LOW
        )
        
        
        assert result==expect_resuly
        assert mock_database.sql_insert_task.call_count == 1

    @pytest.mark.parametrize('title',['', None])
    def test_create_task_inavalid_value(self, task_service: TaskService, title: str, mock_database: Mock):
        
        with pytest.raises(ValueError) as expect:
            task_service.create(
                title=title, 
                description ='Задача на день', 
                priority=PriorityModel.LOW)
        
        mock_database.sql_insert_task.assert_not_called()
        assert mock_database.sql_insert_task.call_count == 0
        assert "Title cannot be empty" in str(expect.value)

    def test_get_all_task(self, task_service: TaskService, mock_database: Mock):
        data = [{
            'id': 1,
            'title': 'Позвонить маме',
            'description': 'Поздравить с днем рождения',
            'priority': 'high'
            },
        {
            'id': 2,
            'title': 'Купить продукты',
            'description': 'Молоко, хлеб, яйца',
            'priority': 'medium',
            }]
        
        mock_database.sql_select_all_tasks.return_value = data
        task_dict = [task.model_dump() for task in task_service.get_all()]
        assert mock_database.sql_select_all_tasks.call_count == 1
        assert task_dict == data

    def test_get_task_on_id(self, task_service: TaskService, mock_database: Mock):
        data = {
            'id': 1,
            'title': 'Позвонить маме',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
            }
        
        mock_database.sql_select_task_by_id.return_value=data
        result = task_service.get(task_id=1)
        assert mock_database.sql_select_task_by_id.call_count == 1
        assert result.model_dump()==data

    def test_get_task_on_invalid_id(self, task_service: TaskService, mock_database: Mock):
        mock_database.sql_select_task_by_id.return_value = None
        task_id=999
        with pytest.raises(ValueError) as expect:
            task_service.get(task_id)
        
        assert str(expect.value) == f"Task with id {task_id} not found"


    def test_update_task(self, task_service: TaskService, mock_database: Mock):
        task_id = 1
        
        old_data = {
        'id': task_id,
        'title': 'Позвонить маме',
        'description': 'Поздравить с днем рождения',
        'priority': 'medium'
    }
    
        new_data = {
            'id': task_id,
            'title': 'Позвонить',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        
        data_update = {
            'title': 'Позвонить',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        mock_database.sql_select_task_by_id.side_effect = [old_data, new_data]
        mock_database.sql_update_task.return_value = data_update
        
        
        result = task_service.update(new_data['id'], TaskRequest(**data_update))
        assert mock_database.sql_update_task.call_count == 1
        assert result.title == data_update['title']


    def test_update_task_with_invalid_id(self, mock_database, task_service):
        task_id = 999
        data = {
                'title': 'Позвонить',
                'description': 'Поздравить с днем рождения',
                'priority': 'medium'
            }
        mock_database.sql_select_task_by_id.return_value = None
        with pytest.raises(ValueError) as expect:
            task_service.update(task_id, TaskRequest(**data))

        
            
        assert mock_database.sql_select_task_by_id.call_count == 1
        assert str(expect.value) == f"Task with id {task_id} not found"

    
    def test_update_task_not_found_after_verification(self, mock_database, task_service):
        task_id = 1
        data = {
            'id': task_id,
            'title': 'Позвонить маме',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        mock_database.sql_select_task_by_id.return_value = data
        mock_database.sql_select_task_by_id.return_value = None
        
        with pytest.raises(ValueError) as expect:
            task_service.update(data['id'], TaskRequest(**data))

          
        assert mock_database.sql_select_task_by_id.call_count == 1
        assert str(expect.value) == f"Task with id {task_id} not found"
        
    def test_delete_task(self, mock_database, task_service):
        task_id = 1
        data = {
            'id': task_id,
            'title': 'Позвонить маме',
            'description': 'Поздравить с днем рождения',
            'priority': 'medium'
        }
        mock_database.sql_select_task_by_id.return_value = data
        mock_database.sql_delete_task.return_value = True
        result = task_service.delete(task_id)
            
        assert mock_database.sql_select_task_by_id.call_count == 1
        assert mock_database.sql_delete_task.call_count == 1
        assert result is True


    def test_api_delete_task_with_invalid_id(self, mock_database, task_service):
        task_id = 999 
        mock_database.sql_select_task_by_id.return_value = None 
        with pytest.raises(ValueError) as expect:
            task_service.delete(task_id)
            
        assert mock_database.sql_select_task_by_id.call_count == 1
        assert mock_database.sql_delete_task.call_count == 0
        assert str(expect.value) == f"Task with id {task_id} not found"
        