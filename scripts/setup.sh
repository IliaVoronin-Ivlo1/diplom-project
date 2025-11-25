#!/bin/bash

echo "Начало установки проекта"

echo "Шаг 1: Установка Laravel на локальной машине"
chmod +x scripts/install-laravel-local.sh
./scripts/install-laravel-local.sh

echo ""
echo "Шаг 2: Установка WebSocket компонентов"
chmod +x scripts/setup-websocket-local.sh
./scripts/setup-websocket-local.sh

echo ""
echo "Шаг 3: Сборка Docker контейнеров"
docker-compose build

echo "Шаг 4: Запуск контейнеров"
docker-compose up -d

echo "Ожидание запуска сервисов"
sleep 5

echo "Шаг 5: Установка зависимостей Frontend"
docker-compose run --rm frontend npm install

echo "Ожидание запуска базы данных"
sleep 10

echo "Шаг 6: Выполнение миграций"
docker-compose exec -T backend php artisan migrate --force

echo ""
echo "Установка завершена"
echo "Frontend доступен на http://localhost:3001"
echo "Backend API доступен на http://localhost:8080/api"
echo "Nginx доступен на http://localhost:8080"

