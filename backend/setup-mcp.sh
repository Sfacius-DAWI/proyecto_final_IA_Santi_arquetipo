#!/bin/bash

# Script de configuración para el servidor MCP de Azure PostgreSQL
# Autor: Asistente IA
# Fecha: $(date)

set -e

echo "🚀 Configurando servidor MCP para Azure PostgreSQL..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio backend/"
    exit 1
fi

print_info "Verificando prerequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ es requerida. Versión actual: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_status "npm $(npm -v) encontrado"

# Instalar dependencias MCP
print_info "Instalando dependencias MCP..."
npm install @modelcontextprotocol/sdk

if [ $? -eq 0 ]; then
    print_status "Dependencias MCP instaladas correctamente"
else
    print_error "Error instalando dependencias MCP"
    exit 1
fi

# Verificar si existe .env
if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado. Creando plantilla..."
    
    cat > .env << EOF
# Configuración de Azure PostgreSQL
# Reemplaza estos valores con tu configuración real

# URL de conexión completa (recomendado)
DATABASE_URL="postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"

# O configuración individual
POSTGRES_HOST="servidor.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="basededatos"
POSTGRES_USER="usuario"
POSTGRES_PASSWORD="password"
POSTGRES_SSL="true"

# Opcional: Configuración adicional
DB_CONNECTION_REQUIRED="true"
EOF

    print_warning "Archivo .env creado. ¡IMPORTANTE: Actualiza las credenciales antes de usar!"
    print_info "Edita el archivo .env con tus credenciales reales de Azure"
else
    print_status "Archivo .env encontrado"
fi

# Verificar estructura de directorios
if [ ! -d "src/mcp" ]; then
    print_info "Creando directorio src/mcp..."
    mkdir -p src/mcp
fi

# Verificar que el archivo del servidor MCP existe
if [ ! -f "src/mcp/azure-postgres-mcp-server.ts" ]; then
    print_error "Archivo del servidor MCP no encontrado en src/mcp/azure-postgres-mcp-server.ts"
    print_info "Asegúrate de que el archivo del servidor MCP esté en la ubicación correcta"
    exit 1
fi

print_status "Servidor MCP encontrado"

# Probar compilación TypeScript
print_info "Verificando compilación TypeScript..."
if command -v tsx &> /dev/null; then
    print_status "tsx encontrado"
else
    print_warning "tsx no encontrado, instalando..."
    npm install -g tsx
fi

# Crear script de prueba
print_info "Creando script de prueba..."
cat > test-mcp.js << EOF
// Script de prueba para verificar que las dependencias MCP están disponibles
try {
    require('@modelcontextprotocol/sdk/server/index.js');
    console.log('✅ SDK MCP disponible');
    process.exit(0);
} catch (error) {
    console.error('❌ Error cargando SDK MCP:', error.message);
    process.exit(1);
}
EOF

if node test-mcp.js; then
    print_status "Dependencias MCP verificadas"
    rm test-mcp.js
else
    print_error "Error verificando dependencias MCP"
    rm test-mcp.js
    exit 1
fi

# Generar configuración para Claude Desktop
print_info "Generando configuración para Claude Desktop..."
CURRENT_DIR=$(pwd)
cat > claude-desktop-config.json << EOF
{
  "mcpServers": {
    "azure-postgres": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "$CURRENT_DIR",
      "env": {
        "DATABASE_URL": "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
      }
    }
  }
}
EOF

print_status "Configuración de Claude Desktop generada en claude-desktop-config.json"

# Generar configuración para VS Code
print_info "Generando configuración para VS Code..."
cat > vscode-mcp-config.json << EOF
{
  "servers": {
    "azure-postgres": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "$CURRENT_DIR",
      "env": {
        "DATABASE_URL": "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
      }
    }
  }
}
EOF

print_status "Configuración de VS Code generada en vscode-mcp-config.json"

# Mostrar resumen
echo ""
echo "🎉 ¡Configuración completada!"
echo ""
print_info "Próximos pasos:"
echo "1. Actualiza las credenciales en el archivo .env"
echo "2. Configura tu cliente MCP:"
echo "   - Claude Desktop: Copia el contenido de claude-desktop-config.json"
echo "   - VS Code: Copia el contenido de vscode-mcp-config.json"
echo "3. Prueba la conexión: npm run mcp"
echo ""
print_warning "¡No olvides actualizar las credenciales de Azure en .env!"
echo ""
print_info "Para más información, consulta MCP-README.md" 