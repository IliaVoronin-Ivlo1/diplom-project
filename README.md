# Архитектура проекта

## Общая схема

Проект построен на микросервисной архитектуре с использованием Docker контейнеров. Все сервисы изолированы и общаются между собой через выделенную Docker bridge сеть.

## Компоненты системы

### 1. Frontend Layer (Презентационный слой)

**Next.js 14**
- Порт: 3001
- Роль: Клиентское приложение
- Технологии: React, TypeScript, Socket.IO Client
- Функции:
  - Отображение пользовательского интерфейса
  - Real-time обновления через WebSocket
  - HTTP запросы к Backend API
  - Клиентская валидация

### 2. Reverse Proxy Layer

**Nginx**
- HTTP порт: 8080
- HTTPS порт: 8443
- Роль: Веб-сервер и обратный прокси
- Функции:
  - Маршрутизация запросов к Backend и Frontend
  - Обработка статических файлов
  - SSL/TLS терминация
  - Load balancing
  - Кеширование статических ресурсов
  - WebSocket proxy для real-time соединений

### 3. Backend Layer (Бизнес-логика)

**Laravel 11**
- Порт: 9001 (PHP-FPM на 9000)
- Роль: Основной API сервер
- Технологии: PHP 8.2, Laravel 11, PHP-FPM
- Функции:
  - REST API endpoints
  - Бизнес-логика приложения
  - Аутентификация и авторизация
  - WebSocket сервер (Laravel WebSockets)
  - Управление очередями (Queue)
  - Взаимодействие с микросервисами
  - Кеширование через Redis

#### WebSocket сервис

Класс `WebSocketService` предоставляет API для:
- Отправки сообщений в каналы
- Широковещательной рассылки
- Отправки сообщений конкретным пользователям
- Отправки в комнаты (rooms)
- Мониторинга активных подключений

### 4. Microservices Layer (Микросервисы)

**4 Python сервиса на FastAPI**

Порты: 8001, 8002, 8003, 8004

Каждый сервис:
- Независимо развертывается
- Имеет свою область ответственности
- Общается с PostgreSQL и Redis
- Предоставляет REST API
- Может быть масштабирован горизонтально

Типичные задачи микросервисов:
- Обработка данных
- Аналитика
- Интеграции с внешними API
- Фоновая обработка
- Специализированные вычисления

### 5. Data Layer (Слой данных)

#### PostgreSQL
- Порт: 5433 (внутренний 5432)
- Роль: Основная реляционная БД
- Функции:
  - Хранение структурированных данных
  - Транзакционность
  - Сложные запросы и JOIN'ы
  - Индексы и оптимизация
  - Полнотекстовый поиск
- Автоматическая инициализация из бекапов

#### Redis
- Порт: 6380 (внутренний 6379)
- Роль: In-memory NoSQL БД
- Функции:
  - Кеширование данных
  - Session storage
  - Queue broker для Laravel
  - Pub/Sub для WebSocket
  - Rate limiting
  - Временное хранение данных

### 6. Background Processing Layer

**Supervisor**
- Роль: Менеджер процессов
- Управляемые процессы:
  - Laravel Queue Workers (2 процесса)
  - Laravel WebSocket Server
- Функции:
  - Автоматический запуск процессов
  - Автоматический перезапуск при падении
  - Логирование процессов
  - Управление ресурсами
  - Graceful shutdown

## Потоки данных

### 1. HTTP Request Flow

```
Клиент → Nginx:8080 → Frontend:3000 → Отображение UI
                   ↓
                Backend:9000 → API Logic
                   ↓
              PostgreSQL:5432 ← → Redis:6379
                   ↓
           Python Services:8001-8004
```

### 2. WebSocket Flow

```
Клиент ← → Nginx:8080 ← → Backend:6001 (WebSocket Server)
                              ↓
                          Redis Pub/Sub
                              ↓
                    Broadcast to all clients
```

### 3. Queue Processing Flow

```
Backend → Redis Queue → Supervisor → Queue Workers
                                          ↓
                                   Process Jobs
                                          ↓
                                   PostgreSQL/APIs
```

### 4. Microservices Communication

```
Backend ← HTTP → Python Service 1
        ← HTTP → Python Service 2
        ← HTTP → Python Service 3
        ← HTTP → Python Service 4
          ↓            ↓
      PostgreSQL   Redis (cache)
```

## Сетевая архитектура

### Bridge Network: diplom_bridge_network

Все контейнеры находятся в изолированной Docker bridge сети:

- Внутренняя связь по именам контейнеров
- Контейнеры видят друг друга по DNS именам
- Изоляция от внешней сети
- Контролируемый доступ через проброс портов

### Проброс портов

Наружу доступны только необходимые порты:

| Сервис | Внутренний | Внешний | Назначение |
|--------|-----------|---------|------------|
| Frontend | 3000 | 3001 | Доступ к UI |
| Nginx HTTP | 80 | 8080 | Основной вход |
| Nginx HTTPS | 443 | 8443 | SSL вход |
| Backend | 9000 | 9001 | Прямой доступ к PHP-FPM |
| PostgreSQL | 5432 | 5433 | Доступ к БД |
| Redis | 6379 | 6380 | Доступ к Redis |
| Python 1-4 | 8001-8004 | 8001-8004 | Доступ к микросервисам |

## Масштабирование

### Горизонтальное

Можно масштабировать:
- Python микросервисы (добавить больше экземпляров)
- Laravel Queue Workers (увеличить numprocs в Supervisor)
- Frontend (через load balancer)

### Вертикальное

Можно увеличить ресурсы:
- CPU и RAM для контейнеров
- PostgreSQL connections pool
- Redis memory limit

## Безопасность

### Network Level
- Изолированная Docker сеть
- Минимальный проброс портов
- Firewall на хосте

### Application Level
- Пароли для БД и Redis
- Laravel middleware для API
- CORS настройки
- Rate limiting через Redis
- Input validation

### Container Level
- Non-root пользователи в контейнерах
- Read-only файловые системы где возможно
- Ограничение ресурсов

## Мониторинг и логирование

### Логи

- **Application logs**: Laravel logs в `/var/www/storage/logs`
- **Web server logs**: Nginx logs в `./nginx/logs`
- **Worker logs**: Supervisor logs в `./supervisor/logs`
- **Container logs**: `docker-compose logs`

### Health Checks

Endpoints для проверки здоровья:
- Backend: `GET /api/health`
- Python Services: `GET /health`
- Frontend: `GET /` (статус 200)

### Мониторинг

- Docker stats для ресурсов
- Redis INFO для кеша
- PostgreSQL pg_stat для БД
- Laravel Telescope (опционально)
- WebSocket статистика через API

## Резервное копирование

### База данных

Автоматическая инициализация из бекапов в `database/backups/`:
- При первом запуске выполняются все .sql файлы
- Файлы выполняются в алфавитном порядке

Ручной бекап:
```bash
docker-compose exec postgres pg_dump -U diplom_user diplom_db > backup.sql
```

### Volumes

Docker volumes для персистентности:
- `diplom_postgres_data` - данные PostgreSQL
- `diplom_redis_data` - данные Redis

## CI/CD Integration

Проект готов для интеграции с:
- GitHub Actions
- GitLab CI
- Jenkins
- Travis CI

Этапы CI/CD:
1. Build Docker images
2. Run tests
3. Push to registry
4. Deploy to staging/production

## Развертывание в Production

### Изменения для production:

1. **Переменные окружения**
   - APP_DEBUG=false
   - APP_ENV=production
   - Сильные пароли

2. **SSL сертификаты**
   - Let's Encrypt
   - Коммерческие сертификаты

3. **Оптимизация**
   - Кеширование конфигураций Laravel
   - Минификация Frontend
   - Compression в Nginx

4. **Мониторинг**
   - Sentry для ошибок
   - New Relic для производительности
   - Prometheus + Grafana для метрик

5. **Резервное копирование**
   - Автоматические бекапы БД
   - Репликация Redis
   - Off-site хранение

## Технологический стек

### Backend
- PHP 8.2
- Laravel 11
- Composer
- PHP-FPM

### Frontend
- Node.js 20
- Next.js 14
- React 18
- TypeScript
- Socket.IO Client

### Microservices
- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy
- Redis-py
- Psycopg2

### Infrastructure
- Docker & Docker Compose
- Nginx
- PostgreSQL 15
- Redis 7
- Supervisor

### Development Tools
- Git
- Make
- Bash scripts

## Требования к серверу

### Minimum
- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB SSD
- OS: Linux (Ubuntu 20.04+)

### Recommended
- CPU: 8 cores
- RAM: 16 GB
- Disk: 100 GB SSD
- OS: Linux (Ubuntu 22.04+)

### Production
- CPU: 16+ cores
- RAM: 32+ GB
- Disk: 200+ GB NVMe SSD
- OS: Linux (Ubuntu 22.04 LTS)
- Network: Gigabit+

