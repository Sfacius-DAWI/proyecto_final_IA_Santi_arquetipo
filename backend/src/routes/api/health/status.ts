import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

const HealthStatusEndpointSchema = {
  response: {
    200: Type.Object({
      status: Type.String(),
      timestamp: Type.String()
    }, { required: ['status', 'timestamp'] })
  }
};

export default async function (fastify: FastifyInstance) {
  // Prefijo /api/health aplicado por el cargador dinámico.
  // Esta ruta se registrará como GET /api/health/status (si el archivo se llama status.ts)
  // o GET /api/health/ (si el archivo es index.ts y el cargador se ajusta o la ruta interna es /)
  // Con la lógica actual del cargador que ignora index.ts para carga individual y prefija con el dir,
  // y este archivo definiendo GET '/', se montará en /api/health/
  fastify.get('/', { 
    schema: HealthStatusEndpointSchema 
  }, async (request, reply) => {
    return reply.code(200).send({
      status: 'up',
      timestamp: new Date().toISOString()
    });
  });
} 