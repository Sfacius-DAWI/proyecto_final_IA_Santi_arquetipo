import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPurchaseLinking() {
  try {
    console.log('🧪 Iniciando prueba de vinculación de compras...\n');

    // 1. Verificar usuarios guest existentes
    const guestUsers = await prisma.user.findMany({
      where: { id: { startsWith: 'guest_' } },
      include: {
        compras: {
          include: {
            tour: { select: { titulo: true, precio: true } }
          }
        },
        reservas: {
          include: {
            tour: { select: { titulo: true, precio: true } }
          }
        }
      }
    });

    console.log(`👥 Usuarios guest encontrados: ${guestUsers.length}`);
    
    guestUsers.forEach(user => {
      console.log(`\n📧 Guest: ${user.nombre} ${user.apellido} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   🛒 Compras: ${user.compras.length}`);
      console.log(`   📅 Reservas: ${user.reservas.length}`);
      
      if (user.compras.length > 0) {
        user.compras.forEach(compra => {
          console.log(`     • ${compra.tour.titulo} - €${compra.precioTotal} (${compra.estado})`);
        });
      }
    });

    // 2. Verificar usuarios autenticados
    const authUsers = await prisma.user.findMany({
      where: { 
        AND: [
          { id: { not: { startsWith: 'guest_' } } },
          { email: { not: null } }
        ]
      },
      include: {
        compras: {
          include: {
            tour: { select: { titulo: true, precio: true } }
          }
        }
      }
    });

    console.log(`\n🔐 Usuarios autenticados con email: ${authUsers.length}`);
    
    authUsers.forEach(user => {
      console.log(`\n👤 Auth: ${user.nombre} ${user.apellido} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   🛒 Compras: ${user.compras.length}`);
      
      if (user.compras.length > 0) {
        user.compras.forEach(compra => {
          console.log(`     • ${compra.tour.titulo} - €${compra.precioTotal} (${compra.estado})`);
        });
      }
    });

    // 3. Buscar emails duplicados
    const emailGroups: { [email: string]: any[] } = {};
    
    [...guestUsers, ...authUsers].forEach(user => {
      if (user.email) {
        if (!emailGroups[user.email]) {
          emailGroups[user.email] = [];
        }
        emailGroups[user.email].push({
          id: user.id,
          nombre: user.nombre,
          tipo: user.id.startsWith('guest_') ? 'guest' : 'auth',
          compras: user.compras.length
        });
      }
    });

    console.log('\n📧 Análisis por email:');
    Object.entries(emailGroups).forEach(([email, users]) => {
      if (users.length > 1) {
        console.log(`\n⚠️  Email duplicado: ${email}`);
        users.forEach(user => {
          console.log(`   ${user.tipo}: ${user.nombre} (${user.id}) - ${user.compras} compras`);
        });
      } else {
        console.log(`✅ ${email}: 1 usuario (${users[0].tipo})`);
      }
    });

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testPurchaseLinking(); 