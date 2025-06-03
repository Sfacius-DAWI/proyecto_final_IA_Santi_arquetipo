import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createTour as createTourService } from '../../../services/tours/index.js'; // Ajustada ruta de importación
import { Prisma } from '@prisma/client';
import { CreateTourEndpointSchema } from './schemas/tour.schema.js'; 
import { Static } from '@sinclair/typebox';

type CreateTourBody = Static<typeof CreateTourEndpointSchema.body>;

export default async function (fastify: FastifyInstance) {
  fastify.post<
    { Body: CreateTourBody }
  >('/', { // La ruta es '/' porque el prefijo /api/tours se aplica al registrar este módulo
    schema: CreateTourEndpointSchema,
  }, async (request: FastifyRequest<{ Body: CreateTourBody }>, reply: FastifyReply) => {
    try {
      const tourData = request.body;
      const tour = await createTourService(tourData as Prisma.TourCreateInput);
      return reply.code(201).send(tour);
    } catch (error: any) {
      request.log.error('Error al crear tour en ruta:', error);
      return reply.code(500).send({ error: 'Error al crear el tour', message: error.message });
    }
  });
} 