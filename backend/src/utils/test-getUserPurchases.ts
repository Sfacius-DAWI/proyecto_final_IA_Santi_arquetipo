import { PrismaClient } from '@prisma/client';
import { getUserPurchases } from '../services/purchases/functions/getUserPurchases.js';

const prisma = new PrismaClient();

async function testGetUserPurchases() {
  try {
    console.log('🧪 Probando función getUserPurchases...\n');

    // Buscar un usuario autenticado para probar
    const authUser = await prisma.user.findFirst({
      where: { 
        id: { not: { startsWith: 'guest_' } }
      },
      select: { id: true, nombre: true, email: true }
    });

    if (!authUser) {
      console.log('❌ No se encontró ningún usuario autenticado para probar');
      return;
    }

    console.log(`👤 Probando con usuario: ${authUser.nombre} (${authUser.id})`);
    console.log(`📧 Email: ${authUser.email}`);

    // Probar la función
    const purchases = await getUserPurchases(authUser.id);
    
    console.log(`\n✅ Función ejecutada exitosamente`);
    console.log(`🛒 Compras encontradas: ${purchases.length}`);
    
    purchases.forEach((compra, index) => {
      console.log(`   ${index + 1}. ${compra.tour.titulo} - €${compra.precioTotal} (${compra.estado})`);
      console.log(`      Usuario ID: ${compra.userId}`);
      console.log(`      Fecha: ${compra.createdAt}`);
    });

  } catch (error) {
    console.error('💥 Error al probar getUserPurchases:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testGetUserPurchases(); 