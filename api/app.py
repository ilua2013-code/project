from fastapi import APIRouter, FastAPI, HTTPException
from typing import List
from api.task import task_service  
from api.model import TaskModel, TaskResponse

app = FastAPI()

tasks_router = APIRouter(
    prefix="/api/v1/tasks",  
    tags=["tasks-service"]  
)

# ========== GET /api/v1/tasks ==========
@tasks_router.get('', response_model=List[TaskResponse])
def get_tasks():
    """Получить все задачи"""
    return task_service.get_all()

# ========== POST /api/v1/tasks ==========
@tasks_router.post("", response_model=TaskResponse)
def create_task(task: TaskModel):
    """Создать новую задачу"""
    try:
        return task_service.create(
            title=task.title,
            description=task.description,
            priority=task.priority
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== GET /api/v1/tasks/{task_id} ==========
@tasks_router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int): 
    """Получить задачу по ID"""
    try:
        task = task_service.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ========== PUT /api/v1/tasks/{task_id} ==========
@tasks_router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskModel):
    """Обновить задачу"""
    try:
        updated = task_service.update(
            task_id=task_id,
            update_data=task_update
        )
        return updated
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))

# ========== DELETE /api/v1/tasks/{task_id} ==========
@tasks_router.delete("/{task_id}")
def delete_task(task_id: int):
    """Удалить задачу"""
    try:
        task_service.delete(task_id)
        return {"message": "Task deleted successfully"}
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))

app.include_router(tasks_router)