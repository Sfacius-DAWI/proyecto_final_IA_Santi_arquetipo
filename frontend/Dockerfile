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

# Servidor de producción
FROM nginx:alpine

# Crear directorios requeridos por Azure App Service
RUN mkdir -p /home/LogFiles /opt/startup

# Copiar archivos estáticos
COPY --from=build /app/dist /home/site/wwwroot

# Copiar configuración de nginx
COPY santi-proyect/nginx.conf /etc/nginx/conf.d/default.conf.template

# Script para procesar variables de entorno y iniciar nginx
COPY docker-entrypoint.sh /opt/startup/docker-entrypoint.sh
RUN chmod +x /opt/startup/docker-entrypoint.sh

# Configurar entorno
ENV NODE_ENV=production
ENV BACKEND_URL=/api/
ENV API_TIMEOUT=30000
ENV PORT=80
ENV WEBSITES_PORT=80

EXPOSE 80

ENTRYPOINT ["/opt/startup/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 