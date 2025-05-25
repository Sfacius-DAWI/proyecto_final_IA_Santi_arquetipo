import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Primero, eliminar todos los tours existentes
  await prisma.tour.deleteMany();
  
  // Crear tours de ejemplo
  const tours = [
    {
      titulo: 'Tour por la Ciudad',
      descripcion: 'Un recorrido fascinante por los lugares más emblemáticos de la ciudad.',
      precio: 99.99,
      imagen: 'https://example.com/city-tour.jpg',
      duracion: 180, // 3 horas
      disponible: true,
      etiqueta: 'Popular',
      tipoEtiqueta: 'popular'
    },
    {
      titulo: 'Aventura en la Naturaleza',
      descripcion: 'Explora los senderos más hermosos y disfruta de la naturaleza.',
      precio: 149.99,
      imagen: 'https://example.com/nature-tour.jpg',
      duracion: 360, // 6 horas
      disponible: true,
      etiqueta: 'Nuevo',
      tipoEtiqueta: 'new'
    }
  ];

  console.log('Creando tours...');
  for (const tour of tours) {
    await prisma.tour.create({
      data: tour
    });
  }

  console.log('Base de datos sembrada con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 