FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd sockets \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

RUN echo '#!/bin/sh\n\
if [ -d "/var/www/storage" ]; then\n\
    chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true\n\
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true\n\
fi\n\
exec php-fpm' > /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

