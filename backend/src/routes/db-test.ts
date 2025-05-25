import { FastifyInstance } from 'fastify';
import { query, pgPool } from '../config/database.js';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/db-test', async (request, reply) => {
    try {
      // Verificar si el pool de conexiones está disponible
      if (!pgPool) {
        return reply.code(500).send({
          status: 'error',
          message: 'No hay conexión a la base de datos disponible',
          pool: false
        });
      }

      // Intentar obtener una conexión del pool
      const client = await pgPool.connect();
      
      try {
        // Ejecutar una consulta simple para verificar la conexión
        const result = await client.query('SELECT NOW() as current_time');
        
        // Obtener información del servidor
        const serverInfo = await client.query('SELECT version() as version');
        
        return {
          status: 'success',
          message: 'Conexión a la base de datos establecida correctamente',
          pool: true,
          connection: true,
          timestamp: result.rows[0].current_time,
          serverInfo: serverInfo.rows[0].version,
          database: {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || '5432',
            database: process.env.POSTGRES_DB || 'miappdb'
          }
        };
      } catch (queryError: any) {
        console.error('Error al ejecutar consulta:', queryError);
        return reply.code(500).send({
          status: 'error',
          message: 'Error al ejecutar consulta en la base de datos',
          error: queryError.message,
          pool: true,
          connection: false
        });
      } finally {
        // Siempre liberar el cliente al pool
        client.release();
      }
    } catch (error: any) {
      console.error('Error al conectar con la base de datos:', error);
      return reply.code(500).send({
        status: 'error',
        message: 'Error al conectar con la base de datos',
        error: error.message,
        pool: true,
        connection: false
      });
    }
  });
} 