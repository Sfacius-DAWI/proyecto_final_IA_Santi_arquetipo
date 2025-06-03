import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const prisma = new PrismaClient();

/**
 * Script para migrar compras y reservas de usuarios guest a usuarios autenticados
 * con el mismo email
 */
export async function migrateGuestPurchases() {
  try {
    console.log('🔄 Iniciando migración de compras guest...');

    // Buscar todos los usuarios autenticados (con Firebase UID) que tienen email
    const authenticatedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: { startsWith: 'guest_' } } }, // No son usuarios guest
          { email: { not: null } } // Tienen email
        ]
      },
      select: { id: true, email: true, nombre: true }
    });

    console.log(`📧 Encontrados ${authenticatedUsers.length} usuarios autenticados con email`);

    let totalPurchasesMigrated = 0;
    let totalReservationsMigrated = 0;

    for (const authUser of authenticatedUsers) {
      if (!authUser.email) continue;

      // Buscar compras de usuarios guest con el mismo email
      const guestPurchases = await prisma.compra.findMany({
        where: {
          userId: { 
            in: await prisma.user.findMany({
              where: {
                email: authUser.email,
                id: { startsWith: 'guest_' }
              },
              select: { id: true }
            }).then(users => users.map(u => u.id))
          }
        },
        include: {
          user: { select: { id: true, nombre: true } },
          tour: { select: { titulo: true } }
        }
      });

      // Buscar reservas de usuarios guest con el mismo email
      const guestReservations = await prisma.reserva.findMany({
        where: {
          userId: { 
            in: await prisma.user.findMany({
              where: {
                email: authUser.email,
                id: { startsWith: 'guest_' }
              },
              select: { id: true }
            }).then(users => users.map(u => u.id))
          }
        },
        include: {
          user: { select: { id: true, nombre: true } },
          tour: { select: { titulo: true } }
        }
      });

      if (guestPurchases.length > 0 || guestReservations.length > 0) {
        console.log(`\n👤 Usuario: ${authUser.nombre} (${authUser.email})`);
        console.log(`   🛒 Compras guest encontradas: ${guestPurchases.length}`);
        console.log(`   📅 Reservas guest encontradas: ${guestReservations.length}`);

        // Migrar compras
        if (guestPurchases.length > 0) {
          const guestUserIds = await prisma.user.findMany({
            where: {
              email: authUser.email,
              id: { startsWith: 'guest_' }
            },
            select: { id: true }
          }).then(users => users.map(u => u.id));

          const migratedPurchases = await prisma.compra.updateMany({
            where: {
              userId: { in: guestUserIds }
            },
            data: {
              userId: authUser.id
            }
          });
          totalPurchasesMigrated += migratedPurchases.count;
          console.log(`   ✅ Migradas ${migratedPurchases.count} compras`);
        }

        // Migrar reservas
        if (guestReservations.length > 0) {
          const guestUserIds = await prisma.user.findMany({
            where: {
              email: authUser.email,
              id: { startsWith: 'guest_' }
            },
            select: { id: true }
          }).then(users => users.map(u => u.id));

          const migratedReservations = await prisma.reserva.updateMany({
            where: {
              userId: { in: guestUserIds }
            },
            data: {
              userId: authUser.id
            }
          });
          totalReservationsMigrated += migratedReservations.count;
          console.log(`   ✅ Migradas ${migratedReservations.count} reservas`);
        }
      }
    }

    console.log(`\n🎉 Migración completada:`);
    console.log(`   📦 Total compras migradas: ${totalPurchasesMigrated}`);
    console.log(`   📅 Total reservas migradas: ${totalReservationsMigrated}`);

    return {
      success: true,
      purchasesMigrated: totalPurchasesMigrated,
      reservationsMigrated: totalReservationsMigrated
    };

  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente (ESM version)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  migrateGuestPurchases()
    .then(result => {
      console.log('✅ Migración exitosa:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
} 