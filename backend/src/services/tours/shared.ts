import { PrismaClient, Tour } from '@prisma/client';
import { EventEmitter } from 'events';

export const tourEventEmitter = new EventEmitter();
let prismaInstance: PrismaClient | null = null;
export let useSampleTourData: boolean = false;

// Datos de ejemplo para cuando no hay conexión a BD
// Adaptar la estructura de SAMPLE_TOURS para que sea compatible con el tipo Tour lo máximo posible.
// Los campos `precio` son Decimal en el schema, pero number aquí para simplicidad de ejemplo.
// Las relaciones como `categorias` y `guias` son simplificadas.
export const SAMPLE_TOURS: Array<Omit<Tour, 'precio' | 'createdAt' | 'updatedAt' | 'duracion'> & 
  { precio: number; createdAt: Date; updatedAt: Date; duracion: number; categorias: any[], guias: any[] }> = [
  {
    id: '1',
    titulo: 'Historic City Walking Tour',
    descripcion: 'Discover the rich cultural heritage of our historic city center. Walk through ancient Roman ruins, medieval quarters, and baroque architecture. Visit the main cathedral, royal palace, and traditional courtyards while learning about the influence of Romans, Muslims, Jews and Christians in our history and culture.',
    precio: 25,
    imagen: 'sample-image-1.jpg',
    duracion: 150,
    disponible: true,
    featured: true,
    etiqueta: 'Cultural Heritage',
    tipoEtiqueta: 'cultural',
    categorias: [],
    guias: [
      { id: '1', nombre: 'David', apellido: 'Thompson' } // Estructura simplificada de Guia
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    titulo: 'Underground Caves & Nature Experience',
    descripcion: 'Explore spectacular underground caves with stunning stalactite and stalagmite formations. Take a boat ride through one of Europe\'s largest underground lakes while enjoying a classical music concert in this unique natural amphitheater.',
    precio: 65,
    imagen: 'sample-image-2.jpg',
    duracion: 240,
    disponible: true,
    featured: true,
    etiqueta: 'Natural Wonder',
    tipoEtiqueta: 'nature',
    categorias: [],
    guias: [
      { id: '2', nombre: 'Helena', apellido: 'Rodriguez' }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    titulo: 'Quad Adventure & Snorkeling Experience',
    descripcion: 'Experience the ultimate adventure combining off-road quad biking through rugged terrain with snorkeling in crystal-clear waters. Drive through scenic mountain paths, hidden valleys, and coastal routes before diving into pristine waters to explore underwater marine life.',
    precio: 95,
    imagen: 'sample-image-3.jpg',
    duracion: 300,
    disponible: true,
    featured: true,
    etiqueta: 'Adventure',
    tipoEtiqueta: 'adventure',
    categorias: [],
    guias: [
      { id: '3', nombre: 'Cristian', apellido: 'Martinez' }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const getPrismaClient = (): PrismaClient | null => {
  if (prismaInstance) return prismaInstance;
  if (useSampleTourData) return null; // Si ya decidimos usar sample data, no intentar conectar.

  try {
    console.log('Shared (Tours): Intentando inicializar PrismaClient...');
    prismaInstance = new PrismaClient({
      // log: ['query', 'info', 'warn', 'error'], // Puede ser muy verboso para producción
    });
    // No hacemos $connect aquí para evitar errores si la BD no está lista al inicio.
    // Las funciones individuales manejarán la conexión o el fallback.
    console.log('Shared (Tours): PrismaClient parece haberse inicializado.');
    return prismaInstance;
  } catch (error) {
    console.warn('Shared (Tours): Falló la inicialización de PrismaClient. Se usarán datos de ejemplo.', error);
    useSampleTourData = true;
    prismaInstance = null;
    return null;
  }
};

// Llama a getPrismaClient una vez al cargar el módulo para intentar la inicialización.
// Esto permite que useSampleTourData se establezca si falla la primera vez.
getPrismaClient();

export const cleanupTours = async () => {
  const prisma = getPrismaClient(); // Usa la instancia existente o nula
  if (prisma && !useSampleTourData) { // Solo desconectar si tenemos una instancia real
    try {
        await prisma.$disconnect();
        console.log('Shared (Tours): PrismaClient desconectado.');
    } catch (disconnectError) {
        console.error('Shared (Tours): Error al desconectar PrismaClient:', disconnectError);
    }
  }
  tourEventEmitter.removeAllListeners();
  console.log('Shared (Tours): Listeners de tourEventEmitter eliminados.');
}; 