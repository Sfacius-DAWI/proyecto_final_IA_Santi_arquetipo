import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyAuth } from '../../../middleware/auth.js';

const prisma = new PrismaClient();

const CreateBookingSchema = {
  body: Type.Object({
    tourName: Type.String(),
    userEmail: Type.String({ format: 'email' }),
    userName: Type.String(),
    phoneNumber: Type.String(),
    numberOfPeople: Type.Number({ minimum: 1, maximum: 10 }),
    preferredDate: Type.String(),
    paymentMethod: Type.String(),
    specialRequests: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      message: Type.String(),
      bookingId: Type.Optional(Type.String()),
      reservaId: Type.Optional(Type.String())
    }),
    400: Type.Object({
      success: Type.Boolean(),
      error: Type.String()
    }),
    401: Type.Object({
      success: Type.Boolean(),
      error: Type.String()
    })
  }
};

type CreateBookingBody = Static<typeof CreateBookingSchema.body>;

export default async function (fastify: FastifyInstance) {
  // Esta ruta se registrará como POST /api/ai/booking
  fastify.post<{ Body: CreateBookingBody }>('/booking', {
    onRequest: [verifyAuth], // Requerir autenticación
    schema: CreateBookingSchema,
    handler: async (request: FastifyRequest<{ Body: CreateBookingBody }>, reply: FastifyReply) => {
      try {
        const {
          tourName,
          userEmail,
          userName,
          phoneNumber,
          numberOfPeople,
          preferredDate,
          paymentMethod,
          specialRequests
        } = request.body;

        // Obtener el usuario autenticado del middleware
        const authenticatedUserId = request.user?.id;
        if (!authenticatedUserId) {
          return reply.code(401).send({
            success: false,
            error: 'Usuario no autenticado. Debes iniciar sesión para hacer una reserva.'
          });
        }

        request.log.info('Usuario autenticado haciendo reserva:', {
          userId: authenticatedUserId,
          email: userEmail,
          tourName
        });

        // 1. Buscar el tour por nombre
        const tour = await prisma.tour.findFirst({
          where: { 
            titulo: tourName,
            disponible: true 
          }
        });

        if (!tour) {
          return reply.code(400).send({
            success: false,
            error: `El tour "${tourName}" no está disponible.`
          });
        }

        // 2. Verificar que el usuario existe o crearlo si es necesario
        let user = await prisma.user.findUnique({
          where: { id: authenticatedUserId }
        });

        if (!user) {
          // Crear el usuario con el Firebase UID
          const [nombre, ...apellidoParts] = userName.split(' ');
          const apellido = apellidoParts.join(' ') || 'Sin Apellido';
          
          user = await prisma.user.create({
            data: {
              id: authenticatedUserId, // Usar Firebase UID
              nombre: nombre,
              apellido: apellido,
              email: userEmail,
              role: 'USUARIO'
            }
          });

          request.log.info('Usuario creado desde Firebase:', {
            userId: user.id,
            email: userEmail,
            nombre: userName
          });
        } else {
          // Actualizar email si es diferente
          if (user.email !== userEmail) {
            user = await prisma.user.update({
              where: { id: authenticatedUserId },
              data: { email: userEmail }
            });
          }
        }

        // 3. Calcular precio total
        const precioTotal = tour.precio.mul(numberOfPeople);

        // 4. Mapear método de pago al formato esperado por el schema
        const metodoPagoMap: Record<string, string> = {
          'credit_card': 'TARJETA',
          'debit_card': 'TARJETA',
          'tarjeta': 'TARJETA',
          'credit-card': 'TARJETA',
          'paypal': 'PAYPAL',
          'bank_transfer': 'TRANSFERENCIA',
          'transferencia': 'TRANSFERENCIA',
          'transfer': 'TRANSFERENCIA'
        };
        
        const metodoPagoMapeado = metodoPagoMap[paymentMethod.toLowerCase()] || 'TARJETA';

        // 5. Crear la reserva en la base de datos
        const reserva = await prisma.reserva.create({
          data: {
            userId: user.id,
            tourId: tour.id,
            fecha: new Date(preferredDate),
            cantidad: numberOfPeople,
            precioTotal: precioTotal,
            estado: 'PENDIENTE'
          }
        });

        // 6. Crear una compra relacionada
        const compra = await prisma.compra.create({
          data: {
            userId: user.id,
            tourId: tour.id,
            cantidad: numberOfPeople,
            precioTotal: precioTotal,
            metodoPago: metodoPagoMapeado,
            estado: 'PENDIENTE'
          }
        });

        // Log para desarrollo
        request.log.info('Nueva reserva autenticada guardada en BD:', {
          reservaId: reserva.id,
          compraId: compra.id,
          userId: user.id,
          tourName: tour.titulo,
          userName,
          userEmail,
          numberOfPeople,
          preferredDate,
          precioTotal: precioTotal.toString(),
          metodoPago: metodoPagoMapeado
        });

        return reply.send({
          success: true,
          message: `¡Reserva confirmada! Tu ${tourName} para ${numberOfPeople} ${numberOfPeople === 1 ? 'persona' : 'personas'} el ${preferredDate}. Total: €${precioTotal}. Te enviaremos un correo de confirmación.`,
          bookingId: `BOOKING-${reserva.id}`,
          reservaId: reserva.id
        });

      } catch (error) {
        request.log.error('Error al crear reserva autenticada:', error);
        
        // Manejo específico de errores de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            return reply.code(400).send({
              success: false,
              error: 'Ya existe una reserva con estos datos.'
            });
          }
        }

        return reply.code(500).send({
          success: false,
          error: 'Error interno del servidor al procesar la reserva.'
        });
      }
    }
  });
} 