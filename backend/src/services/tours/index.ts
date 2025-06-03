export * from './functions/createTour.js';
export * from './functions/getAllTours.js';
export * from './functions/getFeaturedTours.js';
export * from './functions/getTourById.js';
export * from './functions/updateTour.js';
export * from './functions/deleteTour.js';

export { tourEventEmitter, cleanupTours, useSampleTourData, SAMPLE_TOURS } from './shared.js';

// Exportar tipos de Prisma que puedan ser útiles externamente
export type { Tour, Prisma as PrismaTourTypes } from '@prisma/client'; 