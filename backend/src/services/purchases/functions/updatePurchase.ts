import { PrismaClient, Compra, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library.js'; // Necesario para el tipo Decimal

const prisma = new PrismaClient();

export const updatePurchase = async (purchaseId: string, userId: string, updateData: { cantidad?: number, fechaReservada?: string }): Promise<Compra | null> => {
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

    let newPrecioTotal = existingPurchase.precioTotal;
    if (updateData.cantidad && updateData.cantidad !== existingPurchase.cantidad) {
      const tour = await prisma.tour.findUnique({
        where: { id: existingPurchase.tourId },
        select: { precio: true }
      });

      if (tour && tour.precio) {
        newPrecioTotal = new Decimal(tour.precio.toNumber() * updateData.cantidad);
      }
    }
    
    // Eliminar fechaReservada de updateData si está presente y es undefined, ya que no es parte del modelo Compra.
    // Prisma fallará si se intenta actualizar un campo que no existe.
    const { fechaReservada, ...validUpdateData } = updateData;

    return await prisma.compra.update({
      where: { id: purchaseId },
      data: {
        ...validUpdateData,
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
}; 