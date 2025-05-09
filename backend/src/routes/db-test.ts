import { FastifyInstance } from 'fastify';
import { query, pgPool } from '../config/database';

export default async function (fastify: FastifyInstance): Promise<void> {
  // Función auxiliar para verificar la disponibilidad de la BD
  const checkDbConnection = (reply: any) => {
    if (!pgPool) {
      reply.status(503);
      return { message: 'Servicio de base de datos no disponible' };
    }
    return null;
  };

  // Ruta para probar la conexión a PostgreSQL
  fastify.get('/db-test', async (request, reply) => {
    // Verificar si hay conexión a la BD
    const dbError = checkDbConnection(reply);
    if (dbError) return dbError;

    try {
      // Consulta de prueba para verificar la conexión
      const result = await query('SELECT NOW() as time');
      return { 
        message: 'Conexión a PostgreSQL exitosa', 
        time: result.rows[0].time 
      };
    } catch (error) {
      request.log.error('Error en la conexión a PostgreSQL', error);
      reply.status(500);
      return { 
        message: 'Error en la conexión a PostgreSQL', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });

  // Ruta para insertar un ejemplo
  fastify.post('/ejemplos', async (request, reply) => {
    // Verificar si hay conexión a la BD
    const dbError = checkDbConnection(reply);
    if (dbError) return dbError;

    const { nombre, descripcion } = request.body as { nombre: string; descripcion?: string };
    
    if (!nombre) {
      reply.status(400);
      return { message: 'El campo "nombre" es obligatorio' };
    }
    
    try {
      const result = await query(
        'INSERT INTO ejemplos (nombre, descripcion) VALUES ($1, $2) RETURNING *', 
        [nombre, descripcion || null]
      );
      
      reply.status(201);
      return { 
        message: 'Ejemplo creado correctamente', 
        data: result.rows[0] 
      };
    } catch (error) {
      request.log.error('Error al crear ejemplo', error);
      reply.status(500);
      return { 
        message: 'Error al crear ejemplo', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });

  // Ruta para obtener todos los ejemplos
  fastify.get('/ejemplos', async (request, reply) => {
    // Verificar si hay conexión a la BD
    const dbError = checkDbConnection(reply);
    if (dbError) return dbError;

    try {
      const result = await query('SELECT * FROM ejemplos ORDER BY id DESC');
      return { 
        message: 'Ejemplos recuperados correctamente', 
        data: result.rows 
      };
    } catch (error) {
      request.log.error('Error al recuperar ejemplos', error);
      reply.status(500);
      return { 
        message: 'Error al recuperar ejemplos', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
} 