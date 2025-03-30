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