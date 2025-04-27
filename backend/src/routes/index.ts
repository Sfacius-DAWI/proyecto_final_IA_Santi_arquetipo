import { FastifyInstance } from 'fastify';
import dbTestRoutes from './db-test';
import healthRoutes from './health';

/**
 * Registra automáticamente todas las rutas en la carpeta routes
 * @param fastify - Instancia de Fastify
 */
export async function routes(fastify: FastifyInstance): Promise<void> {
  // Registrar las rutas de prueba de base de datos
  await fastify.register(dbTestRoutes);
  
  // Registrar las rutas de health check
  await fastify.register(healthRoutes);
  
  // Ruta de prueba base
  fastify.get('/', async () => {
    return { message: 'API funcionando correctamente' };
  });
} 