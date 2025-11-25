# Backend - Laravel 11

Laravel установлен локально и монтируется в Docker контейнер через volume.

## Что дальше

### 1. Настроить .env файл

Обновите `backend/.env` с настройками для Docker окружения:

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=Corstat
DB_USERNAME=Corstat
DB_PASSWORD=Rhtyltkm1#

REDIS_HOST=redis
REDIS_PASSWORD=redis_pass_2024
REDIS_PORT=6379

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

WEBSOCKETS_HOST=0.0.0.0
WEBSOCKETS_PORT=6001

SUPPLIER_RATING_SERVICE_URL=http://diplom_supplier_rating_service:8001
PARTS_MATCHING_SERVICE_URL=http://diplom_parts_matching_service:8002
PRICE_ANALYSIS_SERVICE_URL=http://diplom_price_analysis_service:8003
QUALITY_CONTROL_SERVICE_URL=http://diplom_quality_control_service:8004
```

### 2. Установить WebSocket пакеты

```bash
composer require beyondcode/laravel-websockets
composer require predis/predis
```

### 3. Установить WebSocket компоненты

**Linux/Mac:**
```bash
cd ..
chmod +x scripts/setup-websocket-local.sh
./scripts/setup-websocket-local.sh
```

**Windows:**
```batch
cd ..
scripts\setup-websocket-local-windows.bat
```

### 4. Запустить контейнеры

```bash
cd ..
docker-compose build
docker-compose up -d
```

### 5. Выполнить миграции

```bash
docker-compose exec backend php artisan migrate
```

## Работа с Laravel

### Локально (рекомендуется)

```bash
php artisan make:controller MyController
php artisan make:model MyModel -m
composer require package/name
php artisan migrate
```

### В контейнере

```bash
docker-compose exec backend php artisan make:controller MyController
docker-compose exec backend php artisan make:model MyModel -m
docker-compose exec backend composer require package/name
docker-compose exec backend php artisan migrate
```

## Структура

Laravel установлен со стандартной структурой:

```
backend/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
├── vendor/
├── .env
├── artisan
└── composer.json
```

## Документация

- [INSTALL_LARAVEL.md](../INSTALL_LARAVEL.md) - Полная инструкция
- [websocket-files/README.md](../websocket-files/README.md) - WebSocket документация
