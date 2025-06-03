import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFeaturedTours as getFeaturedToursService } from '../../../services/tours/index.js'; // Ajustada
import { GetFeaturedToursEndpointSchema } from './schemas/tour.schema.js';
import { Static } from '@sinclair/typebox';

type GetFeaturedToursQueryType = Static<typeof GetFeaturedToursEndpointSchema.querystring>;

export default async function (fastify: FastifyInstance) {
  fastify.get<
    { Querystring: GetFeaturedToursQueryType }
  >('/featured', { // Ruta es /featured relativa al prefijo /api/tours
    schema: GetFeaturedToursEndpointSchema,
  }, async (request: FastifyRequest<{ Querystring: GetFeaturedToursQueryType }>, reply: FastifyReply) => {
    try {
      const limit = request.query.limit ? (typeof request.query.limit === 'string' ? parseInt(request.query.limit, 10) : request.query.limit) : 4;
      const tours = await getFeaturedToursService(limit);
      return reply.send(tours);
    } catch (error: any) {
      request.log.error('Error al obtener tours destacados en ruta:', error);
      return reply.code(500).send({ error: 'Error al obtener los tours destacados', message: error.message });
    }
  });
} 