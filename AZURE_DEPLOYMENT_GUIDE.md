# 🚀 Guía de Despliegue en Azure - Mi Arquetipo Santi

## 📋 Variables de Entorno Requeridas

### 🔧 Secrets de GitHub (Repository Settings > Secrets and Variables > Actions)

#### **Secrets Obligatorios:**

```yaml
# Azure Container Registry
AZURE_REGISTRY_USERNAME: "tu-usuario-acr"
AZURE_REGISTRY_PASSWORD: "tu-password-acr"

# Azure App Service - Backend
AZURE_BACKEND_PUBLISH_PROFILE: "contenido-del-archivo-publishprofile-backend"

# Azure App Service - Frontend  
AZURE_FRONTEND_PUBLISH_PROFILE: "contenido-del-archivo-publishprofile-frontend"

# Base de Datos Azure PostgreSQL
DATABASE_URL: "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"

# OpenAI API (para el backend)
OPENAI_API_KEY: "sk-proj-tu-clave-de-openai"
ASSISTANT_OPENAI_ID: "asst_tu-id-de-assistant"

# SSH para despliegue manual (opcional)
SSH_HOST: "tu-servidor.com"
SSH_USERNAME: "tu-usuario"
SSH_PRIVATE_KEY: "tu-clave-privada-ssh"
SSH_PORT: "22"
```

### 🌐 Variables de Entorno para Azure Container Apps

#### **Backend (mi-arquetipo-backend):**

```yaml
# Configuración de Node.js
NODE_ENV: "production"
PORT: "3001"

# Base de Datos
DATABASE_URL: "postgresql://usuario:password@servidor.postgres.database.azure.com:5432/basededatos?sslmode=require"
POSTGRES_HOST: "servidor.postgres.database.azure.com"
POSTGRES_PORT: "5432"
POSTGRES_DB: "basededatos"
POSTGRES_USER: "usuario"
POSTGRES_PASSWORD: "password"
POSTGRES_SSL: "true"
DB_CONNECTION_REQUIRED: "true"

# OpenAI Configuration
OPENAI_API_KEY: "sk-proj-tu-clave-de-openai"
ASSISTANT_OPENAI_ID: "asst_tu-id-de-assistant"

# CORS Configuration
CORS_ORIGIN: "https://tu-frontend.azurewebsites.net"

# Logging
LOG_LEVEL: "info"
API_VERSION: "v1"
```

#### **Frontend (mi-arquetipo-frontend):**

```yaml
# Configuración de Node.js
NODE_ENV: "production"
PORT: "3000"

# API Backend URL
VITE_API_URL: "https://tu-backend.azurewebsites.net"
BACKEND_URL: "https://tu-backend.azurewebsites.net"

# Configuración de Timeout
API_TIMEOUT: "30000"

# Firebase Configuration (si usas Firebase)
VITE_FIREBASE_API_KEY: "tu-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN: "tu-proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID: "tu-proyecto-id"
VITE_FIREBASE_STORAGE_BUCKET: "tu-proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789"
VITE_FIREBASE_APP_ID: "tu-app-id"
```

## 🔑 Cómo Obtener las Credenciales

### 1. Azure Container Registry

```bash
# Crear ACR
az acr create --resource-group mi-grupo --name paqueteturisiticoscontainer --sku Basic

# Obtener credenciales
az acr credential show --name paqueteturisiticoscontainer
```

### 2. Azure App Service Publish Profiles

```bash
# Descargar publish profile para backend
az webapp deployment list-publishing-profiles --name mi-arquetipo-backend --resource-group mi-grupo

# Descargar publish profile para frontend
az webapp deployment list-publishing-profiles --name mi-arquetipo-frontend --resource-group mi-grupo
```

### 3. Azure PostgreSQL

```bash
# Crear servidor PostgreSQL
az postgres server create \
  --resource-group mi-grupo \
  --name mi-servidor-postgres \
  --location "East US" \
  --admin-user mi-usuario \
  --admin-password MiPassword123! \
  --sku-name GP_Gen5_2

# Obtener cadena de conexión
az postgres server show-connection-string \
  --server-name mi-servidor-postgres \
  --database-name mi-base-datos \
  --admin-user mi-usuario \
  --admin-password MiPassword123!
```

## 🚀 Pasos de Configuración

### 1. Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and Variables > Actions
3. Añade todos los secrets listados arriba

### 2. Crear Azure Container Apps

```bash
# Backend
az containerapp create \
  --name mi-arquetipo-backend \
  --resource-group mi-grupo \
  --environment mi-entorno \
  --image paqueteturisiticoscontainer.azurecr.io/mi-arquetipo-santi/backend:latest \
  --target-port 3001 \
  --ingress external \
  --registry-server paqueteturisiticoscontainer.azurecr.io

# Frontend
az containerapp create \
  --name mi-arquetipo-frontend \
  --resource-group mi-grupo \
  --environment mi-entorno \
  --image paqueteturisiticoscontainer.azurecr.io/mi-arquetipo-santi/frontend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server paqueteturisiticoscontainer.azurecr.io
```

### 3. Configurar Variables de Entorno en Azure

```bash
# Backend
az containerapp update \
  --name mi-arquetipo-backend \
  --resource-group mi-grupo \
  --set-env-vars \
    NODE_ENV=production \
    PORT=3001 \
    DATABASE_URL="postgresql://..." \
    OPENAI_API_KEY="sk-proj-..." \
    ASSISTANT_OPENAI_ID="asst_..."

# Frontend
az containerapp update \
  --name mi-arquetipo-frontend \
  --resource-group mi-grupo \
  --set-env-vars \
    NODE_ENV=production \
    PORT=3000 \
    VITE_API_URL="https://mi-arquetipo-backend.azurecontainerapps.io"
```

## 🔄 Workflows Disponibles

### 1. **microservices-ci-cd.yml**
- **Trigger**: Push a `main` o `develop`, PR
- **Funciones**: Tests, build, Docker, despliegue automático
- **Entornos**: staging, production

### 2. **hotfix-rollback.yml**
- **Trigger**: Manual
- **Funciones**: Hotfixes de emergencia y rollbacks
- **Opciones**: frontend, backend, or both

### 3. **Workflows Antiguos** (pueden eliminarse)
- `docker-test-deploy.yml`
- `node-azure-deploy.yml`
- `main_front-paquetes-turisticos.yml`

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
```bash
# Backend logs
az containerapp logs show --name mi-arquetipo-backend --resource-group mi-grupo --follow

# Frontend logs
az containerapp logs show --name mi-arquetipo-frontend --resource-group mi-grupo --follow
```

### Métricas y alertas:
```bash
# Configurar alertas
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group mi-grupo \
  --condition "avg Percentage CPU > 80"
```

## 🛡️ Seguridad

### Recomendaciones:
1. **Usar Key Vault** para secrets sensibles
2. **Configurar CORS** correctamente
3. **Habilitar HTTPS** en todos los endpoints
4. **Configurar firewall** en PostgreSQL
5. **Usar identidades administradas** de Azure

### Ejemplo de configuración con Key Vault:
```bash
# Crear Key Vault
az keyvault create --name mi-keyvault --resource-group mi-grupo

# Añadir secrets
az keyvault secret set --vault-name mi-keyvault --name "DATABASE-URL" --value "postgresql://..."
az keyvault secret set --vault-name mi-keyvault --name "OPENAI-API-KEY" --value "sk-proj-..."
```

## 🔧 Troubleshooting

### Problemas Comunes:

1. **Error de conexión a DB**:
   - Verificar firewall rules en PostgreSQL
   - Comprobar string de conexión

2. **Imagen no encontrada**:
   - Verificar que el ACR esté correctamente configurado
   - Comprobar permisos de push/pull

3. **Variables de entorno no disponibles**:
   - Verificar que estén configuradas en Azure Container Apps
   - Comprobar sintaxis de variables VITE_ para frontend

4. **Timeouts en despliegue**:
   - Aumentar timeout en workflow
   - Verificar health checks

## 📞 Contacto y Soporte

Para dudas específicas sobre el despliegue, revisar:
- GitHub Actions logs
- Azure Container Apps logs  
- Azure Monitor metrics
- Esta documentación

---

**Última actualización**: $(date)
**Versión**: 1.0.0 