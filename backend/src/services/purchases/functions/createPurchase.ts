import { PrismaClient, Compra, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createPurchase = async (data: Prisma.CompraCreateInput): Promise<Compra> => {
  try {
    const tourId = data.tour?.connect?.id;
    if (!tourId) {
      throw new Error('Tour ID es requerido');
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { disponible: true, precio: true, titulo: true }
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
      throw new Error(`El precio total (${precioTotal}) no coincide con el cálculo esperado (${precioCalculado})`);
    }

    const compra = await prisma.compra.create({
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

    return compra;
  } catch (error) {
    console.error('Error al crear la compra:', error);
    throw error;
  }
}; 