export const purchaseSchema = {
  type: 'object',
  properties: {
    tourId: { type: 'string' },
    cantidad: { type: 'integer', minimum: 1 },
    metodoPago: { type: 'string', enum: ['TARJETA', 'PAYPAL', 'TRANSFERENCIA'] },
    precioTotal: { type: 'number', minimum: 0 }
  },
  required: ['tourId', 'cantidad', 'metodoPago', 'precioTotal']
};

export const purchaseResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    tourId: { type: 'string' },
    cantidad: { type: 'integer' },
    precioTotal: { type: 'number' },
    metodoPago: { type: 'string' },
    estado: { type: 'string', enum: ['PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    tour: {
      type: 'object',
      properties: {
        titulo: { type: 'string' }
      }
    }
  }
}; 