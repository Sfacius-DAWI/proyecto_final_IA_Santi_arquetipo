# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copiar archivos de package.json e instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios desde el stage de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm install --production --legacy-peer-deps

# Variables de entorno para microservicios
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3003
ENV API_VERSION=v1
ENV LOG_LEVEL=info
ENV REQUEST_TIMEOUT=30000

# Variables de entorno para la base de datos (valores por defecto)
ENV POSTGRES_HOST=host.docker.internal
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=miappdb
ENV POSTGRES_USER=apiuser
ENV POSTGRES_PASSWORD=apipass
ENV POSTGRES_SSL=false
ENV DB_CONNECTION_REQUIRED=false

# Healthcheck para orquestación de microservicios
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

EXPOSE 3003

# Comando para iniciar el microservicio
CMD ["node", "dist/server.js"]