#!/bin/bash

echo "Запуск всех сервисов"
docker-compose up -d

echo "Проверка состояния контейнеров"
docker-compose ps

echo "Все сервисы запущены"
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:8080/api"
echo "Nginx: http://localhost:8080"
echo "PostgreSQL: localhost:5433"
echo "Redis: localhost:6380"
echo "Supplier Rating Service: http://localhost:8001"
echo "Parts Matching Service: http://localhost:8002"
echo "Price Analysis Service: http://localhost:8003"
echo "Quality Control Service: http://localhost:8004"

