import { FastifyRequest, FastifyReply } from 'fastify';
import { TourService } from '../../services/tours/index.js';

// Instancia del servicio
const tourService = new TourService();

export const tourControllers = {
  // Crear un tour
  async createTour(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('Creando tour:', request.body);
      const tour = await tourService.createTour(request.body as any);
      console.log('Tour creado:', tour);
      return reply.code(201).send(tour);
    } catch (error) {
      console.error('Error al crear tour:', error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error al crear el tour' });
    }
  },

  // Obtener todos los tours
  async getAllTours(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('Obteniendo todos los tours');
      const tours = await tourService.getAllTours();
      console.log('Tours obtenidos:', tours);
      return reply.send(tours);
    } catch (error) {
      console.error('Error al obtener tours:', error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error al obtener los tours' });
    }
  },

  // Obtener un tour por ID
  async getTourById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const tour = await tourService.getTourById(request.params.id);
      if (!tour) {
        return reply.code(404).send({ error: 'Tour no encontrado' });
      }
      return reply.send(tour);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error al obtener el tour' });
    }
  },

  // Actualizar un tour
  async updateTour(
    request: FastifyRequest<{ 
      Params: { id: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const tour = await tourService.updateTour(request.params.id, request.body as any);
      return reply.send(tour);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error al actualizar el tour' });
    }
  },

  // Eliminar un tour
  async deleteTour(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await tourService.deleteTour(request.params.id);
      return reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error al eliminar el tour' });
    }
  }
}; 