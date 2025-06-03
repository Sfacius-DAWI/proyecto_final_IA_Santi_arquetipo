import { PrismaClient, Compra } from '@prisma/client';

const prisma = new PrismaClient();

export const cancelPurchase = async (purchaseId: string, userId: string): Promise<Compra | null> => {
  try {
    const existingPurchase = await prisma.compra.findFirst({
      where: { 
        id: purchaseId,
        userId: userId,
        estado: { in: ['PENDIENTE', 'COMPLETADO'] }
      }
    });

    if (!existingPurchase) {
      return null;
    }

    return await prisma.compra.update({
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
}; 