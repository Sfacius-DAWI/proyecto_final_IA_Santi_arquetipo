import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getUserPurchases as getUserPurchasesService } from '../../../services/purchases/index.js'; 
import { GetUserPurchasesSchema } from './schemas/purchase.schema.js';
import { verifyAuth } from '../../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/purchases aplicado por el cargador dinámico
  // Esta ruta se registrará como GET /api/purchases/user
  fastify.get('/user', {
    onRequest: [verifyAuth],
    schema: GetUserPurchasesSchema, 
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Usuario no autenticado' });
        }
        const purchases = await getUserPurchasesService(userId);
        return reply.send(purchases);
      } catch (error) {
        request.log.error('Error al obtener las compras del usuario:', error);
        return reply.code(500).send({ error: 'Error al obtener las compras del usuario', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  });
} 