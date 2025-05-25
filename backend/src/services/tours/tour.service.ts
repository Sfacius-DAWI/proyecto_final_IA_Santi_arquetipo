import { PrismaClient, Tour, Prisma } from '@prisma/client';
import { EventEmitter } from 'events';

export class TourService {
  private prisma: PrismaClient;
  private eventEmitter: EventEmitter;

  constructor() {
    console.log('Inicializando TourService');
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.eventEmitter = new EventEmitter();
  }

  // Suscribirse a eventos
  on(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener);
  }

  // Crear un tour
  async createTour(data: Prisma.TourCreateInput): Promise<Tour> {
    try {
      const tour = await this.prisma.tour.create({
        data,
        include: {
          categorias: true,
          guias: true,
        },
      });
      
      this.eventEmitter.emit('tour:created', tour);
      return tour;
    } catch (error) {
      this.eventEmitter.emit('tour:error', error);
      throw error;
    }
  }

  // Obtener todos los tours
  async getAllTours(filters?: Prisma.TourWhereInput): Promise<Tour[]> {
    try {
      console.log('TourService: Buscando todos los tours');
      const tours = await this.prisma.tour.findMany({
        where: filters,
        include: {
          categorias: true,
          guias: true,
        },
      });
      
      console.log('TourService: Tours encontrados:', tours);
      this.eventEmitter.emit('tours:fetched', tours);
      return tours;
    } catch (error) {
      console.error('TourService: Error al buscar tours:', error);
      this.eventEmitter.emit('tour:error', error);
      throw error;
    }
  }

  // Obtener un tour por ID
  async getTourById(id: string): Promise<Tour | null> {
    try {
      const tour = await this.prisma.tour.findUnique({
        where: { id },
        include: {
          categorias: true,
          guias: true,
        },
      });
      
      if (tour) {
        this.eventEmitter.emit('tour:fetched', tour);
      }
      return tour;
    } catch (error) {
      this.eventEmitter.emit('tour:error', error);
      throw error;
    }
  }

  // Actualizar un tour
  async updateTour(id: string, data: Prisma.TourUpdateInput): Promise<Tour> {
    try {
      const tour = await this.prisma.tour.update({
        where: { id },
        data,
        include: {
          categorias: true,
          guias: true,
        },
      });
      
      this.eventEmitter.emit('tour:updated', tour);
      return tour;
    } catch (error) {
      this.eventEmitter.emit('tour:error', error);
      throw error;
    }
  }

  // Eliminar un tour
  async deleteTour(id: string): Promise<Tour> {
    try {
      const tour = await this.prisma.tour.delete({
        where: { id },
      });
      
      this.eventEmitter.emit('tour:deleted', tour);
      return tour;
    } catch (error) {
      this.eventEmitter.emit('tour:error', error);
      throw error;
    }
  }

  // Método para limpiar recursos
  async cleanup() {
    await this.prisma.$disconnect();
    this.eventEmitter.removeAllListeners();
  }
} 