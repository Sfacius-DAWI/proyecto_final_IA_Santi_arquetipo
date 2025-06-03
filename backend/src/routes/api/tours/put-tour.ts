import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { updateTour as updateTourService } from '../../../services/tours/index.js'; // Ajustada
import { UpdateTourEndpointSchema } from './schemas/tour.schema.js';
import { Static } from '@sinclair/typebox';
import { Prisma } from '@prisma/client';

type UpdateTourParamsType = Static<typeof UpdateTourEndpointSchema.params>;
type UpdateTourBodyType = Static<typeof UpdateTourEndpointSchema.body>;

export default async function (fastify: FastifyInstance) {
  fastify.put<
    { Params: UpdateTourParamsType; Body: UpdateTourBodyType }
  >('/:id', { // Ruta es /:id relativa al prefijo /api/tours
    schema: UpdateTourEndpointSchema,
  }, async (request: FastifyRequest<{ Params: UpdateTourParamsType; Body: UpdateTourBodyType }>, reply: FastifyReply) => {
    try {
      const tourData = request.body;
      const tour = await updateTourService(request.params.id, tourData as Prisma.TourUpdateInput);
      return reply.send(tour);
    } catch (error: any) {
      request.log.error('Error al actualizar tour en ruta:', error);
      if (error.code === 'P2025') { 
        return reply.code(404).send({ error: 'Tour no encontrado para actualizar', message: error.message });
      }
      return reply.code(500).send({ error: 'Error al actualizar el tour', message: error.message });
    }
  });
} 