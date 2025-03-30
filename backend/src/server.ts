import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index';

const server: FastifyInstance = Fastify({
  logger: true
});

async function start() {
  try {
    // Registrar CORS
    await server.register(cors, { 
      origin: true
    });

    // Registrar rutas
    routes(server);

    // Iniciar servidor
    await server.listen({ port: 3000, host: '0.0.0.0' });
    
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start(); 