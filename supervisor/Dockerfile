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

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord"]

