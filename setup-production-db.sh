#!/bin/bash

# Script para configurar base de datos de producción
# Autor: Asistente IA
# Uso: ./setup-production-db.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "🚀 Configurando Base de Datos de Producción"
echo "=========================================="

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    print_error "Azure CLI no está instalado"
    print_info "Instala Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

print_status "Azure CLI encontrado"

# Login a Azure
print_info "Verificando login en Azure..."
if ! az account show &> /dev/null; then
    print_warning "No estás logueado en Azure"
    print_info "Ejecutando: az login"
    az login
fi

print_status "Sesión de Azure activa"

# Solicitar información del usuario
echo ""
print_info "Configuración de la base de datos:"
read -p "Nombre del grupo de recursos [mi-app-rg]: " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-mi-app-rg}

read -p "Nombre del servidor PostgreSQL [mi-app-postgres-server]: " SERVER_NAME
SERVER_NAME=${SERVER_NAME:-mi-app-postgres-server}

read -p "Región de Azure [westeurope]: " LOCATION
LOCATION=${LOCATION:-westeurope}

read -p "Usuario administrador [apiuser]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-apiuser}

read -s -p "Contraseña del administrador: " ADMIN_PASSWORD
echo ""

read -p "Nombre de la base de datos [miappdb]: " DATABASE_NAME
DATABASE_NAME=${DATABASE_NAME:-miappdb}

# Crear grupo de recursos
print_info "Creando grupo de recursos: $RESOURCE_GROUP"
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    print_warning "El grupo de recursos ya existe"
else
    az group create --name $RESOURCE_GROUP --location $LOCATION
    print_status "Grupo de recursos creado"
fi

# Crear servidor PostgreSQL
print_info "Creando servidor PostgreSQL: $SERVER_NAME"
if az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $SERVER_NAME &> /dev/null; then
    print_warning "El servidor PostgreSQL ya existe"
else
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $SERVER_NAME \
        --location $LOCATION \
        --admin-user $ADMIN_USER \
        --admin-password "$ADMIN_PASSWORD" \
        --sku-name Standard_B1ms \
        --tier Burstable \
        --version 16 \
        --storage-size 32 \
        --public-access 0.0.0.0
    
    print_status "Servidor PostgreSQL creado"
fi

# Crear base de datos
print_info "Creando base de datos: $DATABASE_NAME"
if az postgres flexible-server db show --resource-group $RESOURCE_GROUP --server-name $SERVER_NAME --database-name $DATABASE_NAME &> /dev/null; then
    print_warning "La base de datos ya existe"
else
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $SERVER_NAME \
        --database-name $DATABASE_NAME
    
    print_status "Base de datos creada"
fi

# Configurar reglas de firewall
print_info "Configurando reglas de firewall..."
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $SERVER_NAME \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 || true

print_status "Reglas de firewall configuradas"

# Generar URL de conexión
CONNECTION_URL="postgresql://$ADMIN_USER:$ADMIN_PASSWORD@$SERVER_NAME.postgres.database.azure.com:5432/$DATABASE_NAME?sslmode=require"

# Crear archivo .env
print_info "Creando archivo .env en backend/"
mkdir -p backend
cat > backend/.env << EOF
# Configuración de Azure PostgreSQL para PRODUCCIÓN
# Generado automáticamente el $(date)

DATABASE_URL="$CONNECTION_URL"

# Configuración individual
POSTGRES_HOST="$SERVER_NAME.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="$DATABASE_NAME"
POSTGRES_USER="$ADMIN_USER"
POSTGRES_PASSWORD="$ADMIN_PASSWORD"
POSTGRES_SSL="true"

# Configuración adicional
DB_CONNECTION_REQUIRED="true"
NODE_ENV="production"
EOF

print_status "Archivo .env creado en backend/"

# Crear archivo de configuración para GitHub Secrets
print_info "Creando archivo de secrets para GitHub Actions..."
cat > github-secrets.txt << EOF
# Configura estos secrets en tu repositorio de GitHub
# Settings > Secrets and variables > Actions > New repository secret

DATABASE_URL=$CONNECTION_URL
POSTGRES_HOST=$SERVER_NAME.postgres.database.azure.com
POSTGRES_USER=$ADMIN_USER
POSTGRES_PASSWORD=$ADMIN_PASSWORD
POSTGRES_DB=$DATABASE_NAME
POSTGRES_SSL=true
EOF

print_status "Archivo github-secrets.txt creado"

# Probar conexión (si psql está disponible)
if command -v psql &> /dev/null; then
    print_info "Probando conexión a la base de datos..."
    if psql "$CONNECTION_URL" -c "SELECT version();" &> /dev/null; then
        print_status "Conexión exitosa a la base de datos"
    else
        print_warning "No se pudo conectar a la base de datos (puede tomar unos minutos en estar disponible)"
    fi
else
    print_warning "psql no está instalado, no se puede probar la conexión"
fi

# Ejecutar migraciones de Prisma (si está disponible)
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    print_info "Ejecutando migraciones de Prisma..."
    cd backend
    
    if command -v npm &> /dev/null; then
        npm install
        npx prisma generate
        npx prisma db push
        print_status "Migraciones de Prisma ejecutadas"
        
        # Ejecutar seed si existe
        if npm run seed &> /dev/null; then
            print_status "Datos iniciales insertados"
        fi
    else
        print_warning "npm no está disponible, ejecuta manualmente las migraciones"
    fi
    
    cd ..
fi

# Mostrar resumen
echo ""
echo "🎉 ¡Configuración completada!"
echo "============================="
print_info "Información de conexión:"
echo "Servidor: $SERVER_NAME.postgres.database.azure.com"
echo "Base de datos: $DATABASE_NAME"
echo "Usuario: $ADMIN_USER"
echo ""
print_info "Archivos generados:"
echo "- backend/.env (variables de entorno)"
echo "- github-secrets.txt (secrets para GitHub Actions)"
echo ""
print_warning "Próximos pasos:"
echo "1. Configura los secrets en GitHub (usa github-secrets.txt)"
echo "2. Despliega tu aplicación"
echo "3. Verifica que la conexión funcione"
echo ""
print_info "Para conectar desde tu aplicación local:"
echo "cd backend && npm run dev"
echo ""
print_info "Para probar la conexión directamente:"
echo "psql \"$CONNECTION_URL\"" 