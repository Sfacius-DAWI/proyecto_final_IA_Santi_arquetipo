# Configuración MCP para Cursor

Este documento explica cómo configurar el servidor MCP de Azure PostgreSQL específicamente para **Cursor**.

## 🎯 Configuración para Cursor

### 1. Preparar el Servidor MCP

Asegúrate de que las dependencias estén instaladas:

```bash
cd backend
npm install @modelcontextprotocol/sdk
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend`:

```env
# Tu configuración real de Azure PostgreSQL
DATABASE_URL="postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
POSTGRES_HOST="servidor.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="basededatos"
POSTGRES_USER="usuario"
POSTGRES_PASSWORD="password"
POSTGRES_SSL="true"
DB_CONNECTION_REQUIRED="true"
```

### 3. Configurar Cursor

#### Opción A: Configuración Global de Cursor

1. Abre Cursor
2. Ve a **File** → **Preferences** → **Settings**
3. Busca "MCP" en la configuración
4. Agrega la configuración del servidor:

```json
{
  "mcp": {
    "servers": {
      "azure-postgres": {
        "command": "npm",
        "args": ["run", "mcp"],
        "cwd": "C:/Users/santi/Documents/Mi_arquetipo_santi_propio/backend",
        "env": {
          "DATABASE_URL": "postgresql://tu_usuario:tu_password@tu_servidor.postgres.database.azure.com:5432/tu_basededatos?sslmode=require"
        }
      }
    }
  }
}
```

#### Opción B: Configuración por Workspace

1. En la raíz de tu proyecto, crea/edita `.cursor/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "azure-postgres": {
        "command": "npm",
        "args": ["run", "mcp"],
        "cwd": "./backend",
        "env": {
          "DATABASE_URL": "postgresql://tu_usuario:tu_password@tu_servidor.postgres.database.azure.com:5432/tu_basededatos?sslmode=require"
        }
      }
    }
  }
}
```

### 4. Probar la Configuración

1. **Reinicia Cursor** después de la configuración
2. **Abre el chat de Cursor** (Ctrl+L o Cmd+L)
3. **Verifica que el servidor MCP esté conectado** - deberías ver un indicador de herramientas disponibles

### 5. Usar MCP en Cursor

Una vez configurado, puedes hacer preguntas como:

```
@azure-postgres ¿Cuántos tours tengo disponibles?
```

```
@azure-postgres Muéstrame la estructura de la tabla User
```

```
@azure-postgres ¿Cuáles son las compras del usuario xyz?
```

```
@azure-postgres Dame estadísticas de mi base de datos
```

```
@azure-postgres Ejecuta una consulta para ver los tours más populares
```

## 🛠️ Herramientas Disponibles

- **`list_tables`** - Lista todas las tablas en la base de datos
- **`describe_table`** - Describe la estructura de una tabla específica
- **`query_data`** - Ejecuta consultas SELECT seguras
- **`get_tours`** - Obtiene información de tours disponibles
- **`get_user_purchases`** - Obtiene las compras de un usuario específico
- **`get_database_stats`** - Obtiene estadísticas generales de la base de datos

## 🔧 Solución de Problemas

### Error: "MCP server not found"

1. Verifica que el archivo `.env` tenga las credenciales correctas
2. Asegúrate de que el path en `cwd` sea correcto
3. Reinicia Cursor completamente

### Error: "Cannot connect to database"

1. Verifica las credenciales de Azure PostgreSQL
2. Asegúrate de que tu IP esté en la lista blanca de Azure
3. Verifica que el firewall de Azure permita conexiones

### Error: "npm command not found"

1. Asegúrate de que Node.js y npm estén instalados
2. Verifica que npm esté en el PATH del sistema
3. Usa la ruta completa a npm si es necesario:

```json
{
  "command": "C:/Program Files/nodejs/npm.cmd",
  "args": ["run", "mcp"]
}
```

### Verificar Logs

Para ver los logs del servidor MCP:

```bash
cd backend
npm run mcp 2>&1 | tee mcp.log
```

## 🔒 Seguridad

- ✅ Solo consultas SELECT permitidas
- ✅ Límite de 100 filas por consulta
- ✅ Validación de entrada estricta
- ✅ Conexión SSL obligatoria a Azure
- ✅ Variables de entorno para credenciales

## 📝 Notas Importantes

1. **Credenciales**: Nunca hardcodees credenciales en la configuración
2. **Paths**: Usa rutas absolutas para evitar problemas
3. **Reinicio**: Siempre reinicia Cursor después de cambios de configuración
4. **Logs**: Revisa los logs si algo no funciona

## 🚀 Comandos Útiles

```bash
# Probar el servidor MCP manualmente
cd backend && npm run mcp

# Verificar dependencias
npm list @modelcontextprotocol/sdk

# Ver logs en tiempo real
npm run mcp 2>&1 | tee -a mcp.log
```

## 📚 Referencias

- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/) 