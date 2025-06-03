import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getTourById as getTourByIdService } from '../../../services/tours/index.js'; // Ajustada
import { GetTourByIdEndpointSchema } from './schemas/tour.schema.js';
import { Static } from '@sinclair/typebox';

type GetTourByIdParamsType = Static<typeof GetTourByIdEndpointSchema.params>;

export default async function (fastify: FastifyInstance) {
  fastify.get<
    { Params: GetTourByIdParamsType }
  >('/:id', { // Ruta es /:id relativa al prefijo /api/tours
    schema: GetTourByIdEndpointSchema,
  }, async (request: FastifyRequest<{ Params: GetTourByIdParamsType }>, reply: FastifyReply) => {
    try {
      const tour = await getTourByIdService(request.params.id);
      if (!tour) {
        return reply.code(404).send({ error: 'Tour no encontrado' });
      }
      return reply.send(tour);
    } catch (error: any) {
      request.log.error('Error al obtener tour por ID en ruta:', error);
      return reply.code(500).send({ error: 'Error al obtener el tour', message: error.message });
    }
  });
} 