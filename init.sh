#!/bin/bash

# Iniciar el servicio SSH
service ssh start

# Esperar a que el servicio SSH esté listo
while ! nc -z localhost 2222; do
  sleep 1
done

# Iniciar la aplicación
if [ "$NODE_ENV" = "production" ]; then
    # Para el backend
    cd /app
    npm install
    PORT=8000 npm start
else
    # Para desarrollo
    cd /app
    npm install
    PORT=8000 npm run dev
fi 