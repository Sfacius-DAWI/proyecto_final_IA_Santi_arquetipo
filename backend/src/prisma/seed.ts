import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  try {
    // Delete existing data in correct order to respect foreign keys
    console.log('Deleting existing purchases...');
    await prisma.compra.deleteMany();
    
    console.log('Deleting existing reservations...');
    await prisma.reserva.deleteMany();
    
    console.log('Deleting existing guide-tour relations...');
    await prisma.guiaTour.deleteMany();
    
    console.log('Deleting existing tours...');
    await prisma.tour.deleteMany();
    
    console.log('Deleting existing categories...');
    await prisma.categoria.deleteMany();
    
    console.log('Deleting existing guides...');
    await prisma.guia.deleteMany();
    
    console.log('Deleting existing users...');
    await prisma.user.deleteMany();
    
    // Create users for guides
    console.log('Creating users...');
    const usuarios = await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-david-123',
          nombre: 'David',
          apellido: 'Thompson',
          role: 'GUIA'
        }
      }),
      prisma.user.create({
        data: {
          id: 'user-helena-456',
          nombre: 'Helena',
          apellido: 'Rodriguez',
          role: 'GUIA'
        }
      }),
      prisma.user.create({
        data: {
          id: 'user-cristian-789',
          nombre: 'Cristian',
          apellido: 'Martinez',
          role: 'GUIA'
        }
      })
    ]);
    
    // Create categories
    console.log('Creating categories...');
    const categorias = await Promise.all([
      prisma.categoria.create({
        data: {
          nombre: 'Cultural',
          descripcion: 'Cultural and historical tours'
        }
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Nature',
          descripcion: 'Nature and wildlife tours'
        }
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Adventure',
          descripcion: 'Adventure and extreme sports tours'
        }
      })
    ]);
    
    // Create guides
    console.log('Creating guides...');
    const guias = await Promise.all([
      prisma.guia.create({
        data: {
          userId: 'user-david-123',
          especialidades: ['History', 'Architecture', 'Cultural Heritage'],
          descripcion: 'Professor of History specializing in cultural tours. David has a PhD in History and over 15 years of experience bringing historical sites to life with fascinating stories and detailed knowledge of ancient civilizations.',
          imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          disponible: true,
          calificacion: 4.9
        }
      }),
      prisma.guia.create({
        data: {
          userId: 'user-helena-456',
          especialidades: ['Biology', 'Ecology', 'Wildlife'],
          descripcion: 'Professional biologist specializing in nature tours. Helena has extensive knowledge of local flora and fauna, with a Master\'s degree in Biology and passion for environmental conservation.',
          imagen: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
          disponible: true,
          calificacion: 4.8
        }
      }),
      prisma.guia.create({
        data: {
          userId: 'user-cristian-789',
          especialidades: ['Adventure Sports', 'Hiking', 'Quad Tours'],
          descripcion: 'Professional hiker and adventure sports expert. Cristian has over 10 years of experience leading adventure tours and is certified in multiple extreme sports activities.',
          imagen: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          disponible: true,
          calificacion: 4.7
        }
      })
    ]);
    
    // Create tours based on Civitatis references
    console.log('Creating tours...');
    const tours = await Promise.all([
      // City Tour based on Palma Free Tour
      prisma.tour.create({
        data: {
          titulo: 'Historic City Walking Tour',
          descripcion: 'Discover the rich cultural heritage of our historic city center. Walk through ancient Roman ruins, medieval quarters, and baroque architecture. Visit the main cathedral, royal palace, and traditional courtyards while learning about the influence of Romans, Muslims, Jews and Christians in our history and culture. This comprehensive tour covers the most monumental side of the city, including the old town\'s hidden gems and the former Jewish quarter.',
          precio: 25,
          imagen: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
          duracion: 150, // 2.5 hours like the Civitatis tour
          disponible: true,
          featured: true,
          etiqueta: 'Cultural Heritage',
          tipoEtiqueta: 'cultural',
          categorias: {
            connect: { id: categorias[0].id }
          }
        }
      }),
      // Nature Tour based on Drach Caves
      prisma.tour.create({
        data: {
          titulo: 'Underground Caves & Nature Experience',
          descripcion: 'Explore spectacular underground caves with stunning stalactite and stalagmite formations. Take a boat ride through one of Europe\'s largest underground lakes while enjoying a classical music concert in this unique natural amphitheater. The tour includes guided walks through pristine natural landscapes and opportunities to observe local wildlife in their natural habitat.',
          precio: 65,
          imagen: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          duracion: 240, // 4 hours half-day tour
          disponible: true,
          featured: true,
          etiqueta: 'Natural Wonder',
          tipoEtiqueta: 'nature',
          categorias: {
            connect: { id: categorias[1].id }
          }
        }
      }),
      // Adventure Tour based on Quad + Snorkel
      prisma.tour.create({
        data: {
          titulo: 'Quad Adventure & Snorkeling Experience',
          descripcion: 'Experience the ultimate adventure combining off-road quad biking through rugged terrain with snorkeling in crystal-clear waters. Drive through scenic mountain paths, hidden valleys, and coastal routes before diving into pristine waters to explore underwater marine life. All equipment provided including safety gear, snorkeling equipment, and professional instruction.',
          precio: 95,
          imagen: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
          duracion: 300, // 5 hours full adventure
          disponible: true,
          featured: true,
          etiqueta: 'Adventure',
          tipoEtiqueta: 'adventure',
          categorias: {
            connect: { id: categorias[2].id }
          }
        }
      })
    ]);

    // Create guide-tour relations (each guide specializes in their tour type)
    console.log('Creating guide-tour relations...');
    await Promise.all([
      // David (History Professor) -> City Tour
      prisma.guiaTour.create({
        data: {
          guiaId: guias[0].id,
          tourId: tours[0].id
        }
      }),
      // Helena (Biologist) -> Nature Tour
      prisma.guiaTour.create({
        data: {
          guiaId: guias[1].id,
          tourId: tours[1].id
        }
      }),
      // Cristian (Professional Hiker) -> Adventure Tour
      prisma.guiaTour.create({
        data: {
          guiaId: guias[2].id,
          tourId: tours[2].id
        }
      })
    ]);

    console.log('✅ Database seeded successfully');
    console.log(`✅ Created ${usuarios.length} users`);
    console.log(`✅ Created ${categorias.length} categories`);
    console.log(`✅ Created ${guias.length} guides`);
    console.log(`✅ Created ${tours.length} tours`);
    console.log('✅ Created guide-tour relations');
    
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 