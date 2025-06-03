import { Prisma, Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData, SAMPLE_TOURS } from '../shared.js';

export const getAllTours = async (filters?: Prisma.TourWhereInput): Promise<Tour[]> => {
  const prisma = getPrismaClient();
  console.log('getAllTours: Iniciando búsqueda de tours. Filtros:', filters);
  console.log(`getAllTours: Usando datos de ejemplo: ${useSampleTourData}, Prisma disponible: ${!!prisma}`);

  if (useSampleTourData || !prisma) {
    console.log('getAllTours: Usando datos de ejemplo.');
    let result = SAMPLE_TOURS as unknown as Tour[];
    if (filters) {
        // Ejemplo de filtrado simple para datos de muestra
        if (filters.disponible !== undefined) {
            result = result.filter(tour => tour.disponible === filters.disponible);
        }
        if (filters.featured !== undefined) {
            result = result.filter(tour => tour.featured === filters.featured);
        }
        // Se pueden añadir más lógica de filtrado simple para SAMPLE_TOURS si es necesario
    }
    tourEventEmitter.emit('tours:fetched', result);
    return result;
  }

  try {
    const tours = await prisma.tour.findMany({
      where: filters,
      include: {
        categorias: true, 
        // La relación `guias` en el modelo Tour es `GuiaTour[]`.
        // Para obtener los datos del Guía (que está en User), necesitamos anidar los includes.
        guias: { // GuiaTour
            include: {
                guia: { // Modelo Guia
                    include: {
                        user: { // Modelo User relacionado a Guia
                            select: { id: true, nombre: true, apellido: true, role: true } // Campos deseados de User
                        }
                    }
                }
            }
        }
      },
    });
    console.log('getAllTours: Tours encontrados desde BD:', tours.length);
    tourEventEmitter.emit('tours:fetched', tours);
    return tours;
  } catch (error) {
    console.error('getAllTours: Error al buscar tours en BD, devolviendo datos de ejemplo:', error);
    tourEventEmitter.emit('tour:error', error);
    return SAMPLE_TOURS as unknown as Tour[]; 
  }
}; 