import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllTours as getAllToursService } from '../../../services/tours/index.js'; // Ajustada
import { GetAllToursEndpointSchema } from './schemas/tour.schema.js'; 
import { Prisma } from '@prisma/client'; 
import { Static } from '@sinclair/typebox';

type GetToursQueryType = Static<typeof GetAllToursEndpointSchema.querystring>;

export default async function (fastify: FastifyInstance) {
  fastify.get<
    { Querystring: GetToursQueryType }
  >('/', { // Ruta base '/' ya que el prefijo /api/tours se aplica en el index principal de rutas
    schema: GetAllToursEndpointSchema,
  }, async (request: FastifyRequest<{ Querystring: GetToursQueryType }>, reply: FastifyReply) => {
    try {
      const filters = request.query as Prisma.TourWhereInput; 
      const tours = await getAllToursService(filters);
      return reply.send(tours);
    } catch (error: any) {
      request.log.error('Error al obtener tours en ruta:', error);
      return reply.code(500).send({ error: 'Error al obtener los tours', message: error.message });
    }
  });
} 