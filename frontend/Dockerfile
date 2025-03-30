FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de package.json
COPY package*.json ./
COPY santi-proyect/package*.json ./santi-proyect/

# Instalar dependencias
RUN npm install
RUN cd santi-proyect && npm install

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Servidor de producción
FROM nginx:alpine
COPY --from=build /app/santi-proyect/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 