.PHONY: build up down restart logs ps install clean backend-install frontend-install

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

ps:
	docker-compose ps

install: backend-install build up frontend-install

backend-install:
	chmod +x scripts/install-laravel-local.sh
	./scripts/install-laravel-local.sh

backend-setup-websocket:
	chmod +x scripts/setup-websocket-local.sh
	./scripts/setup-websocket-local.sh

frontend-install:
	docker-compose run --rm frontend npm install

clean:
	docker-compose down -v
	docker system prune -f

migrate:
	docker-compose exec backend php artisan migrate

migrate-fresh:
	docker-compose exec backend php artisan migrate:fresh --seed

queue-work:
	docker-compose exec backend php artisan queue:work

cache-clear:
	docker-compose exec backend php artisan cache:clear
	docker-compose exec backend php artisan config:clear
	docker-compose exec backend php artisan route:clear

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-postgres:
	docker-compose exec postgres psql -U Corstat -d Corstat

shell-redis:
	docker-compose exec redis redis-cli -a redis_pass_2024

health:
	@echo "Проверка состояния сервисов"
	@curl -s http://localhost:8080/api/health || echo "Backend недоступен"
	@curl -s http://localhost:3001 || echo "Frontend недоступен"
	@curl -s http://localhost:8001 || echo "Supplier Rating Service недоступен"
	@curl -s http://localhost:8002 || echo "Parts Matching Service недоступен"
	@curl -s http://localhost:8003 || echo "Price Analysis Service недоступен"
	@curl -s http://localhost:8004 || echo "Quality Control Service недоступен"

