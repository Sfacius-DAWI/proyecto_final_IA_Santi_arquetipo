import { Type, Static } from '@sinclair/typebox';

// Schema base para las propiedades de un Tour (para creación/actualización)
const tourBaseProperties = {
  titulo: Type.String({ minLength: 3 }),
  descripcion: Type.String({ minLength: 10 }),
  precio: Type.Number({ minimum: 0 }), // En el servicio/handler, convertir a Decimal para Prisma si es necesario
  imagen: Type.String({ format: 'uri-reference' }), 
  duracion: Type.Integer({ minimum: 30 }), // Duración en minutos
  disponible: Type.Optional(Type.Boolean({ default: true })),
  featured: Type.Optional(Type.Boolean({ default: false })),
  etiqueta: Type.Optional(Type.String()),
  tipoEtiqueta: Type.Optional(Type.String()),
  categorias: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))), // Array de Category IDs
};

const TourCreationBodySchema = Type.Object(tourBaseProperties, { $id: 'TourCreationBody' });

const TourResponseObjectSchema = Type.Object({
  ...tourBaseProperties,
  id: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  categorias: Type.Optional(Type.Array(Type.Object({ 
    id: Type.String({ format: 'uuid' }),
    nombre: Type.String(),
  }))),
  guias: Type.Optional(Type.Array(Type.Object({ 
    guia: Type.Object({
        id: Type.String({ format: 'uuid' }), 
        user: Type.Object({
            id: Type.String(),
            nombre: Type.String(),
            apellido: Type.String()
        })
    })
  })))
}, { $id: 'TourResponseObject' });

const IdParamsSchema = Type.Object({ id: Type.String({ format: 'uuid' }) }, { $id: 'TourIdParams' });

const LimitQuerySchema = Type.Object({ 
  limit: Type.Optional(Type.Integer({ minimum: 1, default: 4 })) 
}, { $id: 'LimitQuery' });

const TourFiltersQuerySchema = Type.Object({
    disponible: Type.Optional(Type.Boolean()),
    featured: Type.Optional(Type.Boolean()),
}, { $id: 'TourFiltersQuery' });

const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.Optional(Type.String())
}, { $id: 'TourErrorResponse' });

export const CreateTourEndpointSchema = {
  body: TourCreationBodySchema,
  response: {
    201: TourResponseObjectSchema,
    400: ErrorResponseSchema,
    500: ErrorResponseSchema
  }
};

export const GetAllToursEndpointSchema = {
  querystring: TourFiltersQuerySchema,
  response: {
    200: Type.Array(TourResponseObjectSchema),
    500: ErrorResponseSchema 
  }
};

export const GetFeaturedToursEndpointSchema = {
  querystring: LimitQuerySchema,
  response: {
    200: Type.Array(TourResponseObjectSchema),
    500: ErrorResponseSchema 
  }
};

export const GetTourByIdEndpointSchema = {
  params: IdParamsSchema,
  response: {
    200: TourResponseObjectSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema 
  }
};

const UpdateTourBodySchema = Type.Partial(TourCreationBodySchema, { $id: 'UpdateTourBody' });

export const UpdateTourEndpointSchema = {
  params: IdParamsSchema,
  body: UpdateTourBodySchema, 
  response: {
    200: TourResponseObjectSchema,
    400: ErrorResponseSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema 
  }
};

export const DeleteTourEndpointSchema = {
  params: IdParamsSchema,
  response: {
    204: Type.Null({ description: 'Tour eliminado exitosamente' }),
    404: ErrorResponseSchema,
    500: ErrorResponseSchema 
  }
}; 