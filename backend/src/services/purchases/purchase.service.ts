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
} 