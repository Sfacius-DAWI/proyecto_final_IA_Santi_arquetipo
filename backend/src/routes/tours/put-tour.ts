import { FastifyInstance } from 'fastify';
import { tourControllers, tourSchema } from '../../controllers/tours/index.js';

export default async function (fastify: FastifyInstance) {
  fastify.put('/tours/:id', {
    schema: {
      body: tourSchema,
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, tourControllers.updateTour);
} 