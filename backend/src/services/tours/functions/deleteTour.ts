import { Tour } from '@prisma/client';
import { getPrismaClient, tourEventEmitter, useSampleTourData } from '../shared.js';

export const deleteTour = async (id: string): Promise<Tour> => {
  const prisma = getPrismaClient();

  if (useSampleTourData || !prisma) {
    console.warn('deleteTour: Operación no disponible en modo de datos de ejemplo o sin BD.');
    tourEventEmitter.emit('tour:error', new Error('Eliminación no soportada en modo offline'));
    throw new Error('Eliminación de tour no soportada en modo offline o sin conexión a BD.');
  }

  try {
    // Primero, eliminar relaciones en GuiaTour para evitar errores de restricción de clave externa
    await prisma.guiaTour.deleteMany({
      where: { tourId: id },
    });

    // Luego, puedes desvincular categorías si es una relación muchos a muchos pura (sin tabla de unión explícita con datos extra)
    // o si la tabla de unión se maneja automáticamente por Prisma al eliminar el Tour.
    // Si tienes una tabla de unión explícita como CategoriaTour, necesitarías eliminar esas relaciones primero.
    // Asumiendo que la relación con Categoria se maneja o no es estrictamente bloqueante para la eliminación del Tour.

    const tour = await prisma.tour.delete({
      where: { id },
      // No se necesita include aquí ya que el registro será eliminado.
    });
    tourEventEmitter.emit('tour:deleted', tour);
    return tour;
  } catch (error) {
    console.error(`deleteTour: Error al eliminar tour con ID ${id}:`, error);
    tourEventEmitter.emit('tour:error', error);
    throw error;
  }
}; 