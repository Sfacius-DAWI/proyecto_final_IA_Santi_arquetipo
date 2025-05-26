# Script para configurar base de datos de producción en Azure
# Autor: Asistente IA
# Uso: .\setup-production-db.ps1

param(
    [string]$ResourceGroup = "mi-app-rg",
    [string]$ServerName = "mi-app-postgres-server",
    [string]$Location = "westeurope",
    [string]$AdminUser = "apiuser",
    [string]$DatabaseName = "miappdb"
)

# Funciones para output con colores
function Write-Status { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }

Write-Host "🚀 Configurando Base de Datos de Producción" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Verificar Azure CLI
try {
    az --version | Out-Null
    Write-Status "Azure CLI encontrado"
} catch {
    Write-Error "Azure CLI no está instalado"
    Write-Info "Instala Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
}

# Verificar login en Azure
Write-Info "Verificando login en Azure..."
try {
    az account show | Out-Null
    Write-Status "Sesión de Azure activa"
} catch {
    Write-Warning "No estás logueado en Azure"
    Write-Info "Ejecutando: az login"
    az login
}

# Solicitar información del usuario si no se proporcionó
if (-not $ResourceGroup) {
    $ResourceGroup = Read-Host "Nombre del grupo de recursos [mi-app-rg]"
    if (-not $ResourceGroup) { $ResourceGroup = "mi-app-rg" }
}

if (-not $ServerName) {
    $ServerName = Read-Host "Nombre del servidor PostgreSQL [mi-app-postgres-server]"
    if (-not $ServerName) { $ServerName = "mi-app-postgres-server" }
}

if (-not $Location) {
    $Location = Read-Host "Región de Azure [westeurope]"
    if (-not $Location) { $Location = "westeurope" }
}

if (-not $AdminUser) {
    $AdminUser = Read-Host "Usuario administrador [apiuser]"
    if (-not $AdminUser) { $AdminUser = "apiuser" }
}

$AdminPassword = Read-Host "Contraseña del administrador" -AsSecureString
$AdminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword))

if (-not $DatabaseName) {
    $DatabaseName = Read-Host "Nombre de la base de datos [miappdb]"
    if (-not $DatabaseName) { $DatabaseName = "miappdb" }
}

# Crear grupo de recursos
Write-Info "Creando grupo de recursos: $ResourceGroup"
try {
    az group show --name $ResourceGroup | Out-Null
    Write-Warning "El grupo de recursos ya existe"
} catch {
    az group create --name $ResourceGroup --location $Location
    Write-Status "Grupo de recursos creado"
}

# Crear servidor PostgreSQL
Write-Info "Creando servidor PostgreSQL: $ServerName"
try {
    az postgres flexible-server show --resource-group $ResourceGroup --name $ServerName | Out-Null
    Write-Warning "El servidor PostgreSQL ya existe"
} catch {
    az postgres flexible-server create `
        --resource-group $ResourceGroup `
        --name $ServerName `
        --location $Location `
        --admin-user $AdminUser `
        --admin-password $AdminPasswordPlain `
        --sku-name Standard_B1ms `
        --tier Burstable `
        --version 16 `
        --storage-size 32 `
        --public-access 0.0.0.0
    
    Write-Status "Servidor PostgreSQL creado"
}

# Crear base de datos
Write-Info "Creando base de datos: $DatabaseName"
try {
    az postgres flexible-server db show --resource-group $ResourceGroup --server-name $ServerName --database-name $DatabaseName | Out-Null
    Write-Warning "La base de datos ya existe"
} catch {
    az postgres flexible-server db create `
        --resource-group $ResourceGroup `
        --server-name $ServerName `
        --database-name $DatabaseName
    
    Write-Status "Base de datos creada"
}

# Configurar reglas de firewall
Write-Info "Configurando reglas de firewall..."
try {
    az postgres flexible-server firewall-rule create `
        --resource-group $ResourceGroup `
        --name $ServerName `
        --rule-name AllowAzureServices `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0
} catch {
    # Ignorar si ya existe
}

Write-Status "Reglas de firewall configuradas"

# Generar URL de conexión
$ConnectionUrl = "postgresql://$AdminUser`:$AdminPasswordPlain@$ServerName.postgres.database.azure.com:5432/$DatabaseName?sslmode=require"

# Crear directorio backend si no existe
if (-not (Test-Path "backend")) {
    New-Item -ItemType Directory -Path "backend" | Out-Null
}

# Crear archivo .env
Write-Info "Creando archivo .env en backend/"
$EnvContent = @"
# Configuración de Azure PostgreSQL para PRODUCCIÓN
# Generado automáticamente el $(Get-Date)

DATABASE_URL="$ConnectionUrl"

# Configuración individual
POSTGRES_HOST="$ServerName.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="$DatabaseName"
POSTGRES_USER="$AdminUser"
POSTGRES_PASSWORD="$AdminPasswordPlain"
POSTGRES_SSL="true"

# Configuración adicional
DB_CONNECTION_REQUIRED="true"
NODE_ENV="production"
"@

$EnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Status "Archivo .env creado en backend/"

# Crear archivo de configuración para GitHub Secrets
Write-Info "Creando archivo de secrets para GitHub Actions..."
$SecretsContent = @"
# Configura estos secrets en tu repositorio de GitHub
# Settings > Secrets and variables > Actions > New repository secret

DATABASE_URL=$ConnectionUrl
POSTGRES_HOST=$ServerName.postgres.database.azure.com
POSTGRES_USER=$AdminUser
POSTGRES_PASSWORD=$AdminPasswordPlain
POSTGRES_DB=$DatabaseName
POSTGRES_SSL=true
"@

$SecretsContent | Out-File -FilePath "github-secrets.txt" -Encoding UTF8
Write-Status "Archivo github-secrets.txt creado"

# Probar conexión (si psql está disponible)
try {
    psql --version | Out-Null
    Write-Info "Probando conexión a la base de datos..."
    $TestResult = psql $ConnectionUrl -c "SELECT version();" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Conexión exitosa a la base de datos"
    } else {
        Write-Warning "No se pudo conectar a la base de datos (puede tomar unos minutos en estar disponible)"
    }
} catch {
    Write-Warning "psql no está instalado, no se puede probar la conexión"
}

# Ejecutar migraciones de Prisma (si está disponible)
if ((Test-Path "backend") -and (Test-Path "backend\package.json")) {
    Write-Info "Ejecutando migraciones de Prisma..."
    Push-Location "backend"
    
    try {
        npm --version | Out-Null
        npm install
        npx prisma generate
        npx prisma db push
        Write-Status "Migraciones de Prisma ejecutadas"
        
        # Ejecutar seed si existe
        try {
            npm run seed
            Write-Status "Datos iniciales insertados"
        } catch {
            Write-Warning "No se pudieron insertar datos iniciales"
        }
    } catch {
        Write-Warning "npm no está disponible, ejecuta manualmente las migraciones"
    }
    
    Pop-Location
}

# Mostrar resumen
Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Info "Información de conexión:"
Write-Host "Servidor: $ServerName.postgres.database.azure.com"
Write-Host "Base de datos: $DatabaseName"
Write-Host "Usuario: $AdminUser"
Write-Host ""
Write-Info "Archivos generados:"
Write-Host "- backend\.env (variables de entorno)"
Write-Host "- github-secrets.txt (secrets para GitHub Actions)"
Write-Host ""
Write-Warning "Próximos pasos:"
Write-Host "1. Configura los secrets en GitHub (usa github-secrets.txt)"
Write-Host "2. Despliega tu aplicación"
Write-Host "3. Verifica que la conexión funcione"
Write-Host ""
Write-Info "Para conectar desde tu aplicación local:"
Write-Host "cd backend && npm run dev"
Write-Host ""
Write-Info "Para probar la conexión directamente:"
Write-Host "psql `"$ConnectionUrl`""

# Limpiar variable de contraseña
$AdminPasswordPlain = $null 