#!/bin/sh

# Función para manejar errores
handle_error() {
    echo "Error: $1"
    if [ "$2" != "continue" ]; then
        exit 1
    fi
}

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
while ! nc -z postgres 5432; do
  echo "Postgres no está disponible - esperando..."
  sleep 2
done
echo "¡Base de datos lista!"

# Limpiar la carpeta dist si existe
echo "Limpiando carpeta dist..."
rm -rf dist/

# Mostrar estructura de directorios
echo "Estructura de directorios:"
ls -la
echo "\nContenido de src:"
ls -la src/ || handle_error "No se encuentra el directorio src"

# Compilar TypeScript
echo "\nCompilando TypeScript..."
npm run build || handle_error "Error al compilar TypeScript"

# Mostrar contenido del directorio dist
echo "\nContenido de dist:"
ls -la dist/ || handle_error "No se encuentra el directorio dist"

# Ejecutar migraciones y seeds
echo "\nGenerando cliente Prisma..."
npx prisma generate --schema=src/prisma/schema.prisma || handle_error "Error al generar el cliente Prisma"

echo "\nCreando la base de datos si no existe..."
npx prisma db push --schema=src/prisma/schema.prisma --accept-data-loss || handle_error "Error al crear la base de datos" "continue"

echo "\nEjecutando seeds..."
NODE_ENV=development npm run seed || handle_error "Error al ejecutar los seeds" "continue"

# Iniciar el servidor
echo "\nIniciando servidor..."
NODE_ENV=development node dist/server.js 