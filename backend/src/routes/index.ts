import { FastifyInstance } from 'fastify';
import dbTestRoutes from './db-test';

/**
 * Registra automáticamente todas las rutas en la carpeta routes
 * @param fastify - Instancia de Fastify
 */
export async function routes(fastify: FastifyInstance): Promise<void> {
  // Registrar las rutas de prueba de base de datos
  await fastify.register(dbTestRoutes);
  
  // Ruta de prueba base
  fastify.get('/', async () => {
    return { message: 'API funcionando correctamente' };
  });
} 