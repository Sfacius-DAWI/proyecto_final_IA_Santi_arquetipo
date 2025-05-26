import { PrismaClient, Compra, Prisma } from '@prisma/client';

export class PurchaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserPurchases(userId: string): Promise<Compra[]> {
    try {
      return await this.prisma.compra.findMany({
        where: { userId },
        include: {
          tour: {
            select: {
              titulo: true,
              imagen: true,
              descripcion: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error al obtener las compras del usuario:', error);
      throw error;
    }
  }

  async createPurchase(data: Prisma.CompraCreateInput): Promise<Compra> {
    try {
      // Verificar que el tour existe y está disponible
      const tour = await this.prisma.tour.findUnique({
        where: { id: data.tour.connect?.id },
        select: { disponible: true, precio: true }
      });

      if (!tour) {
        throw new Error('Tour no encontrado');
      }

      if (!tour.disponible) {
        throw new Error('Tour no disponible para compra');
      }

      // Verificar que el precio total es correcto
      const precioCalculado = Number(tour.precio) * data.cantidad;
      if (Math.abs(precioCalculado - Number(data.precioTotal)) > 0.01) {
        throw new Error('El precio total no coincide con el cálculo esperado');
      }

      return await this.prisma.compra.create({
        data,
        include: {
          tour: {
            select: {
              titulo: true,
              imagen: true,
              descripcion: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al crear la compra:', error);
      throw error;
    }
  }

  async getPurchaseById(purchaseId: string, userId: string): Promise<Compra | null> {
    try {
      return await this.prisma.compra.findFirst({
        where: { 
          id: purchaseId,
          userId: userId
        },
        include: {
          tour: {
            select: {
              titulo: true,
              imagen: true,
              descripcion: true,
              precio: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener la compra por ID:', error);
      throw error;
    }
  }

  async updatePurchase(purchaseId: string, userId: string, updateData: { cantidad?: number, fechaReservada?: string }): Promise<Compra | null> {
    try {
      // Verificar que la compra existe y pertenece al usuario
      const existingPurchase = await this.prisma.compra.findFirst({
        where: { 
          id: purchaseId,
          userId: userId,
          estado: { in: ['PENDIENTE', 'COMPLETADO'] }
        }
      });

      if (!existingPurchase) {
        return null;
      }

      // Si se actualiza la cantidad, recalcular el precio total
      let newPrecioTotal = existingPurchase.precioTotal;
      if (updateData.cantidad && updateData.cantidad !== existingPurchase.cantidad) {
        const tour = await this.prisma.tour.findUnique({
          where: { id: existingPurchase.tourId },
          select: { precio: true }
        });

                 if (tour) {
           newPrecioTotal = tour.precio.mul(updateData.cantidad);
         }
      }

      return await this.prisma.compra.update({
        where: { id: purchaseId },
        data: {
          ...updateData,
          ...(updateData.cantidad && { precioTotal: newPrecioTotal })
        },
        include: {
          tour: {
            select: {
              titulo: true,
              imagen: true,
              descripcion: true,
              precio: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al actualizar la compra:', error);
      throw error;
    }
  }

  async cancelPurchase(purchaseId: string, userId: string): Promise<Compra | null> {
    try {
      // Verificar que la compra existe y pertenece al usuario
      const existingPurchase = await this.prisma.compra.findFirst({
        where: { 
          id: purchaseId,
          userId: userId,
          estado: { in: ['PENDIENTE', 'COMPLETADO'] }
        }
      });

      if (!existingPurchase) {
        return null;
      }

      return await this.prisma.compra.update({
        where: { id: purchaseId },
        data: {
          estado: 'CANCELADO'
        },
        include: {
          tour: {
            select: {
              titulo: true,
              imagen: true,
              descripcion: true,
              precio: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      throw error;
    }
  }
} 