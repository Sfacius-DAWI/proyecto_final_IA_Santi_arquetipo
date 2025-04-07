FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de package.json
COPY santi-proyect/package*.json ./

# Instalar dependencias con --legacy-peer-deps para resolver conflictos
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY santi-proyect/ .

# Construir aplicación
RUN npm run build

# Etapa de producción - también usamos node
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios desde el stage de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./

# Instalar solo dependencias de producción
RUN npm install --production --legacy-peer-deps

# Variables de entorno para microservicios
ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_URL=/api/
ENV API_TIMEOUT=30000

# Healthcheck para orquestación de microservicios
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# Comando para iniciar el servicio (directamente, sin usar docker-entrypoint.sh)
CMD ["node", "server.js"]