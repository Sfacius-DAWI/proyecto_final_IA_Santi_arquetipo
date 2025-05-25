import { FastifyInstance } from 'fastify';
import { tourControllers, tourSchema } from '../../controllers/tours/index.js';

export default async function (fastify: FastifyInstance) {
  fastify.post('/tours', {
    schema: {
      body: tourSchema,
      response: {
        201: tourSchema
      }
    }
  }, tourControllers.createTour);
}