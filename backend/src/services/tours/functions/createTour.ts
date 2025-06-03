import { Prisma, Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData, SAMPLE_TOURS } from '../shared.js';

export const createTour = async (data: Prisma.TourCreateInput): Promise<Tour> => {
  const prisma = getPrismaClient();

  if (useSampleTourData || !prisma) {
    console.warn('createTour: Operación no disponible en modo de datos de ejemplo o sin BD.');
    // Simular creación y añadir a SAMPLE_TOURS si es necesario para tests, o lanzar error.
    // Por ahora, lanzamos error ya que SAMPLE_TOURS es estático y no tiene `imagen`.
    tourEventEmitter.emit('tour:error', new Error('Creación no soportada en modo offline'));
    throw new Error('Creación de tour no soportada en modo offline o sin conexión a BD.');
  }

  try {
    const tour = await prisma.tour.create({
      data,
      include: {
        categorias: true, // Asegúrate que Prisma maneja la creación/conexión de categorías
        guias: true,      // Similar para guias, puede requerir GuiaTourCreateNestedManyWithoutTourInput
      },
    });
    tourEventEmitter.emit('tour:created', tour);
    return tour;
  } catch (error) {
    console.error('Error al crear el tour:', error);
    tourEventEmitter.emit('tour:error', error);
    throw error;
  }
}; 