import { Prisma, Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData } from '../shared.js';

export const updateTour = async (id: string, data: Prisma.TourUpdateInput): Promise<Tour> => {
  const prisma = getPrismaClient();

  if (useSampleTourData || !prisma) {
    console.warn('updateTour: Operación no disponible en modo de datos de ejemplo o sin BD.');
    tourEventEmitter.emit('tour:error', new Error('Actualización no soportada en modo offline'));
    throw new Error('Actualización de tour no soportada en modo offline o sin conexión a BD.');
  }

  try {
    const tour = await prisma.tour.update({
      where: { id },
      data,
      include: {
        categorias: true,
        guias: { 
            include: {
                guia: { 
                    include: {
                        user: { 
                            select: { id: true, nombre: true, apellido: true, role: true } 
                        }
                    }
                }
            }
        }
      },
    });
    tourEventEmitter.emit('tour:updated', tour);
    return tour;
  } catch (error) {
    console.error(`updateTour: Error al actualizar tour con ID ${id}:`, error);
    tourEventEmitter.emit('tour:error', error);
    throw error;
  }
}; 