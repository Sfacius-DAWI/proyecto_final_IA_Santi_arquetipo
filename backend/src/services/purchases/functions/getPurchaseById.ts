import { PrismaClient, Compra } from '@prisma/client';

const prisma = new PrismaClient();

export const getPurchaseById = async (purchaseId: string, userId: string): Promise<Compra | null> => {
  try {
    return await prisma.compra.findFirst({
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
}; 