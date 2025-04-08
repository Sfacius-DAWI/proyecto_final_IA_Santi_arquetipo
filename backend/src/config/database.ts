import { Pool } from 'pg';

// Configuración de la base de datos PostgreSQL
export const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'miappdb',
  user: process.env.POSTGRES_USER || 'apiuser',
  password: process.env.POSTGRES_PASSWORD || 'apipass',
  ssl: process.env.POSTGRES_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : undefined
};

// Crear pool de conexiones
export const pgPool = new Pool(pgConfig);

// Función para realizar consultas
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pgPool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Consulta ejecutada en ${duration}ms. Filas: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('Error al ejecutar consulta:', error);
    throw error;
  }
};

// Inicialización de la conexión
export const initDatabase = async () => {
  try {
    // Probar la conexión
    const client = await pgPool.connect();
    console.log('Conexión a PostgreSQL establecida correctamente');
    
    // Crear tabla de ejemplo si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS ejemplos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    return false;
  }
}; 