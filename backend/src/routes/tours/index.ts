import { FastifyInstance } from 'fastify';

// Importamos todas las rutas
import postTour from './post-tours.js';
import getTours from './get-tours.js';
import getTourById from './get-tour-by-id.js';
import putTour from './put-tour.js';
import deleteTour from './delete-tour.js';

export default async function (fastify: FastifyInstance) {
  // Middleware para eventos
  fastify.addHook('onRequest', async (request) => {
    request.log.info(`Incoming ${request.method} request to ${request.url}`);
  });

  // Registramos todas las rutas
  await fastify.register(postTour);
  await fastify.register(getTours);
  await fastify.register(getTourById);
  await fastify.register(putTour);
  await fastify.register(deleteTour);
} 