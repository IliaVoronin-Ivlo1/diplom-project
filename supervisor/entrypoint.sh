#!/bin/bash

if [ "$1" = "supervisord" ]; then
    supervisord -c /etc/supervisor/supervisord.conf
    
    sleep 2
    
    if [ -d "/etc/supervisor/conf.d" ]; then
        supervisorctl reread
        supervisorctl update
    fi
    
    exec supervisord -c /etc/supervisor/supervisord.conf -n
else
    exec "$@"
fi

