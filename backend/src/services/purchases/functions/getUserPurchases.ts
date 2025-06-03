import { PrismaClient, Compra, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type CompraWithTour = Prisma.CompraGetPayload<{
  include: { tour: { select: { titulo: true; imagen: true; descripcion: true; precio: true } } }
}>;

export const getUserPurchases = async (userId: string): Promise<CompraWithTour[]> => {
  try {
    // Obtener el usuario autenticado para conseguir su email
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    // Buscar IDs de usuarios que deben incluirse en la búsqueda
    const userIds: string[] = [userId]; // Siempre incluir el usuario autenticado

    // Si el usuario tiene email, también buscar usuarios guest con el mismo email
    if (currentUser?.email) {
      const guestUsers = await prisma.user.findMany({
        where: {
          email: currentUser.email,
          id: { startsWith: 'guest_' }
        },
        select: { id: true }
      });

      // Agregar IDs de usuarios guest
      userIds.push(...guestUsers.map(user => user.id));
    }

    return await prisma.compra.findMany({
      where: {
        userId: { in: userIds }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error al obtener las compras del usuario:', error);
    throw error;
  }
}; 