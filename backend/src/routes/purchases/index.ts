import { FastifyInstance } from 'fastify';
import { purchaseControllers } from '../../controllers/purchases/purchase.controller.js';
import { verifyAuth } from '../../middleware/auth.js';
import { purchaseSchema, purchaseResponseSchema } from '../../controllers/purchases/purchase.schema.js';

export default async function purchaseRoutes(fastify: FastifyInstance) {
  // Obtener compras del usuario
  fastify.get('/purchases/user', {
    onRequest: [verifyAuth],
    schema: {
      response: {
        200: {
          type: 'array',
          items: purchaseResponseSchema
        }
      }
    },
    handler: purchaseControllers.getUserPurchases
  });

  // Crear una nueva compra
  fastify.post('/purchases', {
    onRequest: [verifyAuth],
    schema: {
      body: purchaseSchema,
      response: {
        201: purchaseResponseSchema
      }
    },
    handler: purchaseControllers.createPurchase
  });
} 