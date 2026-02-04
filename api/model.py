from pydantic import BaseModel, Field

from enum import StrEnum

    
class PriorityModel(StrEnum):
    LOW = "low"         
    MEDIUM = "medium"    
    HIGH = "high"        


class TaskModel(BaseModel):
    title: str = Field(min_length=1, max_length=30)
    description: str = Field(min_length=1, max_length=50)
    priority: PriorityModel = PriorityModel.MEDIUM

class TaskResponse(TaskModel):
    id: int
    
class TaskRequest(TaskModel):
    pass