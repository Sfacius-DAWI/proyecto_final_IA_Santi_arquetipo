import { Type, Static } from '@sinclair/typebox';

// Schema para la petición de chat
export const ChatRequestSchema = Type.Object({
  sessionId: Type.String({ minLength: 1 }),
  prompt: Type.String({ minLength: 1 }),
  userId: Type.Optional(Type.String()),
  timestamp: Type.Optional(Type.String())
}, { $id: 'AIChatRequest' });

// Schema para campos de formulario
export const FormFieldSchema = Type.Object({
  name: Type.String(),
  type: Type.Union([
    Type.Literal('text'),
    Type.Literal('email'),
    Type.Literal('tel'),
    Type.Literal('number'),
    Type.Literal('date'),
    Type.Literal('select'),
    Type.Literal('textarea')
  ]),
  label: Type.String(),
  value: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  required: Type.Boolean(),
  placeholder: Type.Optional(Type.String()),
  min: Type.Optional(Type.Union([Type.Number(), Type.String()])),
  max: Type.Optional(Type.Number()),
  options: Type.Optional(Type.Array(Type.Object({
    value: Type.String(),
    label: Type.String()
  })))
});

// Schema para la respuesta de conversación de IA general
export const AIConversationResponseSchema = Type.Object({
  type: Type.Union([
    Type.Literal('text'),
    Type.Literal('action_result'),
    Type.Literal('form')
  ]),
  content: Type.String(),
  actionResult: Type.Optional(Type.Object({
    success: Type.Boolean(),
    data: Type.Optional(Type.Any()), // Usar Type.Unknown() o un schema más específico si es posible
    error: Type.Optional(Type.String())
  })),
  form: Type.Optional(Type.Object({
    title: Type.String(),
    fields: Type.Array(FormFieldSchema),
    submitButton: Type.Object({
      text: Type.String(),
      action: Type.String()
    })
  })),
  tokensUsage: Type.Optional(Type.Number()),
  DOC: Type.Optional(Type.String()),
  success: Type.Boolean() // Indica el éxito general de la operación del endpoint
}, { $id: 'AIConversationResponse' });

// Schema completo para el endpoint de chat de IA
export const AIChatEndpointSchema = {
  // description: 'Enviar un mensaje al asistente de IA y obtener una respuesta conversacional o resultado de acción.',
  // tags: ['AI'],
  body: ChatRequestSchema,
  response: {
    200: AIConversationResponseSchema,
    500: AIConversationResponseSchema // Se puede usar un ErrorResponseSchema más genérico para 500
  }
};

// Schema para la respuesta del endpoint de health check de AI
export const AIHealthEndpointSchema = {
  // description: 'Verifica el estado del servicio de IA.',
  // tags: ['AI', 'Health'],
  response: {
    200: Type.Object({
      status: Type.String(),
      service: Type.String(),
      timestamp: Type.String()
    }, { 
      $id: 'AIHealthResponse', 
      required: ['status', 'service', 'timestamp'] 
    })
  }
}; 