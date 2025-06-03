import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox'; // Necesario si se infiere el tipo del body
import { createPurchase as createPurchaseService } from '../../../services/purchases/index.js'; 
import { CreatePurchaseEndpointSchema } from './schemas/purchase.schema.js';
import { verifyAuth } from '../../../middleware/auth.js'; 

// Inferir tipo del body desde el schema para mayor seguridad de tipos
type CreatePurchaseBody = Static<typeof CreatePurchaseEndpointSchema.body>;

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/purchases aplicado por el cargador dinámico
  // Esta ruta se registrará como POST /api/purchases/
  fastify.post<
    { Body: CreatePurchaseBody }
  >('/', {
    onRequest: [verifyAuth],
    schema: CreatePurchaseEndpointSchema, 
    handler: async (request: FastifyRequest<{ Body: CreatePurchaseBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Usuario no autenticado' });
        }
        // El body ya está validado por Fastify según el schema
        const { tourId, cantidad, metodoPago, precioTotal } = request.body;
        const purchase = await createPurchaseService({
          cantidad,
          metodoPago,
          precioTotal,
          estado: 'PENDIENTE',
          user: { connect: { id: userId } },
          tour: { connect: { id: tourId } }
        });
        return reply.code(201).send(purchase);
      } catch (error:any) {
        request.log.error('Error al crear la compra:', error);
        if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
          return reply.code(400).send({ error: 'Tour no encontrado', message: 'El tour especificado no existe' });
        }
        if (error instanceof Error && error.message.includes('precio total no coincide')){
            return reply.code(400).send({ error: 'Error de validación de precio', message: error.message });
        }
        if (error instanceof Error && error.message.includes('Tour no disponible')){
            return reply.code(400).send({ error: 'Tour no disponible', message: error.message });
        }
        return reply.code(500).send({ error: 'Error al crear la compra', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  });
} 