import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { deleteTour as deleteTourService } from '../../../services/tours/index.js'; // Ajustada
import { DeleteTourEndpointSchema } from './schemas/tour.schema.js';
import { Static } from '@sinclair/typebox';

type DeleteTourParamsType = Static<typeof DeleteTourEndpointSchema.params>;

export default async function (fastify: FastifyInstance) {
  fastify.delete<
    { Params: DeleteTourParamsType }
  >('/:id', { // Ruta es /:id relativa al prefijo /api/tours
    schema: DeleteTourEndpointSchema,
  }, async (request: FastifyRequest<{ Params: DeleteTourParamsType }>, reply: FastifyReply) => {
    try {
      await deleteTourService(request.params.id);
      return reply.code(204).send(); 
    } catch (error: any) {
      request.log.error('Error al eliminar tour en ruta:', error);
      if (error.code === 'P2025') { 
        return reply.code(404).send({ error: 'Tour no encontrado para eliminar', message: error.message });
      }
      return reply.code(500).send({ error: 'Error al eliminar el tour', message: error.message });
    }
  });
} 