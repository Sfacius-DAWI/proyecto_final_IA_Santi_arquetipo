#!/bin/sh

# Script de inicio para microservicio backend
echo "Iniciando microservicio backend..."

# Variables de entorno por defecto si no están definidas
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export HOST=${HOST:-0.0.0.0}
export LOG_LEVEL=${LOG_LEVEL:-info}

# Comprobar entorno
if [ "$NODE_ENV" = "production" ]; then
    echo "Ejecutando en modo producción"
    # Ejecutar directamente el servidor
    node dist/server.js
else
    echo "Ejecutando en modo desarrollo"
    # Para desarrollo usar ts-node-dev
    npm run dev
fi 