import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseService } from '../../services/purchases/purchase.service.js';
import { purchaseSchema, purchaseResponseSchema } from './purchase.schema.js';

const purchaseService = new PurchaseService();

interface CreatePurchaseBody {
  tourId: string;
  cantidad: number;
  metodoPago: string;
  precioTotal: number;
}

export const purchaseControllers = {
  async getUserPurchases(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Usuario no autenticado' });
      }

      const purchases = await purchaseService.getUserPurchases(userId);
      return reply.send(purchases);
    } catch (error) {
      request.log.error('Error al obtener las compras:', error);
      return reply.code(500).send({ 
        error: 'Error al obtener las compras',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  async createPurchase(request: FastifyRequest<{ Body: CreatePurchaseBody }>, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Usuario no autenticado' });
      }

      const { tourId, cantidad, metodoPago, precioTotal } = request.body;

      const purchase = await purchaseService.createPurchase({
        cantidad,
        metodoPago,
        precioTotal,
        estado: 'PENDIENTE',
        user: {
          connect: { id: userId }
        },
        tour: {
          connect: { id: tourId }
        }
      });

      return reply.code(201).send(purchase);
    } catch (error) {
      request.log.error('Error al crear la compra:', error);
      if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
        return reply.code(400).send({ 
          error: 'Tour no encontrado',
          message: 'El tour especificado no existe'
        });
      }
      return reply.code(500).send({ 
        error: 'Error al crear la compra',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  async getPurchaseById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Usuario no autenticado' });
      }

      const { id } = request.params;
      const purchase = await purchaseService.getPurchaseById(id, userId);
      
      if (!purchase) {
        return reply.code(404).send({ error: 'Compra no encontrada' });
      }

      return reply.send(purchase);
    } catch (error) {
      request.log.error('Error al obtener la compra:', error);
      return reply.code(500).send({ 
        error: 'Error al obtener la compra',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  async updatePurchase(request: FastifyRequest<{ 
    Params: { id: string }, 
    Body: { cantidad?: number, fechaReservada?: string } 
  }>, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Usuario no autenticado' });
      }

      const { id } = request.params;
      const updateData = request.body;

      const purchase = await purchaseService.updatePurchase(id, userId, updateData);
      
      if (!purchase) {
        return reply.code(404).send({ error: 'Compra no encontrada' });
      }

      return reply.send(purchase);
    } catch (error) {
      request.log.error('Error al actualizar la compra:', error);
      return reply.code(500).send({ 
        error: 'Error al actualizar la compra',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  async cancelPurchase(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Usuario no autenticado' });
      }

      const { id } = request.params;
      const purchase = await purchaseService.cancelPurchase(id, userId);
      
      if (!purchase) {
        return reply.code(404).send({ error: 'Compra no encontrada' });
      }

      return reply.send(purchase);
    } catch (error) {
      request.log.error('Error al cancelar la compra:', error);
      return reply.code(500).send({ 
        error: 'Error al cancelar la compra',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}; 