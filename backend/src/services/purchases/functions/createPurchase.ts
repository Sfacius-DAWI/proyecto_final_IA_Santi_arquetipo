import { PrismaClient, Compra, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createPurchase = async (data: Prisma.CompraCreateInput): Promise<Compra> => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: data.tour?.connect?.id }, // Se añade optional chaining por si no viene tour conectado
      select: { disponible: true, precio: true }
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    if (!tour.disponible) {
      throw new Error('Tour no disponible para compra');
    }

    // Asegurarse que data.cantidad y data.precioTotal son numbers para el cálculo
    const cantidad = Number(data.cantidad);
    const precioTotal = Number(data.precioTotal);

    if (isNaN(cantidad) || isNaN(precioTotal)) {
        throw new Error('Cantidad o PrecioTotal inválidos');
    }

    const precioCalculado = Number(tour.precio) * cantidad;
    if (Math.abs(precioCalculado - precioTotal) > 0.01) {
      throw new Error('El precio total no coincide con el cálculo esperado');
    }

    return await prisma.compra.create({
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
}; 