import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index';

// Configuración de variables de entorno
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const API_VERSION = process.env.API_VERSION || 'v1';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Crear servidor Fastify
const server: FastifyInstance = Fastify({
  logger: {
    level: LOG_LEVEL,
    serializers: {
      res(reply) {
        return {
          statusCode: reply.statusCode,
          responseTime: reply.elapsedTime
        };
      }
    }
  },
  trustProxy: true,
  connectionTimeout: REQUEST_TIMEOUT
});

// Manejar señales de terminación para graceful shutdown
function gracefulShutdown(signal: string) {
  return async () => {
    server.log.info(`Señal ${signal} recibida. Cerrando servidor...`);
    try {
      await server.close();
      server.log.info('Servidor cerrado correctamente');
      process.exit(0);
    } catch (err) {
      server.log.error('Error al cerrar el servidor:', err);
      process.exit(1);
    }
  };
}

// Registrar handlers para graceful shutdown
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

async function start() {
  try {
    // Registrar plugins con CORS configurado para permitir frontend
    await server.register(cors, { 
      origin: CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });

    server.log.info(`CORS configurado para origen: ${CORS_ORIGIN}`);

    // Configurar encabezados de seguridad globales
    server.addHook('onSend', (request, reply, payload, done) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('X-XSS-Protection', '1; mode=block');
      done(null, payload);
    });

    // Registrar rutas
    routes(server);

    // Iniciar servidor
    await server.listen({ port: PORT, host: HOST });
    
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    
    server.log.info(`Microservicio backend (API ${API_VERSION}) ejecutándose en http://${HOST}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start(); 