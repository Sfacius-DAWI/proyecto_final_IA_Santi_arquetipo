import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { cancelPurchase as cancelPurchaseService } from '../../../services/purchases/index.js'; 
import { CancelPurchaseEndpointSchema } from './schemas/purchase.schema.js';
import { verifyAuth } from '../../../middleware/auth.js';

// Inferir tipo de los parámetros
type IdParams = Static<typeof CancelPurchaseEndpointSchema.params>;

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/purchases aplicado por el cargador dinámico
  // Esta ruta se registrará como POST /api/purchases/:id/cancel
  fastify.post<
    { Params: IdParams }
  >('/:id/cancel', {
    onRequest: [verifyAuth],
    schema: CancelPurchaseEndpointSchema, 
    handler: async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Usuario no autenticado' });
        }
        const { id } = request.params;
        const purchase = await cancelPurchaseService(id, userId);
        if (!purchase) {
          return reply.code(404).send({ error: 'Compra no encontrada o no cancelable' });
        }
        return reply.send(purchase);
      } catch (error) {
        request.log.error('Error al cancelar la compra:', error);
        return reply.code(500).send({ error: 'Error al cancelar la compra', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  });
} 