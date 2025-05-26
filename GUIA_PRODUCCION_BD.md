# 🚀 Guía para Conectar Base de Datos en Producción

## **1. Crear Azure Database for PostgreSQL**

### **Opción A: Portal de Azure (Interfaz Web)**

1. **Accede al Portal de Azure**: https://portal.azure.com
2. **Crear recurso**:
   - Busca "Azure Database for PostgreSQL"
   - Selecciona "Servidor flexible"
   - Haz clic en "Crear"

3. **Configuración básica**:
   ```
   Suscripción: Tu suscripción de Azure
   Grupo de recursos: Crear nuevo o usar existente
   Nombre del servidor: mi-app-postgres-server
   Región: West Europe (o la más cercana)
   Versión de PostgreSQL: 16
   Tipo de carga de trabajo: Desarrollo
   ```

4. **Configuración de autenticación**:
   ```
   Método de autenticación: Solo autenticación PostgreSQL
   Nombre de usuario administrador: apiuser
   Contraseña: [Tu contraseña segura]
   ```

5. **Configuración de red**:
   ```
   Método de conectividad: Acceso público
   Reglas de firewall: Permitir acceso desde servicios de Azure
   ```

### **Opción B: Azure CLI (Línea de comandos)**

```bash
# 1. Crear grupo de recursos
az group create --name mi-app-rg --location westeurope

# 2. Crear servidor PostgreSQL
az postgres flexible-server create \
  --resource-group mi-app-rg \
  --name mi-app-postgres-server \
  --location westeurope \
  --admin-user apiuser \
  --admin-password TuPasswordSegura123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0

# 3. Crear base de datos
az postgres flexible-server db create \
  --resource-group mi-app-rg \
  --server-name mi-app-postgres-server \
  --database-name miappdb
```

## **2. Configurar Variables de Entorno**

### **Crear archivo `.env` en backend/**

```env
# Configuración de Azure PostgreSQL para PRODUCCIÓN
DATABASE_URL="postgresql://apiuser:TuPasswordSegura123!@mi-app-postgres-server.postgres.database.azure.com:5432/miappdb?sslmode=require"

# Configuración individual (alternativa)
POSTGRES_HOST="mi-app-postgres-server.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="miappdb"
POSTGRES_USER="apiuser"
POSTGRES_PASSWORD="TuPasswordSegura123!"
POSTGRES_SSL="true"

# Configuración adicional
DB_CONNECTION_REQUIRED="true"
NODE_ENV="production"
```

## **3. Configurar Secrets en GitHub (Para CI/CD)**

Si usas GitHub Actions, configura estos secrets:

```
AZURE_REGISTRY_USERNAME: Tu usuario de Azure Container Registry
AZURE_REGISTRY_PASSWORD: Tu contraseña de Azure Container Registry
DATABASE_URL: postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require
POSTGRES_HOST: servidor.postgres.database.azure.com
POSTGRES_USER: apiuser
POSTGRES_PASSWORD: TuPasswordSegura123!
POSTGRES_DB: miappdb
```

## **4. Ejecutar Migraciones de Prisma**

```bash
# Desde el directorio backend/
cd backend

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crear tablas)
npx prisma db push

# Opcional: Poblar con datos iniciales
npm run seed
```

## **5. Probar Conexión Local**

```bash
# Probar conexión desde tu máquina local
cd backend
npm install
npm run dev

# O probar el servidor MCP
npm run mcp
```

## **6. Desplegar en Producción**

### **Opción A: Docker Compose (Servidor propio)**

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    image: tu-registry/mi-app:backend
    environment:
      - DATABASE_URL=postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require
      - NODE_ENV=production
      - POSTGRES_SSL=true
    ports:
      - "3000:3000"
```

### **Opción B: Azure Container Instances**

```bash
az container create \
  --resource-group mi-app-rg \
  --name mi-app-backend \
  --image tu-registry/mi-app:backend \
  --environment-variables \
    DATABASE_URL="postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require" \
    NODE_ENV="production" \
  --ports 3000
```

### **Opción C: Azure App Service**

```bash
# Crear App Service
az webapp create \
  --resource-group mi-app-rg \
  --plan mi-app-plan \
  --name mi-app-backend \
  --deployment-container-image-name tu-registry/mi-app:backend

# Configurar variables de entorno
az webapp config appsettings set \
  --resource-group mi-app-rg \
  --name mi-app-backend \
  --settings \
    DATABASE_URL="postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require" \
    NODE_ENV="production"
```

## **7. Verificar Conexión**

### **Logs de la aplicación**
```bash
# Ver logs del contenedor
docker logs mi-app-backend

# O en Azure
az webapp log tail --resource-group mi-app-rg --name mi-app-backend
```

### **Probar endpoints**
```bash
# Health check
curl https://tu-app.azurewebsites.net/health

# Probar API
curl https://tu-app.azurewebsites.net/api/tours
```

## **8. Configuración de Seguridad**

### **Reglas de Firewall**
```bash
# Permitir solo tu aplicación
az postgres flexible-server firewall-rule create \
  --resource-group mi-app-rg \
  --name mi-app-postgres-server \
  --rule-name AllowMyApp \
  --start-ip-address TU_IP_PUBLICA \
  --end-ip-address TU_IP_PUBLICA
```

### **SSL/TLS**
- ✅ SSL está habilitado por defecto en Azure PostgreSQL
- ✅ Tu configuración ya incluye `sslmode=require`

## **9. Monitoreo y Backup**

### **Configurar backup automático**
```bash
az postgres flexible-server parameter set \
  --resource-group mi-app-rg \
  --server-name mi-app-postgres-server \
  --name backup_retention_days \
  --value 7
```

### **Monitoreo**
- Configura alertas en Azure Monitor
- Revisa métricas de CPU, memoria y conexiones

## **10. Costos Estimados**

### **Azure Database for PostgreSQL Flexible Server**
- **Burstable B1ms**: ~$12-15/mes
- **General Purpose D2s_v3**: ~$50-70/mes
- **Storage**: ~$0.10/GB/mes

### **Optimización de costos**
- Usa tier "Burstable" para desarrollo/staging
- Configura auto-pause para entornos no críticos
- Monitorea uso de storage

## **11. Troubleshooting**

### **Errores comunes**

**Error de conexión SSL**:
```
Error: self signed certificate
```
**Solución**: Asegúrate de usar `sslmode=require` en la URL

**Error de firewall**:
```
Error: connection timed out
```
**Solución**: Configura reglas de firewall en Azure

**Error de autenticación**:
```
Error: password authentication failed
```
**Solución**: Verifica usuario y contraseña

### **Comandos útiles**

```bash
# Probar conexión directa
psql "postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require"

# Ver tablas
\dt

# Ver conexiones activas
SELECT * FROM pg_stat_activity;
```

## **12. Alternativas a Azure**

### **AWS RDS PostgreSQL**
```env
DATABASE_URL="postgresql://usuario:password@instancia.region.rds.amazonaws.com:5432/miappdb"
```

### **Google Cloud SQL**
```env
DATABASE_URL="postgresql://usuario:password@ip-publica:5432/miappdb"
```

### **Railway**
```env
DATABASE_URL="postgresql://usuario:password@containers-us-west-xxx.railway.app:5432/railway"
```

### **Supabase**
```env
DATABASE_URL="postgresql://postgres:password@db.proyecto.supabase.co:5432/postgres"
```

---

## **🎯 Resumen de Pasos Rápidos**

1. **Crear BD en Azure**: Portal o CLI
2. **Configurar .env**: Con credenciales reales
3. **Ejecutar migraciones**: `npx prisma db push`
4. **Probar local**: `npm run dev`
5. **Desplegar**: Docker/Azure App Service
6. **Verificar**: Logs y endpoints

¡Tu aplicación ya está lista para producción! 🚀 