#!/bin/bash

# Función para verificar schema.prisma
check_prisma_schema() {
    if [ ! -f "prisma/schema.prisma" ]; then
        echo "❌ Error: No se encuentra el archivo schema.prisma"
        echo "Por favor, asegúrate de que el archivo existe en la carpeta backend/prisma/"
        exit 1
    fi
}

echo "🚀 Iniciando el entorno de desarrollo..."

# Verificar si Docker está corriendo
echo "📦 Verificando Docker..."
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker Desktop y vuelve a intentarlo."
    exit 1
fi

# Levantar solo PostgreSQL del docker-compose
echo "🐘 Levantando PostgreSQL desde docker-compose..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Configurar y generar Prisma en el backend
echo "🔧 Configurando Prisma..."
cd backend

# Verificar schema.prisma
check_prisma_schema

echo "📝 Instalando dependencias del backend..."
npm install

echo "🔄 Generando cliente Prisma..."
export DATABASE_URL="postgresql://apiuser:apipass@localhost:5432/miappdb?schema=public"
npx prisma generate --schema="./prisma/schema.prisma"

echo "🌱 Ejecutando migraciones de Prisma..."
npx prisma migrate dev --schema="./prisma/schema.prisma"

echo "🌱 Ejecutando seed de la base de datos..."
npx prisma db seed

echo "🚀 Iniciando el servidor backend..."
npm run dev &

# Configurar e iniciar el frontend
echo "📝 Instalando dependencias del frontend..."
cd ../frontend
npm install
echo "🚀 Iniciando el servidor frontend..."
npm run dev &

echo "✨ ¡Entorno de desarrollo iniciado!"
echo "📝 Backend corriendo en http://localhost:3003"
echo "🌐 Frontend corriendo en http://localhost:8081"
echo "🛑 Para detener todos los servicios, presiona Ctrl+C"
echo "💡 Para detener la base de datos: docker-compose stop postgres"

# Esperar a que el usuario presione Ctrl+C
wait 