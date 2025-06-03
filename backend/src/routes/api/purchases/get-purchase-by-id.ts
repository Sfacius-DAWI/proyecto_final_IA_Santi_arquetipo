import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { getPurchaseById as getPurchaseByIdService } from '../../../services/purchases/index.js'; 
import { GetPurchaseByIdEndpointSchema } from './schemas/purchase.schema.js';
import { verifyAuth } from '../../../middleware/auth.js';

// Inferir tipo de los parámetros
type IdParams = Static<typeof GetPurchaseByIdEndpointSchema.params>;

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/purchases aplicado por el cargador dinámico
  // Esta ruta se registrará como GET /api/purchases/:id
  fastify.get<
    { Params: IdParams }
  >('/:id', {
    onRequest: [verifyAuth],
    schema: GetPurchaseByIdEndpointSchema, 
    handler: async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Usuario no autenticado' });
        }
        const { id } = request.params;
        const purchase = await getPurchaseByIdService(id, userId);
        if (!purchase) {
          return reply.code(404).send({ error: 'Compra no encontrada' });
        }
        return reply.send(purchase);
      } catch (error) {
        request.log.error('Error al obtener la compra por ID:', error);
        return reply.code(500).send({ error: 'Error al obtener la compra por ID', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  });
} 