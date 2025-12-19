@echo off
echo Начало установки проекта (Windows)
echo.

echo Шаг 1: Установка Laravel на локальной машине
call scripts\install-laravel-local-windows.bat
if %errorlevel% neq 0 exit /b 1

echo.
echo Шаг 2: Установка WebSocket компонентов
call scripts\setup-websocket-local-windows.bat

echo.
echo Шаг 3: Сборка Docker контейнеров
docker-compose build

echo Шаг 4: Запуск контейнеров
docker-compose up -d

echo Ожидание запуска сервисов...
timeout /t 5 /nobreak >nul

echo Шаг 5: Установка зависимостей Frontend
docker-compose run --rm frontend npm install

echo Ожидание запуска базы данных...
timeout /t 10 /nobreak >nul

echo Шаг 6: Выполнение миграций
docker-compose exec -T backend php artisan migrate --force

echo.
echo Установка завершена!
echo Frontend доступен на http://localhost:3001
echo Backend API доступен на http://localhost:8080/api
echo Nginx доступен на http://localhost:8080

