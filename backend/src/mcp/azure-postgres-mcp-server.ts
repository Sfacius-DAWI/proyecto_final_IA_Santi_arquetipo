#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

class AzurePostgresMCPServer {
  private server: Server;
  private prisma: PrismaClient;
  private dbConfig: DatabaseConfig;

  constructor() {
    this.dbConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'miappdb',
      user: process.env.POSTGRES_USER || 'apiuser',
      password: process.env.POSTGRES_PASSWORD || 'apipass',
      ssl: process.env.POSTGRES_SSL === 'true'
    };

    this.server = new Server(
      {
        name: 'azure-postgres-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_tables',
            description: 'Lista todas las tablas en la base de datos',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'describe_table',
            description: 'Describe la estructura de una tabla específica',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nombre de la tabla a describir',
                },
              },
              required: ['tableName'],
            },
          },
          {
            name: 'query_data',
            description: 'Ejecuta una consulta SELECT en la base de datos',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Consulta SQL SELECT a ejecutar',
                },
                limit: {
                  type: 'number',
                  description: 'Límite de filas a retornar (máximo 100)',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_tours',
            description: 'Obtiene información de tours disponibles',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Número máximo de tours a retornar',
                  default: 10,
                },
                disponible: {
                  type: 'boolean',
                  description: 'Filtrar solo tours disponibles',
                  default: true,
                },
              },
            },
          },
          {
            name: 'get_user_purchases',
            description: 'Obtiene las compras de un usuario específico',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'ID del usuario',
                },
              },
              required: ['userId'],
            },
          },
          {
            name: 'get_database_stats',
            description: 'Obtiene estadísticas generales de la base de datos',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Ejecutar herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_tables':
            return await this.listTables();
          
          case 'describe_table':
            if (!args || typeof args.tableName !== 'string') {
              throw new Error('tableName es requerido y debe ser un string');
            }
            return await this.describeTable(args.tableName);
          
          case 'query_data':
            if (!args || typeof args.query !== 'string') {
              throw new Error('query es requerido y debe ser un string');
            }
            const limit = typeof args.limit === 'number' ? args.limit : 50;
            return await this.queryData(args.query, limit);
          
          case 'get_tours':
            const tourLimit = args && typeof args.limit === 'number' ? args.limit : 10;
            const disponible = args && typeof args.disponible === 'boolean' ? args.disponible : true;
            return await this.getTours(tourLimit, disponible);
          
          case 'get_user_purchases':
            if (!args || typeof args.userId !== 'string') {
              throw new Error('userId es requerido y debe ser un string');
            }
            return await this.getUserPurchases(args.userId);
          
          case 'get_database_stats':
            return await this.getDatabaseStats();
          
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error ejecutando ${name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Listar recursos
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'azure-postgres://schema',
            name: 'Esquema de Base de Datos',
            description: 'Esquema completo de la base de datos PostgreSQL en Azure',
            mimeType: 'application/json',
          },
          {
            uri: 'azure-postgres://connection-info',
            name: 'Información de Conexión',
            description: 'Información sobre la conexión a la base de datos',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Leer recursos
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
      const { uri } = request.params;

      switch (uri) {
        case 'azure-postgres://schema':
          return await this.getSchemaInfo();
        
        case 'azure-postgres://connection-info':
          return await this.getConnectionInfo();
        
        default:
          throw new Error(`Recurso no encontrado: ${uri}`);
      }
    });
  }

  private async listTables(): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;

      return {
        content: [
          {
            type: 'text',
            text: `Tablas en la base de datos:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error listando tablas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async describeTable(tableName: string): Promise<any> {
    try {
      const columns = await this.prisma.$queryRaw`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `;

      return {
        content: [
          {
            type: 'text',
            text: `Estructura de la tabla ${tableName}:\n${JSON.stringify(columns, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error describiendo tabla ${tableName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async queryData(query: string, limit: number = 50): Promise<any> {
    try {
      // Validar que sea una consulta SELECT
      if (!query.trim().toLowerCase().startsWith('select')) {
        throw new Error('Solo se permiten consultas SELECT');
      }

      // Limitar el número de filas
      const limitedQuery = `${query} LIMIT ${Math.min(limit, 100)}`;
      
      const result = await this.prisma.$queryRawUnsafe(limitedQuery);

      return {
        content: [
          {
            type: 'text',
            text: `Resultado de la consulta:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error ejecutando consulta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async getTours(limit: number, disponible: boolean): Promise<any> {
    try {
      const tours = await this.prisma.tour.findMany({
        where: disponible ? { disponible: true } : undefined,
        take: limit,
        include: {
          categorias: true,
          _count: {
            select: {
              reservas: true,
              compras: true,
            },
          },
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: `Tours encontrados (${tours.length}):\n${JSON.stringify(tours, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error obteniendo tours: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async getUserPurchases(userId: string): Promise<any> {
    try {
      const purchases = await this.prisma.compra.findMany({
        where: { userId },
        include: {
          tour: {
            select: {
              titulo: true,
              precio: true,
              imagen: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        content: [
          {
            type: 'text',
            text: `Compras del usuario ${userId}:\n${JSON.stringify(purchases, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error obteniendo compras del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async getDatabaseStats(): Promise<any> {
    try {
      const stats = await Promise.all([
        this.prisma.user.count(),
        this.prisma.tour.count(),
        this.prisma.compra.count(),
        this.prisma.reserva.count(),
        this.prisma.testimonio.count(),
      ]);

      const [userCount, tourCount, purchaseCount, reservationCount, testimonialCount] = stats;

      const result = {
        usuarios: userCount,
        tours: tourCount,
        compras: purchaseCount,
        reservas: reservationCount,
        testimonios: testimonialCount,
        timestamp: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: `Estadísticas de la base de datos:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async getSchemaInfo(): Promise<any> {
    try {
      const tables = await this.prisma.$queryRaw`
        SELECT 
          t.table_name,
          t.table_type,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name, c.ordinal_position;
      `;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tables, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error obteniendo esquema: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async getConnectionInfo(): Promise<any> {
    const connectionInfo = {
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      database: this.dbConfig.database,
      user: this.dbConfig.user,
      ssl: this.dbConfig.ssl,
      status: 'connected',
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(connectionInfo, null, 2),
        },
      ],
    };
  }

  async start(): Promise<void> {
    try {
      // Probar conexión a la base de datos
      await this.prisma.$connect();
      console.log('✅ Conexión a PostgreSQL establecida');

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('🚀 Servidor MCP iniciado y conectado');
    } catch (error) {
      console.error('❌ Error iniciando servidor MCP:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('🔌 Servidor MCP desconectado');
  }
}

// Iniciar servidor si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new AzurePostgresMCPServer();
  
  // Manejar señales de terminación
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
    await server.stop();
    process.exit(0);
  });

  server.start().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export default AzurePostgresMCPServer; 