import { Pool } from 'pg';

// Variable para determinar si la conexión a la BD es requerida
const isDbConnectionRequired = process.env.DB_CONNECTION_REQUIRED === 'true';

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
export let pgPool: Pool | null = null;

try {
  pgPool = new Pool(pgConfig);
  console.log('Pool de conexión a PostgreSQL creado');
} catch (error) {
  console.error('Error al crear el pool de conexión a PostgreSQL:', error);
  if (isDbConnectionRequired) {
    throw error;
  } else {
    console.warn('Continuando sin conexión a base de datos ya que no es requerida');
  }
}

// Función para realizar consultas
export const query = async (text: string, params?: any[]) => {
  if (!pgPool) {
    console.warn('No hay conexión a la base de datos disponible');
    return { rows: [], rowCount: 0 };
  }

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
  if (!pgPool) {
    console.warn('No hay pool de conexión a la base de datos disponible');
    return !isDbConnectionRequired; // Retorna true si la conexión no es requerida
  }

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
    // Si la conexión es requerida, retorna false; de lo contrario, true
    return !isDbConnectionRequired;
  }
}; 