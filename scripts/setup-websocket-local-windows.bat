@echo off
echo Установка WebSocket компонентов (локально, Windows)

cd backend

echo Публикация конфигурации WebSockets
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"

echo Создание директории для сервисов
if not exist "app\Services" mkdir app\Services

echo Копирование WebSocket файлов
copy ..\websocket-files\WebSocketService.php app\Services\
copy ..\websocket-files\WebSocketController.php app\Http\Controllers\

echo Копирование маршрутов
copy ..\websocket-files\api-routes.php routes\api.php

echo Выполнение миграций
php artisan migrate

echo Очистка кеша
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo.
echo WebSocket компоненты установлены
echo.
echo Осталось:
echo 1. Зарегистрировать WebSocketService в app\Providers\AppServiceProvider.php
echo 2. Добавить в метод register():
echo    $this-^>app-^>singleton(\App\Services\WebSocketService::class, function ($app) {
echo        return new \App\Services\WebSocketService();
echo    });

