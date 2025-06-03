import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { postconversationService } from '../../../services/ava-openai/index.js';
import { ChatInterface, AIResponse } from '../../../types/general-AI-request.interface.js';
// Importar el schema completo del endpoint y el schema del body para inferir el tipo
import { AIChatEndpointSchema, ChatRequestSchema } from './schemas/ai.schema.js';

// Inferir tipo del body desde el ChatRequestSchema (que es parte de AIChatEndpointSchema)
type ChatRequestType = Static<typeof ChatRequestSchema>;
// El tipo de respuesta se puede inferir de AIConversationResponseSchema si es necesario aquí,
// pero Fastify lo usará desde AIChatEndpointSchema.response

export default async function (fastify: FastifyInstance) {
  // Esta ruta se registrará como POST /api/ai/chat
  fastify.post<
    { Body: ChatRequestType }
  >('/chat', { 
    schema: AIChatEndpointSchema, // Usar el schema completo del endpoint
    handler: async (request: FastifyRequest<{ Body: ChatRequestType }>, reply: FastifyReply) => {
      try {
        const chatRequest: ChatInterface = {
          sessionId: request.body.sessionId,
          prompt: request.body.prompt,
          userId: request.body.userId,
          timestamp: request.body.timestamp || new Date().toISOString()
        };
        const aiServiceResponse: AIResponse = await postconversationService(chatRequest);
        
        // Construir la respuesta del endpoint basada en AIResponse
        // El schema AIConversationResponseSchema ya incluye un campo 'success' general
        return reply.code(200).send({
          type: aiServiceResponse.type,
          content: aiServiceResponse.content,
          actionResult: aiServiceResponse.actionResult,
          form: aiServiceResponse.form,
          tokensUsage: aiServiceResponse.tokensUsage,
          DOC: aiServiceResponse.DOC,
          success: aiServiceResponse.actionResult ? aiServiceResponse.actionResult.success : true
          // Para una respuesta de solo texto o form, consideramos success = true
          // Si hay actionResult, el success de actionResult determina el success general.
        });
      } catch (error: any) {
        request.log.error('Error in AI chat handler:', error);
        // El schema AIConversationResponseSchema (usado para errores 500) espera este formato.
        return reply.code(500).send({
          type: 'text', // o 'action_result' si el error es de una acción
          content: 'Error al procesar la solicitud de chat: ' + error.message,
          actionResult: {
            success: false,
            error: error.message
          },
          tokensUsage: 0,
          DOC: 'Error',
          success: false
        });
      }
    }
  });
} 