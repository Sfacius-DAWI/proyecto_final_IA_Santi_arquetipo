import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const scriptFilename = path.basename(fileURLToPath(import.meta.url));

const discoverRouteFiles = (
  dirPath: string, 
  baseApiDir: string, 
  discoveredFiles: { filePath: string, prefix: string }[] = []
): { filePath: string, prefix: string }[] => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const dirent of entries) {
    const fullPath = path.join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      // Continuar buscando en subdirectorios (excluyendo 'schemas')
      if (dirent.name !== 'schemas') {
        discoverRouteFiles(fullPath, baseApiDir, discoveredFiles);
      }
    } else if (
      (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')) &&
      dirent.name !== scriptFilename && // No incluirse a sí mismo (el index.ts principal)
      dirent.name !== 'index.ts' && // No incluir otros archivos index.ts de subcarpetas de rutas
      dirent.name !== 'index.js' &&
      !dirent.name.startsWith('.') &&
      !dirent.name.includes('.schema.') // Excluir archivos de schema
    ) {
      // El prefijo se basa en la ruta del directorio relativa a 'baseApiDir'
      const relativeDirPath = path.relative(baseApiDir, path.dirname(fullPath));
      const prefix = path.join('/api', relativeDirPath).replace(/\\/g, '/').replace(/\/$/, ''); // Normalizar y quitar trailing slash
      
      discoveredFiles.push({ filePath: fullPath, prefix: prefix === '/api' ? '/api' : prefix });
    }
  }
  return discoveredFiles;
};

export async function routes(
  fastify: FastifyInstance<any, any, any, any, any>
): Promise<void> {
  fastify.log.info('Iniciando registro de rutas dinámicas individuales...');

  fastify.get('/', async () => {
    return { message: 'API funcionando correctamente. Bienvenido al arquetipo.' };
  });

  const apiDir = path.join(currentDir, 'api');
  if (!fs.existsSync(apiDir)) {
    fastify.log.warn(`Directorio de API no encontrado: ${apiDir}. No se cargarán rutas de API.`);
    // Configurar notFoundHandler incluso si no hay rutas de API
    fastify.setNotFoundHandler((request, reply) => {
      reply.code(404).send({ errorCode: '404', errorDescription: 'Ruta no encontrada' });
    });
    return;
  }

  const routeFilesToRegister = discoverRouteFiles(apiDir, apiDir);
  fastify.log.info(`Archivos de ruta individuales encontrados para carga: ${JSON.stringify(routeFilesToRegister, null, 2)}`);

  try {
    for (const routeInfo of routeFilesToRegister) {
      const moduleUrl = pathToFileURL(routeInfo.filePath).href;
      const routeModule = await import(moduleUrl);

      if (routeModule.default && typeof routeModule.default === 'function') {
        fastify.log.info(`Registrando ${path.relative(currentDir, routeInfo.filePath)} con prefijo: ${routeInfo.prefix}`);
        // Cada archivo (ej. post-tours.ts) ahora es un plugin que define rutas relativas a este prefijo.
        await fastify.register(routeModule.default, { prefix: routeInfo.prefix });
      } else {
        fastify.log.warn(`Módulo en ${routeInfo.filePath} no exporta una función por defecto.`);
      }
    }
  } catch (error) {
    fastify.log.error('Error crítico durante la carga dinámica de rutas individuales:', error);
    process.exit(1); 
  }
  
  // Usar setNotFoundHandler en lugar de fastify.all('/*', ...) para evitar conflictos con OPTIONS
  fastify.setNotFoundHandler((request, reply) => {
    fastify.log.debug(`Ruta no encontrada: ${request.method} ${request.raw.url}`);
    reply.code(404).send({
      errorCode: '404',
      errorDescription: 'Ruta no encontrada en la API'
    });
  });

  fastify.log.info('Registro de rutas dinámicas individuales completado y NotFoundHandler configurado.');

  fastify.ready(err => {
    if (err) fastify.log.error(err);
    // console.log(fastify.printRoutes()); 
  });
} 