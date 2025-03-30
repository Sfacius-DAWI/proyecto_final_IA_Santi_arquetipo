# Backend con Fastify y TypeScript

Este es un backend simple construido con Fastify y TypeScript.

## Requisitos

- Node.js (v14 o superior)
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install

# O si usas yarn
yarn install
```

## Scripts disponibles

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Compilar el proyecto
npm run build

# Iniciar en producción
npm run start
```

## Estructura del proyecto

```
backend/
├── src/
│   ├── controllers/     # Controladores de la aplicación
│   ├── routes/          # Definición de rutas
│   └── server.ts        # Punto de entrada de la aplicación
├── package.json
└── tsconfig.json
```

## Endpoints API

- `GET /`: Ruta base que devuelve un mensaje de estado
- `GET /health`: Ruta de verificación de estado del servidor 