#!/bin/sh

# Generar claves SSH si no existen
ssh-keygen -A

# Iniciar el servicio SSH
/usr/sbin/sshd

# Esperar a que el servicio SSH esté listo (usando netcat-openbsd)
while ! nc -z localhost 2222; do
  sleep 1
done

# Iniciar la aplicación
if [ "$NODE_ENV" = "production" ]; then
    # Para el backend
    cd /app
    npm install
    PORT=3000 npm start
else
    # Para desarrollo
    cd /app
    npm install
    PORT=3000 npm run dev
fi 