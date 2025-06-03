import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../config/firebase.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Verificar si el usuario existe en la base de datos, si no, crearlo
    let user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    });

    if (!user) {
      // Crear el usuario en la base de datos
      user = await prisma.user.create({
        data: {
          id: decodedToken.uid,
          nombre: decodedToken.name?.split(' ')[0] || 'Usuario',
          apellido: decodedToken.name?.split(' ').slice(1).join(' ') || '',
          email: decodedToken.email, // Guardar el email del usuario autenticado
          role: 'USUARIO'
        }
      });
      console.log(`Usuario creado en la base de datos: ${user.id}`);

      // Vincular compras guest existentes con el mismo email
      if (decodedToken.email) {
        try {
          // Buscar usuarios guest con el mismo email
          const guestUsers = await prisma.user.findMany({
            where: {
              email: decodedToken.email,
              id: { startsWith: 'guest_' }
            },
            select: { id: true }
          });

          if (guestUsers.length > 0) {
            const guestUserIds = guestUsers.map(u => u.id);

            const guestPurchasesLinked = await prisma.compra.updateMany({
              where: {
                userId: { in: guestUserIds }
              },
              data: {
                userId: user.id // Transferir compras al usuario autenticado
              }
            });

            const guestReservationsLinked = await prisma.reserva.updateMany({
              where: {
                userId: { in: guestUserIds }
              },
              data: {
                userId: user.id // Transferir reservas al usuario autenticado
              }
            });

            if (guestPurchasesLinked.count > 0 || guestReservationsLinked.count > 0) {
              console.log(`Vinculadas ${guestPurchasesLinked.count} compras y ${guestReservationsLinked.count} reservas guest al usuario autenticado: ${user.id}`);
            }
          }
        } catch (linkError) {
          console.error('Error al vincular compras guest:', linkError);
          // No fallar la autenticación por este error
        }
      }
    } else {
      // Si el usuario ya existe, pero no tiene email guardado, actualizarlo
      if (!user.email && decodedToken.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: decodedToken.email }
        });
      }
    }
    
    request.user = {
      id: decodedToken.uid
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    return reply.code(401).send({ error: 'Token inválido' });
  }
} 