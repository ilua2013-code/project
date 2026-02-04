from typing import List, Optional
from api.database import PureDatabase
from api.model import PriorityModel, TaskRequest, TaskResponse

class TaskService:
    def __init__(self):
        self.db = PureDatabase()
    
    def create(
            self, 
            title: str, 
            description: str = None, 
            priority: PriorityModel = PriorityModel.MEDIUM
            ) -> TaskResponse:
        """
        Создать новую задачу.
        """
        if title is None or (isinstance(title, str) and len(title) == 0):
            raise ValueError("Title cannot be empty")
        
        task_id = self.db.sql_insert_task(title, description, priority.value)
        
        return TaskResponse(
            id=task_id,
            title=title,
            description=description,
            priority=priority
        )
    
    def get_all(self) -> List[TaskResponse]:
        """
        Получить все задачи.
        """
        tasks_dict = self.db.sql_select_all_tasks()
        tasks = []
        for task in tasks_dict:
            try:
                task['priority'] = PriorityModel(task['priority'])
                tasks.append(TaskResponse(**task))
            except (ValueError, KeyError):
                continue
        return tasks
    
    def get(self, task_id: int) -> Optional[TaskResponse]:
        """
        Получить задачу по ID.
        """
        task_dict = self.db.sql_select_task_by_id(task_id)
        if not task_dict:
            raise ValueError(f"Task with id {task_id} not found")
        
        try:
            task_dict['priority'] = PriorityModel(task_dict['priority'])
            return TaskResponse(**task_dict)
        except (ValueError, KeyError):
            raise ValueError(f"Invalid priority '{task_dict.get('priority')}' for task {task_id}")
    
    def update(
            self, 
            task_id: int, 
            update_data: TaskRequest
            ) -> TaskResponse:
        """
        Обновить задачу.
        """

        existing = self.get(task_id)
        if not existing:
            raise ValueError(f"Task with id {task_id} not found") 
        
        
        success = self.db.sql_update_task(
            task_id, 
            update_data.title,          
            update_data.description,      
            update_data.priority.value   
        )
        if not success:
            raise ValueError(f"Failed to update task with id {task_id}")
        
        updated_task = self.get(task_id)
        if not updated_task:
            raise ValueError(f"Task with id {task_id} not found after update")
        
        return updated_task
    
    def delete(self, task_id: int) -> bool:
        """
        Удалить задачу.
        """
        existing = self.get(task_id)
        if not existing:
            raise ValueError(f"Task with id {task_id} not found") 
        return self.db.sql_delete_task(task_id)


task_service = TaskService()