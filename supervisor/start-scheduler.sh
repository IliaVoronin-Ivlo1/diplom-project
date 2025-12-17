#!/bin/sh
cd /var/www/backend
exec php artisan schedule:work

