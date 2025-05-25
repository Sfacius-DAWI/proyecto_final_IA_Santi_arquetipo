FROM node:18

WORKDIR /app

# Instalar herramientas básicas
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias globales
RUN npm install -g tsx prisma

# Comando por defecto
CMD ["bash"] 