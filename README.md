# Mi Arquetipo Santi Propio

Este proyecto contiene un frontend en React/Vite y un backend en Fastify/TypeScript.

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- Docker y Docker Compose (para usar las funcionalidades de Docker)

## Instalación

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..

# Instalar dependencias del frontend
cd frontend/santi-proyect
npm install
cd ../..
```

## Scripts disponibles

### Ejecutar en modo desarrollo (recomendado para desarrollo)

```bash
npm run dev
```

Este comando inicia tanto el servidor backend (en http://localhost:3000) como el servidor frontend (en http://localhost:5173) en modo desarrollo con recarga automática.

### Ejecutar en modo producción

```bash
# Primero, construir el frontend
cd frontend
npm run build
cd ..

# Luego, construir el backend
cd backend
npm run build
cd ..

# Finalmente, iniciar ambos servidores
npm run start
```

### Iniciar sólo el backend

```bash
npm run dev:backend
```

### Iniciar sólo el frontend

```bash
npm run dev:frontend
```

## Uso de Docker

Este proyecto incluye configuración de Docker para crear instantáneas del estado actual del código.

### Crear una instantánea del código actual

```bash
npm run docker:snapshot
```

Este comando construye imágenes Docker del backend y frontend, y luego inicia los contenedores.

### Otros comandos de Docker

```bash
# Construir imágenes Docker sin iniciar contenedores
npm run docker:build

# Iniciar contenedores Docker
npm run docker:up

# Detener y eliminar contenedores Docker
npm run docker:down
```

### Acceso a la aplicación en Docker

- Frontend: http://localhost:80
- Backend: http://localhost:3000

## Estructura del proyecto

```
proyecto/
├── backend/            # Servidor Fastify con TypeScript
│   ├── src/
│   │   ├── controllers/ 
│   │   ├── routes/     
│   │   └── server.ts   
│   ├── package.json
│   ├── Dockerfile      # Configuración Docker para el backend
│   └── tsconfig.json
├── frontend/           # Cliente React con Vite
│   ├── santi-proyect/  
│   │   ├── src/        # Código fuente del frontend
│   │   ├── public/     # Archivos estáticos
│   │   └── package.json
│   ├── package.json
│   └── Dockerfile      # Configuración Docker para el frontend
├── docker-compose.yml  # Configuración para orquestar contenedores
└── package.json        # Scripts para ejecutar todo el proyecto
```

# Guía para Gestión de Imágenes Docker

## Índice
1. [Creación de Imágenes Docker](#creación-de-imágenes-docker)
2. [Etiquetado de Imágenes](#etiquetado-de-imágenes)
3. [Subida de Imágenes a Azure Container Registry](#subida-de-imágenes-a-azure-container-registry)
4. [Scripts de Automatización](#scripts-de-automatización)
5. [Comandos Útiles](#comandos-útiles)

## Creación de Imágenes Docker

### Requisitos Previos
- Docker instalado en tu sistema
- Docker Compose instalado en tu sistema
- Proyecto con estructura adecuada

### Pasos para Crear Imágenes

1. **Estructura del Proyecto**
   ```
   mi_arquetipo_santi_propio/
   ├── backend/
   │   ├── Dockerfile
   │   └── ... (archivos del backend)
   ├── frontend/
   │   ├── Dockerfile
   │   └── ... (archivos del frontend)
   ├── docker-compose.yml
   └── README.md
   ```

2. **Crear el Dockerfile para Backend**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

3. **Crear el Dockerfile para Frontend**
   ```dockerfile
   # frontend/Dockerfile
   FROM node:18-alpine as build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

4. **Construir las Imágenes**
   ```bash
   # Construir todas las imágenes
   docker-compose build
   
   # O construir una imagen específica
   docker-compose build backend
   docker-compose build frontend
   ```

## Etiquetado de Imágenes

El comando `docker tag` permite crear una referencia a una imagen existente con un nuevo nombre o tag.

### Sintaxis Básica
```bash
docker tag IMAGEN_ORIGEN[:TAG] IMAGEN_DESTINO[:TAG]
```

### Ejemplos de Etiquetado

1. **Etiquetar con Versión**
   ```bash
   docker tag mi_arquetipo_santi_propio-backend:latest mi_arquetipo_santi_propio-backend:v1.0.0
   docker tag mi_arquetipo_santi_propio-frontend:latest mi_arquetipo_santi_propio-frontend:v1.0.0
   ```

2. **Etiquetar para Docker Hub**
   ```bash
   docker tag mi_arquetipo_santi_propio-backend:latest tusername/mi_arquetipo_santi_propio-backend:latest
   docker tag mi_arquetipo_santi_propio-frontend:latest tusername/mi_arquetipo_santi_propio-frontend:latest
   ```

3. **Etiquetar para Azure Container Registry**
   ```bash
   docker tag mi_arquetipo_santi_propio-backend:latest tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-backend:latest
   docker tag mi_arquetipo_santi_propio-frontend:latest tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-frontend:latest
   ```

## Subida de Imágenes a Azure Container Registry

### Configuración Inicial de Azure

1. **Iniciar Sesión en Azure CLI**
   ```bash
   az login
   ```

2. **Crear un Registro de Contenedores (si no existe)**
   ```bash
   az acr create --resource-group TuGrupoDeRecursos --name TuNombreDeRegistro --sku Basic
   ```

3. **Iniciar Sesión en el Registro de Contenedores**
   ```bash
   az acr login --name TuNombreDeRegistro
   ```

### Subir Imágenes a ACR

1. **Etiquetar las Imágenes para ACR**
   ```bash
   docker tag mi_arquetipo_santi_propio-backend:latest tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-backend:latest
   docker tag mi_arquetipo_santi_propio-frontend:latest tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-frontend:latest
   ```

2. **Subir las Imágenes**
   ```bash
   docker push tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-backend:latest
   docker push tunombrederegistro.azurecr.io/mi_arquetipo_santi_propio-frontend:latest
   ```

3. **Verificar las Imágenes Subidas**
   ```bash
   az acr repository list --name tunombrederegistro --output table
   az acr repository show-tags --name tunombrederegistro --repository mi_arquetipo_santi_propio-backend --output table
   ```

## Scripts de Automatización

En la carpeta `scripts/` encontrarás scripts útiles para automatizar estos procesos:

- `build-images.sh`: Construye todas las imágenes del proyecto
- `tag-images.sh`: Etiqueta las imágenes para diferentes repositorios
- `push-to-acr.sh`: Sube las imágenes a Azure Container Registry

Ejemplo de uso:
```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Ejecutar script de subida a ACR
./scripts/push-to-acr.sh
```

## Comandos Útiles

### Gestión de Imágenes
```bash
# Listar todas las imágenes
docker images

# Eliminar una imagen específica
docker rmi NOMBRE_IMAGEN:TAG

# Eliminar todas las imágenes
docker rmi $(docker images -q) -f

# Limpiar imágenes no utilizadas
docker image prune
```

### Gestión de Contenedores
```bash
# Listar contenedores en ejecución
docker ps

# Listar todos los contenedores
docker ps -a

# Detener todos los contenedores
docker stop $(docker ps -a -q)

# Eliminar todos los contenedores
docker rm $(docker ps -a -q)
```

### Docker Compose
```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reconstruir e iniciar servicios
docker-compose up -d --build
``` 