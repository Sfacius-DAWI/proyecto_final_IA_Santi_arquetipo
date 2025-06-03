import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { PrismaClient, Prisma } from '@prisma/client';

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
    })
  }
};

type CreateBookingBody = Static<typeof CreateBookingSchema.body>;

export default async function (fastify: FastifyInstance) {
  // Esta ruta se registrará como POST /api/ai/booking
  fastify.post<{ Body: CreateBookingBody }>('/booking', {
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

        // 2. Verificar o crear usuario
        let user = await prisma.user.findFirst({
          where: { 
            OR: [
              { id: userEmail }, // Si usa email como ID
              { email: userEmail } // Buscar por email también
            ]
          }
        });

        if (!user) {
          // Crear usuario nuevo para la reserva
          // Generar un ID único que no conflicte con Firebase UIDs
          const userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const [nombre, ...apellidoParts] = userName.split(' ');
          const apellido = apellidoParts.join(' ') || 'Sin Apellido';
          
          user = await prisma.user.create({
            data: {
              id: userId, // Usar un ID único generado
              nombre: nombre,
              apellido: apellido,
              email: userEmail, // IMPORTANTE: Guardar el email para vincular después
              role: 'USUARIO'
            }
          });

          // Crear un registro auxiliar para asociar email con el usuario guest
          // Podríamos agregar una tabla intermedia o usar un campo de metadata
          request.log.info('Usuario guest creado:', {
            userId: user.id,
            email: userEmail,
            nombre: userName
          });
        }

        // 3. Calcular precio total
        const precioTotal = tour.precio.mul(numberOfPeople);

        // 4. Crear la reserva en la base de datos
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

        // 5. Crear una compra relacionada
        const compra = await prisma.compra.create({
          data: {
            userId: user.id,
            tourId: tour.id,
            cantidad: numberOfPeople,
            precioTotal: precioTotal,
            metodoPago: paymentMethod,
            estado: 'PENDIENTE'
          }
        });

        // Log para desarrollo
        request.log.info('Nueva reserva guardada en BD:', {
          reservaId: reserva.id,
          compraId: compra.id,
          tourName: tour.titulo,
          userName,
          userEmail,
          numberOfPeople,
          preferredDate,
          precioTotal: precioTotal.toString()
        });

        return reply.send({
          success: true,
          message: `¡Reserva confirmada! Tu ${tourName} para ${numberOfPeople} ${numberOfPeople === 1 ? 'persona' : 'personas'} el ${preferredDate}. Total: €${precioTotal}. Te enviaremos un correo de confirmación.`,
          bookingId: `BOOKING-${reserva.id}`,
          reservaId: reserva.id
        });

      } catch (error) {
        request.log.error('Error al crear reserva:', error);
        
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