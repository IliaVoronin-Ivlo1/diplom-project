FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    supervisor \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d

COPY supervisord.conf /etc/supervisor/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]

