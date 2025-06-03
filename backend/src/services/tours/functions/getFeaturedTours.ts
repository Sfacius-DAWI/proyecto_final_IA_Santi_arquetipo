import { Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData, SAMPLE_TOURS } from '../shared.js';

export const getFeaturedTours = async (limit: number = 4): Promise<Tour[]> => {
  const prisma = getPrismaClient();
  console.log(`getFeaturedTours: Buscando ${limit} tours destacados.`);

  if (useSampleTourData || !prisma) {
    console.log('getFeaturedTours: Usando datos de ejemplo.');
    const featuredSampleTours = SAMPLE_TOURS.filter(tour => tour.featured).slice(0, limit);
    tourEventEmitter.emit('featured-tours:fetched', featuredSampleTours);
    return featuredSampleTours as unknown as Tour[];
  }

  try {
    const tours = await prisma.tour.findMany({
      where: {
        featured: true,
        disponible: true,
      },
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
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('getFeaturedTours: Tours destacados encontrados desde BD:', tours.length);
    tourEventEmitter.emit('featured-tours:fetched', tours);
    return tours;
  } catch (error) {
    console.error('getFeaturedTours: Error al buscar tours destacados, devolviendo datos de ejemplo:', error);
    tourEventEmitter.emit('tour:error', error);
    const featuredSampleTours = SAMPLE_TOURS.filter(tour => tour.featured).slice(0, limit);
    return featuredSampleTours as unknown as Tour[]; 
  }
}; 