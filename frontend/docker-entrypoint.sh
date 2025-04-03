#!/bin/sh

# Establecer puerto predeterminado si no se especifica
export PORT=${PORT:-80}

# Procesar variables de entorno en la configuración de nginx
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Ejecutar el comando pasado como argumento
exec "$@" 