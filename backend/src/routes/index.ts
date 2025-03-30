import { FastifyInstance } from 'fastify';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Registra automáticamente todas las rutas en la carpeta routes
 * @param fastify - Instancia de Fastify
 */
export async function routes(fastify: FastifyInstance): Promise<void> {
  const routesPath = __dirname;
  
  // Obtener todos los archivos en el directorio actual
  const files = readdirSync(routesPath);
  
  for (const file of files) {
    // Ignorar el archivo index.ts actual y archivos que no son .ts
    if (file === 'index.ts' || file === 'index.js' || !file.endsWith('.ts')) continue;
    
    try {
      // Importar dinámicamente el archivo de ruta
      const route = await import(join(routesPath, file));
      
      // Si el archivo exporta una función de rutas, registrarla
      if (typeof route.default === 'function') {
        await fastify.register(route.default);
      } else if (typeof route.routes === 'function') {
        route.routes(fastify);
      }
    } catch (err) {
      fastify.log.error(`Error al cargar la ruta ${file}: ${err}`);
    }
  }
  
  // Ruta de prueba base
  fastify.get('/', async () => {
    return { message: 'API funcionando correctamente' };
  });
} 