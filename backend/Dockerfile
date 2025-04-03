FROM node:18-alpine

# Configurar SSH
ENV SSH_PASSWD "root:Docker!"
RUN mkdir -p /home/LogFiles /opt/startup /home/site/wwwroot

# Crear directorio para la aplicación
WORKDIR /home/site/wwwroot

# Copiar archivos de package.json
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .
RUN npm run build

# Configurar entorno
ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 3000
ENV WEBSITES_PORT=3000
ENV WEBSITE_HTTPLOGGING_RETENTION_DAYS=7
ENV WEBSITES_ENABLE_APP_SERVICE_STORAGE=true
ENV WEBSITES_CONTAINER_START_TIME_LIMIT=900

# Exponer puertos para la aplicación y SSH
EXPOSE 3000 2222

# Comando para iniciar la aplicación
CMD ["npm", "start"] 