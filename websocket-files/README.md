# WebSocket файлы для установки после Laravel

После установки Laravel выполните следующие шаги:

## 1. Установить пакет Laravel WebSockets

```bash
docker-compose exec backend composer require beyondcode/laravel-websockets
docker-compose exec backend composer require predis/predis
```

## 2. Опубликовать конфигурацию

```bash
docker-compose exec backend php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

## 3. Скопировать WebSocket сервис

Скопируйте файл `WebSocketService.php` в `backend/app/Services/`

```bash
mkdir -p backend/app/Services
cp websocket-files/WebSocketService.php backend/app/Services/
```

## 4. Скопировать WebSocket контроллер

Скопируйте файл `WebSocketController.php` в `backend/app/Http/Controllers/`

```bash
cp websocket-files/WebSocketController.php backend/app/Http/Controllers/
```

## 5. Обновить маршруты API

Добавьте содержимое файла `api-routes.php` в `backend/routes/api.php`

## 6. Обновить конфигурацию WebSockets (опционально)

Если хотите использовать кастомную конфигурацию:

```bash
cp websocket-files/websockets-config.php backend/config/websockets.php
```

## 7. Зарегистрировать сервис в AppServiceProvider

Добавьте в `backend/app/Providers/AppServiceProvider.php` в метод `register()`:

```php
$this->app->singleton(WebSocketService::class, function ($app) {
    return new WebSocketService();
});
```

## 8. Обновить .env файл

Убедитесь что в `.env` файле есть необходимые настройки:

```
REDIS_HOST=redis
REDIS_PASSWORD=redis_pass_2024
REDIS_PORT=6379

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

WEBSOCKETS_HOST=0.0.0.0
WEBSOCKETS_PORT=6001
```

## 9. Выполнить миграции

```bash
docker-compose exec backend php artisan migrate
```

## 10. Запустить WebSocket сервер

WebSocket сервер будет запущен через Supervisor автоматически.

Для ручного запуска:

```bash
docker-compose exec backend php artisan websockets:serve
```

## Использование

После установки вы сможете использовать WebSocket сервис:

```php
use App\Services\WebSocketService;

$ws = app(WebSocketService::class);

$ws->send('event_name', ['data' => 'value']);
$ws->broadcast('event_name', ['data' => 'value']);
$ws->sendToUser(1, 'notification', ['message' => 'Hello']);
```

## API Endpoints

- POST /api/websocket/send
- POST /api/websocket/broadcast
- POST /api/websocket/send-to-user
- GET /api/websocket/stats
- GET /api/websocket/user/{userId}/online

