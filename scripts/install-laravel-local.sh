#!/bin/bash

echo "Установка Laravel 11 на локальной машине"

if ! command -v composer &> /dev/null
then
    echo "Composer не найден. Установите Composer: https://getcomposer.org/"
    exit 1
fi

echo "Проверка версии Composer"
composer --version

cd backend

echo "Установка Laravel 11"
composer create-project --prefer-dist laravel/laravel . "11.*"

echo "Копирование конфигурации окружения"
cp .env.example .env

echo "Обновление настроек в .env"
sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=pgsql/' .env
sed -i 's/DB_HOST=127.0.0.1/DB_HOST=postgres/' .env
sed -i 's/DB_PORT=3306/DB_PORT=5432/' .env
sed -i 's/DB_DATABASE=laravel/DB_DATABASE=Corstat/' .env
sed -i 's/DB_USERNAME=root/DB_USERNAME=Corstat/' .env
sed -i 's/DB_PASSWORD=/DB_PASSWORD=Rhtyltkm1#/' .env

echo "" >> .env
echo "REDIS_HOST=redis" >> .env
echo "REDIS_PASSWORD=redis_pass_2024" >> .env
echo "REDIS_PORT=6379" >> .env
echo "" >> .env
echo "BROADCAST_DRIVER=redis" >> .env
echo "CACHE_DRIVER=redis" >> .env
echo "QUEUE_CONNECTION=redis" >> .env
echo "SESSION_DRIVER=redis" >> .env
echo "" >> .env
echo "WEBSOCKETS_HOST=0.0.0.0" >> .env
echo "WEBSOCKETS_PORT=6001" >> .env

echo "Генерация ключа приложения"
php artisan key:generate

echo "Установка пакетов для WebSocket"
composer require beyondcode/laravel-websockets
composer require predis/predis

echo "Laravel успешно установлен на локали"
echo "Теперь запустите контейнеры: docker-compose up -d"

