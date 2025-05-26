# 🚀 Configuración de Base de Datos en Producción

## **Resumen Rápido**

Tu proyecto ya está **100% preparado** para conectar con una base de datos en producción. Solo necesitas:

1. **Crear la base de datos en Azure**
2. **Configurar las variables de entorno**
3. **Ejecutar las migraciones**
4. **Desplegar**

## **🎯 Opción 1: Script Automatizado (Recomendado)**

### **Para Windows (PowerShell)**
```powershell
# Ejecutar el script automatizado
.\setup-production-db.ps1

# O con parámetros personalizados
.\setup-production-db.ps1 -ResourceGroup "mi-empresa-rg" -ServerName "mi-app-db" -Location "eastus"
```

### **Para Linux/Mac (Bash)**
```bash
# Hacer ejecutable y ejecutar
chmod +x setup-production-db.sh
./setup-production-db.sh
```

**¡Eso es todo!** El script hace todo automáticamente:
- ✅ Crea la base de datos en Azure
- ✅ Configura las variables de entorno
- ✅ Ejecuta las migraciones de Prisma
- ✅ Genera archivos de configuración

## **🎯 Opción 2: Manual (Paso a Paso)**

### **1. Crear Base de Datos en Azure**

#### **Portal Web:**
1. Ve a https://portal.azure.com
2. Busca "Azure Database for PostgreSQL"
3. Crear → Servidor flexible
4. Configurar:
   - **Servidor**: `mi-app-postgres-server`
   - **Usuario**: `apiuser`
   - **Contraseña**: `[Tu contraseña segura]`
   - **Base de datos**: `miappdb`

#### **Azure CLI:**
```bash
# Crear servidor
az postgres flexible-server create \
  --resource-group mi-app-rg \
  --name mi-app-postgres-server \
  --location westeurope \
  --admin-user apiuser \
  --admin-password TuPasswordSegura123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16

# Crear base de datos
az postgres flexible-server db create \
  --resource-group mi-app-rg \
  --server-name mi-app-postgres-server \
  --database-name miappdb
```

### **2. Configurar Variables de Entorno**

Crea `backend/.env`:
```env
DATABASE_URL="postgresql://apiuser:TuPassword@mi-app-postgres-server.postgres.database.azure.com:5432/miappdb?sslmode=require"
POSTGRES_HOST="mi-app-postgres-server.postgres.database.azure.com"
POSTGRES_PORT="5432"
POSTGRES_DB="miappdb"
POSTGRES_USER="apiuser"
POSTGRES_PASSWORD="TuPassword"
POSTGRES_SSL="true"
DB_CONNECTION_REQUIRED="true"
NODE_ENV="production"
```

### **3. Ejecutar Migraciones**

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed  # Opcional: datos iniciales
```

### **4. Probar Conexión**

```bash
# Probar localmente
cd backend && npm run dev

# O probar directamente la BD
psql "postgresql://apiuser:password@servidor.postgres.database.azure.com:5432/miappdb?sslmode=require"
```

## **🎯 Opción 3: Alternativas de Base de Datos**

### **Railway (Más fácil)**
```bash
# 1. Crear cuenta en railway.app
# 2. Crear proyecto PostgreSQL
# 3. Copiar la URL de conexión
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### **Supabase (Gratis)**
```bash
# 1. Crear cuenta en supabase.com
# 2. Crear proyecto
# 3. Ir a Settings > Database
DATABASE_URL="postgresql://postgres:password@db.proyecto.supabase.co:5432/postgres"
```

### **AWS RDS**
```bash
DATABASE_URL="postgresql://usuario:password@instancia.region.rds.amazonaws.com:5432/miappdb"
```

## **📋 Configuración para Despliegue**

### **GitHub Actions (CI/CD)**

Configura estos **secrets** en tu repositorio:
```
Settings > Secrets and variables > Actions > New repository secret
```

**Secrets necesarios:**
- `DATABASE_URL`: Tu URL completa de conexión
- `POSTGRES_HOST`: Host del servidor
- `POSTGRES_USER`: Usuario de la BD
- `POSTGRES_PASSWORD`: Contraseña
- `POSTGRES_DB`: Nombre de la base de datos

### **Docker Compose Producción**

Tu `docker-compose.prod.yml` ya está configurado. Solo actualiza las variables:

```yaml
services:
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
```

### **Azure App Service**

```bash
# Configurar variables de entorno
az webapp config appsettings set \
  --resource-group mi-app-rg \
  --name mi-app-backend \
  --settings DATABASE_URL="postgresql://..." NODE_ENV="production"
```

## **💰 Costos Estimados**

### **Azure PostgreSQL**
- **Desarrollo**: ~$12-15/mes (Burstable B1ms)
- **Producción**: ~$50-70/mes (General Purpose)

### **Alternativas Gratuitas/Baratas**
- **Supabase**: Gratis hasta 500MB
- **Railway**: $5/mes
- **PlanetScale**: Gratis hasta 1GB

## **🔧 Troubleshooting**

### **Error de conexión SSL**
```
Error: self signed certificate
```
**Solución**: Asegúrate de usar `sslmode=require` en la URL

### **Error de firewall**
```
Error: connection timed out
```
**Solución**: Configura reglas de firewall en Azure para permitir tu IP

### **Error de autenticación**
```
Error: password authentication failed
```
**Solución**: Verifica usuario y contraseña en Azure Portal

### **Comandos útiles**
```bash
# Ver logs de la aplicación
docker logs mi-app-backend

# Conectar directamente a la BD
psql "postgresql://usuario:password@servidor:5432/db?sslmode=require"

# Ver tablas creadas
\dt

# Ver conexiones activas
SELECT * FROM pg_stat_activity;
```

## **✅ Checklist de Producción**

- [ ] Base de datos creada en Azure/Railway/Supabase
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas (`npx prisma db push`)
- [ ] Conexión probada localmente
- [ ] Secrets configurados en GitHub
- [ ] Aplicación desplegada
- [ ] Endpoints funcionando
- [ ] Backup configurado (opcional)
- [ ] Monitoreo configurado (opcional)

## **🚀 Comandos de Despliegue Rápido**

```bash
# 1. Configurar BD (automático)
.\setup-production-db.ps1

# 2. Desplegar con Docker
docker-compose -f docker-compose.prod.yml up -d

# 3. Verificar
curl https://tu-app.com/health
curl https://tu-app.com/api/tours
```

---

## **📞 Soporte**

Si tienes problemas:

1. **Revisa los logs**: `docker logs mi-app-backend`
2. **Verifica la conexión**: Usa `psql` para conectar directamente
3. **Comprueba las variables**: `echo $DATABASE_URL`
4. **Consulta la documentación**: `GUIA_PRODUCCION_BD.md`

¡Tu aplicación está lista para producción! 🎉 