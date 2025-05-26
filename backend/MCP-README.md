# Servidor MCP para Azure PostgreSQL

Este servidor MCP (Model Context Protocol) te permite conectar herramientas de IA como Claude Desktop o VS Code con tu base de datos PostgreSQL desplegada en Azure.

## 🚀 Características

- **Conexión segura** a Azure Database for PostgreSQL
- **Herramientas especializadas** para tu aplicación de tours
- **Consultas tipo-seguras** usando Prisma
- **Validación de entrada** para prevenir inyección SQL
- **Manejo de errores robusto**

## 🛠️ Herramientas Disponibles

### 1. `list_tables`
Lista todas las tablas en la base de datos.

### 2. `describe_table`
Describe la estructura de una tabla específica.
- **Parámetros**: `tableName` (string)

### 3. `query_data`
Ejecuta consultas SELECT seguras en la base de datos.
- **Parámetros**: 
  - `query` (string): Consulta SQL SELECT
  - `limit` (number, opcional): Límite de filas (máximo 100, por defecto 50)

### 4. `get_tours`
Obtiene información de tours disponibles.
- **Parámetros**:
  - `limit` (number, opcional): Número máximo de tours (por defecto 10)
  - `disponible` (boolean, opcional): Filtrar solo tours disponibles (por defecto true)

### 5. `get_user_purchases`
Obtiene las compras de un usuario específico.
- **Parámetros**: `userId` (string)

### 6. `get_database_stats`
Obtiene estadísticas generales de la base de datos.

## 📋 Prerequisitos

1. **Node.js** 18+ instalado
2. **Base de datos PostgreSQL** en Azure
3. **Variables de entorno** configuradas
4. **Cliente MCP** (Claude Desktop, VS Code, etc.)

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
cd backend
npm install @modelcontextprotocol/sdk
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` con tu configuración de Azure:

```env
# URL de conexión completa (recomendado)
DATABASE_URL="postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"

# O configuración individual
POSTGRES_HOST="servidor.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="basededatos"
POSTGRES_USER="usuario"
POSTGRES_PASSWORD="password"
POSTGRES_SSL="true"
```

### 3. Configurar Cliente MCP

#### Para Claude Desktop

1. Abre Claude Desktop
2. Ve a Configuración → Developer → Edit Config
3. Agrega la configuración del servidor:

```json
{
  "mcpServers": {
    "azure-postgres": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/ruta/absoluta/a/tu/proyecto/backend",
      "env": {
        "DATABASE_URL": "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
      }
    }
  }
}
```

#### Para VS Code

1. Instala la extensión MCP
2. Abre la configuración MCP (Ctrl+Shift+P → "MCP: Add server")
3. Configura el servidor:

```json
{
  "servers": {
    "azure-postgres": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/ruta/absoluta/a/tu/proyecto/backend",
      "env": {
        "DATABASE_URL": "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
      }
    }
  }
}
```

## 🔧 Uso

### Iniciar el Servidor Manualmente

```bash
cd backend
npm run mcp
```

### Ejemplos de Consultas

Una vez conectado a tu cliente MCP, puedes hacer preguntas como:

- "¿Cuántos tours tengo disponibles?"
- "Muéstrame la estructura de la tabla User"
- "¿Cuáles son las compras del usuario xyz?"
- "Dame estadísticas de mi base de datos"
- "Ejecuta una consulta para ver los tours más populares"

## 🔒 Seguridad

### Características de Seguridad Implementadas

1. **Solo consultas SELECT**: Las consultas personalizadas están limitadas a SELECT
2. **Límites de filas**: Máximo 100 filas por consulta
3. **Validación de entrada**: Todos los parámetros son validados
4. **Conexión SSL**: Conexión segura a Azure
5. **Manejo de errores**: No se expone información sensible

### Mejores Prácticas

1. **Variables de entorno**: Nunca hardcodees credenciales
2. **Permisos mínimos**: Usa un usuario de BD con permisos limitados
3. **Monitoreo**: Revisa los logs regularmente
4. **Actualizaciones**: Mantén las dependencias actualizadas

## 🐛 Solución de Problemas

### Error de Conexión

```bash
❌ Error iniciando servidor MCP: Error: connect ECONNREFUSED
```

**Solución**: Verifica que:
- Las credenciales de Azure sean correctas
- El firewall de Azure permita tu IP
- La cadena de conexión sea válida

### Error de Permisos

```bash
❌ Error: permission denied for table "User"
```

**Solución**: Asegúrate de que el usuario de BD tenga permisos de lectura en las tablas.

### Error de Dependencias

```bash
❌ Cannot find module '@modelcontextprotocol/sdk'
```

**Solución**: Instala las dependencias:
```bash
npm install @modelcontextprotocol/sdk
```

## 📊 Monitoreo

El servidor incluye logging detallado:

- ✅ Conexión establecida
- 🚀 Servidor iniciado
- 📝 Consultas ejecutadas
- ❌ Errores capturados

## 🔄 Desarrollo

### Estructura del Código

```
backend/src/mcp/
├── azure-postgres-mcp-server.ts  # Servidor principal
└── types/                        # Tipos TypeScript (futuro)
```

### Agregar Nuevas Herramientas

1. Define la herramienta en `ListToolsRequestSchema`
2. Implementa el handler en `CallToolRequestSchema`
3. Agrega el método privado correspondiente
4. Actualiza la documentación

## 📚 Referencias

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Claude Desktop MCP](https://claude.ai/docs/mcp)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Agrega tests si es necesario
5. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. 