#!/bin/bash
echo "Развертывание Task Manager..."
docker-compose down
docker-compose build
docker-compose up -d
echo "Готово! Фронтенд: http://localhost:3000, API: http://localhost:8000"