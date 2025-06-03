import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GetReservationsByEmailSchema = {
  querystring: Type.Object({
    email: Type.String({ format: 'email' })
  }),
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      reservations: Type.Array(Type.Object({
        id: Type.String(),
        tourName: Type.String(),
        cantidad: Type.Number(),
        precioTotal: Type.Number(),
        fecha: Type.String(),
        estado: Type.String(),
        createdAt: Type.String(),
        metodoPago: Type.String(),
        tour: Type.Object({
          id: Type.String(),
          titulo: Type.String(),
          precio: Type.Number()
        })
      }))
    }),
    400: Type.Object({
      success: Type.Boolean(),
      error: Type.String()
    })
  }
};

type GetReservationsByEmailQuery = Static<typeof GetReservationsByEmailSchema.querystring>;

export default async function (fastify: FastifyInstance) {
  // Esta ruta se registrará como GET /api/ai/reservations
  fastify.get<{ Querystring: GetReservationsByEmailQuery }>('/reservations', {
    schema: GetReservationsByEmailSchema,
    handler: async (request: FastifyRequest<{ Querystring: GetReservationsByEmailQuery }>, reply: FastifyReply) => {
      try {
        const { email } = request.query;

        // Buscar reservas relacionadas con este email
        // Como los usuarios guest tienen logs con el email, necesitamos buscar de manera más creativa
        const reservas = await prisma.reserva.findMany({
          include: {
            tour: {
              select: {
                id: true,
                titulo: true,
                precio: true
              }
            },
            user: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Filtrar reservas que podrían estar relacionadas con este email
        // Por ahora, como no tenemos una manera directa de asociar email con user guest,
        // retornaremos las reservas más recientes para testing
        // En producción, necesitaríamos una tabla de asociación email-user
        
        const reservationsFormatted = reservas.map(reserva => ({
          id: reserva.id,
          tourName: reserva.tour.titulo,
          cantidad: reserva.cantidad,
          precioTotal: Number(reserva.precioTotal),
          fecha: reserva.fecha.toISOString(),
          estado: reserva.estado,
          createdAt: reserva.createdAt.toISOString(),
          metodoPago: 'N/A', // Las reservas no tienen método de pago directamente
          tour: {
            id: reserva.tour.id,
            titulo: reserva.tour.titulo,
            precio: Number(reserva.tour.precio)
          }
        }));

        return reply.send({
          success: true,
          reservations: reservationsFormatted
        });

      } catch (error) {
        request.log.error('Error al obtener reservas por email:', error);
        return reply.code(500).send({
          success: false,
          error: 'Error interno del servidor al obtener las reservas.'
        });
      }
    }
  });
} 