import pysqlite3 as sqlite3
from typing import List, Optional, Dict, Any  


class PureDatabase:
    def __init__(self, db_path: str = "tasks.db"):
        self.db_path = db_path
        self._create_table()
    
    def _create_table(self):
        """Создать таблицу если не существует"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'medium' 
            )
        ''')
        conn.commit()
        conn.close()

    def _get_connection(self) -> sqlite3.Connection:
        """Получить соединение с БД"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  
        return conn
    
    
    def _fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]: 
        """Выполнить запрос и получить все результаты"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]  
    
    def _fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:  
        """Выполнить запрос и получить одну запись"""
        conn = self._get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None  
    
    
    def sql_insert_task(self, title: str, description: str, priority: str) -> int: 
        """Вставить задачу в БД, вернуть ID"""
        conn = self._get_connection()
        cursor = conn.cursor()
    
        cursor.execute(
            'INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)',
            (title, description if description else "", priority)  
        )
        task_id = cursor.lastrowid  
    
        conn.commit()
        conn.close()
    
        return task_id  
    
    def sql_select_all_tasks(self) -> List[Dict[str, Any]]:
        """Выбрать все задачи"""
        return self._fetch_all('SELECT * FROM tasks ORDER BY id')
    
    def sql_select_task_by_id(self, task_id: int) -> Optional[Dict[str, Any]]:  
        """Выбрать задачу по ID"""
        return self._fetch_one('SELECT * FROM tasks WHERE id = ?', (task_id,))
    
    def sql_update_task(self, task_id: int, title: str, description: str, priority: str) -> bool:
        """Обновить задачу"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?',
            (title, description if description else "", priority, task_id)
        )
        
        updated = cursor.rowcount > 0  
        
        conn.commit()
        conn.close()
        
        return updated  

    def sql_delete_task(self, task_id: int) -> bool:
        """Удалить задачу"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        
        deleted = cursor.rowcount > 0 
        
        conn.commit()
        conn.close()
        
        return deleted  