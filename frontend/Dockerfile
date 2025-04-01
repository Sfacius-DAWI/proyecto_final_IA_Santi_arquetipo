FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY astro-project/package.json astro-project/package-lock.json* ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY astro-project/ ./
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 