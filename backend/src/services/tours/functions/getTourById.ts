import { Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData, SAMPLE_TOURS } from '../shared.js';

export const getTourById = async (id: string): Promise<Tour | null> => {
  const prisma = getPrismaClient();

  if (useSampleTourData || !prisma) {
    console.log(`getTourById: Buscando tour con ID ${id} en datos de ejemplo.`);
    const tour = SAMPLE_TOURS.find(t => t.id === id) as unknown as Tour | undefined;
    if (tour) {
      tourEventEmitter.emit('tour:fetched', tour);
      return tour;
    } else {
      tourEventEmitter.emit('tour:not-found', { id });
      return null;
    }
  }

  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
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
    
    if (tour) {
      tourEventEmitter.emit('tour:fetched', tour);
    } else {
      tourEventEmitter.emit('tour:not-found', { id });
    }
    return tour;
  } catch (error) {
    console.error(`getTourById: Error al buscar tour con ID ${id}:`, error);
    tourEventEmitter.emit('tour:error', error);
    throw error; // Opcional: podrías retornar null o un sample si existe y tiene sentido
  }
}; 