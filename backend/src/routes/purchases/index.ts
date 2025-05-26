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

  // Obtener una compra específica por ID
  fastify.get('/purchases/:id', {
    onRequest: [verifyAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: purchaseResponseSchema
      }
    },
    handler: purchaseControllers.getPurchaseById
  });

  // Actualizar una compra
  fastify.put('/purchases/:id', {
    onRequest: [verifyAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          cantidad: { type: 'integer', minimum: 1 },
          fechaReservada: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: purchaseResponseSchema
      }
    },
    handler: purchaseControllers.updatePurchase
  });

  // Cancelar una compra
  fastify.post('/purchases/:id/cancel', {
    onRequest: [verifyAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: purchaseResponseSchema
      }
    },
    handler: purchaseControllers.cancelPurchase
  });
} 