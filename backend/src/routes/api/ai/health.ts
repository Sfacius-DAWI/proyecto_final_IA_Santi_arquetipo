import { FastifyPluginAsync, FastifyInstance } from 'fastify';
// Importar el schema completo del endpoint
import { AIHealthEndpointSchema } from './schemas/ai.schema.js';

/**
 * Plugin de Fastify para las rutas de salud del servicio de IA.
 * @param {FastifyInstance} fastify - Instancia de Fastify.
 */
export default async function (fastify: FastifyInstance) {
  // Prefijo /api/ai aplicado por el cargador dinámico
  // Esta ruta se registrará como GET /api/ai/health
  /**
   * @route GET /api/ai/health
   * @description Endpoint para verificar el estado del servicio de IA.
   * @returns {object} 200 - Estado del servicio.
   * @example
   * // Respuesta exitosa:
   * // {
   * //   "status": "healthy",
   * //   "service": "AI Assistant Service",
   * //   "timestamp": "2023-10-27T10:00:00.000Z"
   * // }
   */
  fastify.get('/health', { 
    schema: AIHealthEndpointSchema, // Usar el schema completo del endpoint
    handler: async (request, reply) => {
      const healthInfo = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || '3003',
        version: '1.0.0',
        services: {
          api: 'running',
          ai: 'available'
        },
        cors: {
          allowedOrigins: process.env.NODE_ENV === 'development' 
            ? ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:3000']
            : process.env.CORS_ORIGIN,
        },
        request: {
          ip: request.ip,
          headers: request.headers,
          method: request.method,
          url: request.url
        }
      };
      
      console.log('🏥 Health check solicitado desde:', request.ip);
      
      return reply.code(200).send(healthInfo);
    }
  });
} 