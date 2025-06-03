const { Client } = require('pg');

async function fixMetodoPago() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'miappdb',
    user: 'apiuser',
    password: 'apipass',
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Ver valores actuales
    const result = await client.query('SELECT id, "metodoPago" FROM "Compra" WHERE "metodoPago" NOT IN (\'TARJETA\', \'PAYPAL\', \'TRANSFERENCIA\')');
    console.log('Registros con metodoPago inconsistente:', result.rows);

    // Actualizar valores problemáticos
    const updateQueries = [
      "UPDATE \"Compra\" SET \"metodoPago\" = 'TARJETA' WHERE \"metodoPago\" IN ('credit_card', 'debit_card', 'tarjeta', 'credit-card')",
      "UPDATE \"Compra\" SET \"metodoPago\" = 'PAYPAL' WHERE \"metodoPago\" = 'paypal'",
      "UPDATE \"Compra\" SET \"metodoPago\" = 'TRANSFERENCIA' WHERE \"metodoPago\" IN ('bank_transfer', 'transferencia', 'transfer')",
      // Cualquier otro valor se convierte en TARJETA por defecto
      "UPDATE \"Compra\" SET \"metodoPago\" = 'TARJETA' WHERE \"metodoPago\" NOT IN ('TARJETA', 'PAYPAL', 'TRANSFERENCIA')"
    ];

    for (const query of updateQueries) {
      const result = await client.query(query);
      console.log(`Actualizada query: ${query} - Filas afectadas: ${result.rowCount}`);
    }

    // Verificar que todo está limpio
    const finalCheck = await client.query('SELECT DISTINCT "metodoPago" FROM "Compra"');
    console.log('Valores finales de metodoPago:', finalCheck.rows);

    console.log('✅ Datos de metodoPago limpiados exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixMetodoPago(); 