#!/bin/sh

echo "Ожидание PostgreSQL"
until php artisan db:monitor > /dev/null 2>&1; do
    echo "PostgreSQL недоступен - ожидание"
    sleep 2
done

echo "PostgreSQL доступен - продолжение"

if [ -f "artisan" ]; then
    echo "Выполнение миграций"
    php artisan migrate --force
    
    echo "Очистка кеша"
    php artisan config:clear
    php artisan cache:clear
    php artisan route:clear
    
    echo "Настройка прав доступа"
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
    
    echo "Backend готов к работе"
fi

exec php-fpm

