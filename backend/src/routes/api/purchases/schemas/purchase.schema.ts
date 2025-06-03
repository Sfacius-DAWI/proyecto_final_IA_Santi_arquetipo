import { Type } from '@sinclair/typebox';

const purchaseBodySchema = Type.Object({
  tourId: Type.String({ format: 'uuid' }),
  cantidad: Type.Integer({ minimum: 1 }),
  metodoPago: Type.Enum({ TARJETA: 'TARJETA', PAYPAL: 'PAYPAL', TRANSFERENCIA: 'TRANSFERENCIA' }),
  precioTotal: Type.Number({ minimum: 0 })
}, { $id: 'PurchaseBody' });

const purchaseResponseObjectSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String(),
  tourId: Type.String({ format: 'uuid' }),
  cantidad: Type.Integer(),
  precioTotal: Type.Number(),
  metodoPago: Type.Enum({ TARJETA: 'TARJETA', PAYPAL: 'PAYPAL', TRANSFERENCIA: 'TRANSFERENCIA' }),
  estado: Type.Enum({ 
    PENDIENTE: 'PENDIENTE', 
    COMPLETADO: 'COMPLETADO', 
    FALLIDO: 'FALLIDO', 
    REEMBOLSADO: 'REEMBOLSADO', 
    CANCELADO: 'CANCELADO' 
  }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  tour: Type.Optional(Type.Object({
    titulo: Type.String()
  }))
}, { $id: 'PurchaseResponseObject' });

const idParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
}, { $id: 'IdParams' });

const updatePurchaseBodySchema = Type.Object({
  cantidad: Type.Optional(Type.Integer({ minimum: 1 })),
}, { $id: 'UpdatePurchaseBody' });

const errorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.Optional(Type.String())
}, { $id: 'ErrorResponse' });

export const GetUserPurchasesSchema = {
  response: {
    200: Type.Array(purchaseResponseObjectSchema)
  }
};

export const CreatePurchaseEndpointSchema = {
  body: purchaseBodySchema,
  response: {
    201: purchaseResponseObjectSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const GetPurchaseByIdEndpointSchema = {
  params: idParamsSchema,
  response: {
    200: purchaseResponseObjectSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const UpdatePurchaseEndpointSchema = {
  params: idParamsSchema,
  body: updatePurchaseBodySchema,
  response: {
    200: purchaseResponseObjectSchema,
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const CancelPurchaseEndpointSchema = {
  params: idParamsSchema,
  response: {
    200: purchaseResponseObjectSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
}; 