import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { updatePurchase as updatePurchaseService } from '../../../services/purchases/index.js'; 
import { UpdatePurchaseEndpointSchema } from './schemas/purchase.schema.js';
import { verifyAuth } from '../../../middleware/auth.js';

// Inferir tipos de Params y Body
type IdParams = Static<typeof UpdatePurchaseEndpointSchema.params>;
type UpdatePurchaseBody = Static<typeof UpdatePurchaseEndpointSchema.body>;

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/purchases aplicado por el cargador dinámico
  // Esta ruta se registrará como PUT /api/purchases/:id
  fastify.put<
    { Params: IdParams; Body: UpdatePurchaseBody }
  >('/:id', {
    onRequest: [verifyAuth],
    schema: UpdatePurchaseEndpointSchema, 
    handler: async (request: FastifyRequest<{ Params: IdParams; Body: UpdatePurchaseBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Usuario no autenticado' });
        }
        const { id } = request.params;
        const updateData = request.body;
        const purchase = await updatePurchaseService(id, userId, updateData);
        if (!purchase) {
          return reply.code(404).send({ error: 'Compra no encontrada o no actualizable' });
        }
        return reply.send(purchase);
      } catch (error: any) {
        request.log.error('Error al actualizar la compra:', error);
        return reply.code(500).send({ error: 'Error al actualizar la compra', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  });
} 