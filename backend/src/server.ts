import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index';
import { initDatabase } from './config/database';
import dotenv from 'dotenv';

// Cargar variables de entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envFile });

// Configuración de variables de entorno
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const API_VERSION = process.env.API_VERSION || 'v1';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Crear servidor Fastify
const server: FastifyInstance = Fastify({
  logger: true
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
    console.log('Iniciando servidor...');
    console.log(`Puerto configurado: ${PORT}`);
    
    // Inicializar conexión a la base de datos
    try {
      const dbConnected = await initDatabase();
      if (!dbConnected) {
        console.warn('No se pudo conectar a la base de datos. Algunas funcionalidades podrían no estar disponibles.');
      }
    } catch (dbError) {
      console.error('Error al conectar con la base de datos:', dbError);
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      } else {
        console.warn('Continuando sin conexión a base de datos en modo producción.');
      }
    }
    
    // Registrar plugins con CORS configurado para permitir frontend
    await server.register(cors, { 
      origin: CORS_ORIGIN
    });

    // Registrar rutas
    await routes(server);

    // Iniciar servidor
    console.log('Intentando iniciar el servidor...');
    await server.listen({ port: PORT, host: HOST });
    console.log(`Servidor iniciado en puerto ${PORT}`);
    
    server.log.info(`Servidor ejecutándose en http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    server.log.error(err);
    process.exit(1);
  }
}

start(); 