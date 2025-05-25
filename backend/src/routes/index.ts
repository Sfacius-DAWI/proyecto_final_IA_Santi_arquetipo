import { FastifyInstance } from 'fastify';
import tourRoutes from './tours/index.js';
import purchaseRoutes from './purchases/index.js';
import healthRoutes from './health.js';

export async function routes(fastify: FastifyInstance): Promise<void> {
  // Ruta de prueba base
  fastify.get('/', async () => {
    return { message: 'API funcionando correctamente' };
  });

  // Registrar rutas de health check con menos logs
  await fastify.register(healthRoutes, { prefix: '/health', logLevel: 'error' });

  // Registrar rutas de tours bajo /api
  console.log('Registrando rutas de tours...');
  await fastify.register(tourRoutes, { prefix: '/api' });
  
  // Registrar rutas de compras bajo /api
  console.log('Registrando rutas de compras...');
  await fastify.register(purchaseRoutes, { prefix: '/api' });

  // Imprimir todas las rutas registradas de manera más legible
  const routes = fastify.printRoutes();
  console.log('\nRutas registradas:');
  console.log(routes);
} 