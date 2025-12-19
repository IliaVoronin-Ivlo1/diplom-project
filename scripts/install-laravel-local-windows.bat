@echo off
echo Установка Laravel 11 на локальной машине (Windows)

where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo Composer не найден. Установите Composer: https://getcomposer.org/
    exit /b 1
)

echo Проверка версии Composer
composer --version

cd backend

echo Установка Laravel 11
composer create-project --prefer-dist laravel/laravel . "11.*"

echo Копирование конфигурации окружения
copy .env.example .env

echo Генерация ключа приложения
php artisan key:generate

echo Установка пакетов для WebSocket
composer require beyondcode/laravel-websockets
composer require predis/predis

echo.
echo Laravel успешно установлен на локали
echo Теперь обновите файл backend\.env с настройками БД:
echo.
echo DB_CONNECTION=pgsql
echo DB_HOST=postgres
echo DB_PORT=5432
echo DB_DATABASE=Corstat
echo DB_USERNAME=Corstat
echo DB_PASSWORD=Rhtyltkm1#
echo.
echo REDIS_HOST=redis
echo REDIS_PASSWORD=redis_pass_2024
echo REDIS_PORT=6379
echo.
echo Затем запустите: docker-compose up -d

