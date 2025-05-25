import { FastifyInstance } from 'fastify';
import { tourControllers } from '../../controllers/tours/index.js';

export default async function (fastify: FastifyInstance) {
  fastify.get('/tours', tourControllers.getAllTours);
} 