import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingGuestEmails() {
  try {
    console.log('🔧 Corrigiendo emails de usuarios guest existentes...\n');

    // Buscar usuarios guest sin email
    const guestUsersWithoutEmail = await prisma.user.findMany({
      where: {
        AND: [
          { id: { startsWith: 'guest_' } },
          { email: null }
        ]
      },
      include: {
        compras: { select: { id: true } },
        reservas: { select: { id: true } }
      }
    });

    console.log(`👥 Usuarios guest sin email encontrados: ${guestUsersWithoutEmail.length}`);

    for (let i = 0; i < guestUsersWithoutEmail.length; i++) {
      const user = guestUsersWithoutEmail[i];
      // Generar un email de prueba basado en el nombre y timestamp
      const testEmail = `test.${user.nombre.toLowerCase()}.${Date.now()}@example.com`;
      
      console.log(`📧 Actualizando usuario ${user.nombre} (${user.id})`);
      console.log(`   Email nuevo: ${testEmail}`);
      console.log(`   Compras: ${user.compras.length}, Reservas: ${user.reservas.length}`);

      await prisma.user.update({
        where: { id: user.id },
        data: { email: testEmail }
      });

      console.log(`   ✅ Actualizado\n`);
    }

    console.log(`🎉 Actualización completada. ${guestUsersWithoutEmail.length} usuarios guest actualizados.`);

  } catch (error) {
    console.error('💥 Error al corregir emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la corrección
fixExistingGuestEmails(); 