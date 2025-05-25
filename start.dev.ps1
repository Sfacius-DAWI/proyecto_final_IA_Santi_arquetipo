# Función para mostrar mensajes
function Write-ColorOutput($message) {
    Write-Host $message
}

function Test-PrismaSchema {
    if (-not (Test-Path "src/prisma/schema.prisma")) {
        Write-ColorOutput "[ERROR] No se encuentra el archivo schema.prisma"
        Write-ColorOutput "Por favor, asegúrate de que el archivo existe en la carpeta backend/src/prisma/"
        exit 1
    }
}

Write-ColorOutput "[INFO] Iniciando el entorno de desarrollo..."

# Verificar si Docker está corriendo
Write-ColorOutput "[INFO] Verificando Docker..."
try {
    docker info | Out-Null
} catch {
    Write-ColorOutput "[ERROR] Docker no está corriendo. Por favor, inicia Docker Desktop y vuelve a intentarlo."
    exit 1
}

# Levantar solo PostgreSQL del docker-compose
Write-ColorOutput "[INFO] Levantando PostgreSQL desde docker-compose..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
Write-ColorOutput "[INFO] Esperando a que PostgreSQL esté listo..."
Start-Sleep -Seconds 5

# Configurar y generar Prisma en el backend
Write-ColorOutput "[INFO] Configurando Prisma..."
Set-Location -Path "backend"

# Verificar schema.prisma
Test-PrismaSchema

Write-ColorOutput "[INFO] Instalando dependencias del backend..."
npm install

Write-ColorOutput "[INFO] Generando cliente Prisma..."
$env:DATABASE_URL = "postgresql://apiuser:apipass@localhost:5432/miappdb?schema=public"
npx prisma generate --schema="./src/prisma/schema.prisma"

Write-ColorOutput "[INFO] Ejecutando migraciones de Prisma..."
npx prisma migrate dev --schema="./src/prisma/schema.prisma"

Write-ColorOutput "[INFO] Ejecutando seed de la base de datos..."
npx prisma db seed

Write-ColorOutput "[INFO] Iniciando el servidor backend..."
Start-Process -NoNewWindow powershell -ArgumentList "npm run dev"

# Configurar e iniciar el frontend
Write-ColorOutput "[INFO] Instalando dependencias del frontend..."
Set-Location -Path "../frontend"
npm install
Write-ColorOutput "[INFO] Iniciando el servidor frontend..."
Start-Process -NoNewWindow powershell -ArgumentList "npm run dev"

Write-ColorOutput "[SUCCESS] Entorno de desarrollo iniciado!"
Write-ColorOutput "[INFO] Backend corriendo en http://localhost:3003"
Write-ColorOutput "[INFO] Frontend corriendo en http://localhost:8081"
Write-ColorOutput "[INFO] Para detener todos los servicios, cierra esta ventana"
Write-ColorOutput "[INFO] Para detener la base de datos: docker-compose stop postgres"

# Mantener el script corriendo
while ($true) {
    Start-Sleep -Seconds 1
} 