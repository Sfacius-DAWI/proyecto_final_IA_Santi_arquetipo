import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { version } from '../../package.json';

const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Endpoint de health check básico
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: version,
      service: 'backend-api',
      environment: process.env.NODE_ENV
    };
  });

  // Endpoint de health check detallado para monitoreo interno
  fastify.get('/health/details', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            service: { type: 'string' },
            environment: { type: 'string' },
            memory: { 
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async () => {
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: version,
      service: 'backend-api',
      environment: process.env.NODE_ENV,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      }
    };
  });
};

export default healthRoutes; 