# Build stage
FROM node:18 as builder

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    openssl \
    postgresql-client \
    netcat-traditional \
    python3 \
    make \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración primero
COPY package*.json tsconfig.json ./
RUN npm install

# Copiar código fuente y configuración
COPY . .

# Generar cliente de Prisma y construir
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

# Production stage
FROM node:18

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    openssl \
    postgresql-client \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos construidos y configuración
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/start.sh ./

# Dar permisos de ejecución al script de inicio
RUN chmod +x start.sh

# Variables de entorno
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=3003
ENV API_VERSION=v1
ENV LOG_LEVEL=info

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

EXPOSE 3003

# Comando para iniciar el microservicio
CMD ["./start.sh"]