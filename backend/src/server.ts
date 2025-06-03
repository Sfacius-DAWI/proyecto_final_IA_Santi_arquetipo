import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index.js';
import { initDatabase } from './config/database.js';
import dotenv from 'dotenv';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

// Cargar variables de entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envFile });

// Configuración de variables de entorno
const PORT = parseInt(process.env.PORT || '3003', 10);
const HOST = process.env.HOST || '0.0.0.0';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const API_VERSION = process.env.API_VERSION || 'v1';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Crear servidor Fastify con soporte de TypeBox para tipado estricto
const server = Fastify({
  logger: {
    level: LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }
}).withTypeProvider<TypeBoxTypeProvider>();

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

// Registrar manejadores de señales
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

// Agregar hook global para logging
server.addHook('onRequest', (request, reply, done) => {
  request.log.info(`Incoming ${request.method} ${request.url}`);
  done();
});

server.addHook('onResponse', (request, reply, done) => {
  request.log.info(`Response ${reply.statusCode} for ${request.method} ${request.url}`);
  done();
});

async function start() {
  try {
    console.log('Iniciando servidor...');
    console.log(`Puerto configurado: ${PORT}`);
    console.log('Variables de entorno:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      PORT,
      HOST,
      LOG_LEVEL,
      API_VERSION,
      CORS_ORIGIN
    });
    
    // Inicializar conexión a la base de datos
    try {
      const dbConnected = await initDatabase();
      if (!dbConnected) {
        console.warn('No se pudo conectar a la base de datos. Algunas funcionalidades podrían no estar disponibles.');
      } else {
        console.log('Conexión a la base de datos establecida correctamente');
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
      origin: process.env.NODE_ENV === 'development' 
        ? ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:3000']
        : CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      exposedHeaders: ['set-cookie']
    });
    console.log('CORS configurado correctamente para orígenes:', process.env.NODE_ENV === 'development' 
      ? ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:3000']
      : CORS_ORIGIN);

    // Registrar rutas
    console.log('Registrando rutas...');
    await routes(server);
    console.log('Rutas registradas correctamente');

    // Iniciar servidor
    console.log('Intentando iniciar el servidor...');
    await server.listen({ port: PORT, host: HOST });
    console.log(`Servidor iniciado en puerto ${PORT}`);
    
    server.log.info(`Servidor ejecutándose en http://${HOST}:${PORT}`);

    // Imprimir rutas registradas
    console.log('Rutas disponibles:');
    server.printRoutes();
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    server.log.error(err);
    process.exit(1);
  }
}

start(); 