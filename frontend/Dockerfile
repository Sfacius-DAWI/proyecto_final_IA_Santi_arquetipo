FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Configurar variables de entorno para npm
ENV npm_config_build_from_source=true
ENV ROLLUP_SKIP_LOAD_NATIVE_PLUGIN=true
ENV ROLLUP_NATIVE_PLUGIN=0

# Copiar archivos de package.json
COPY package*.json ./

# Limpiar e instalar dependencias
RUN rm -rf node_modules package-lock.json
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Etapa de desarrollo
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios desde el stage de build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/tsconfig*.json ./

# Variables de entorno
ENV NODE_ENV=development
ENV PORT=8080
ENV VITE_BACKEND_URL=http://backend:3003

EXPOSE 8080

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"] 