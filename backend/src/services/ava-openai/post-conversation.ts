import { ChatInterface, AIResponse } from '../../types/general-AI-request.interface.js';
import OpenAI from 'openai';
import { getAllTours } from '../tours/functions/getAllTours.js';

import { addMessage, getMessage } from './add-message.js';
import { addThread } from './add-thread.js';
import { runThread, statusThread } from './run-thread.js';
import { retrieveFile } from './retrieve-file.js';

// Configurar la API key de OpenAI si está disponible
const OPENAI_AVAILABLE = !!process.env.OPENAI_API_KEY;
export const client = OPENAI_AVAILABLE ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Función para detectar intención de compra y extraer información del tour
const detectPurchaseIntent = (message: string): { isPurchase: boolean; tourName?: string } => {
  const purchaseKeywords = ['comprar', 'reservar', 'adquirir', 'quiero', 'deseo', 'necesito'];
  const tourKeywords = {
    'montaña': 'Tour de Montaña',
    'playa': 'Tour de Playa',
    'ciudad': 'Tour de Ciudad',
    'aventura': 'Tour de Aventura',
    'amazónica': 'Tour Aventura Amazónica',
    'europa': 'Excursión Cultural en Europa',
    'caribe': 'Escape Sereno en el Caribe'
  };

  const lowerMessage = message.toLowerCase();
  const hasPurchaseIntent = purchaseKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (!hasPurchaseIntent) {
    return { isPurchase: false };
  }

  // Buscar qué tour menciona
  for (const [keyword, tourName] of Object.entries(tourKeywords)) {
    if (lowerMessage.includes(keyword)) {
      return { isPurchase: true, tourName };
    }
  }

  return { isPurchase: true, tourName: undefined };
};

// Función para generar el formulario de compra
const generatePurchaseForm = async (tourName?: string): Promise<AIResponse> => {
  // Obtener la lista de tours disponibles
  let tourOptions: { value: string; label: string }[] = [];
  
  try {
    const tours = await getAllTours({ disponible: true });
    tourOptions = tours.map(tour => ({
      value: tour.titulo,
      label: `${tour.titulo} - €${tour.precio}`
    }));
  } catch (error) {
    console.error('Error obteniendo tours para el formulario:', error);
    // Fallback con tours estáticos si hay error
    tourOptions = [
      { value: 'Historic City Walking Tour', label: 'Historic City Walking Tour - €25' },
      { value: 'Underground Caves & Nature Experience', label: 'Underground Caves & Nature Experience - €65' },
      { value: 'Quad Adventure & Snorkeling Experience', label: 'Quad Adventure & Snorkeling Experience - €95' }
    ];
  }

  const baseForm = {
    type: 'form' as const,
    content: tourName 
      ? `¡Excelente elección! Te ayudaré a reservar el ${tourName}. Por favor completa el siguiente formulario:`
      : 'Te ayudaré con tu reserva. Por favor completa el siguiente formulario:',
    form: {
      title: tourName ? `Formulario de Reserva - ${tourName}` : 'Formulario de Reserva de Tour',
      fields: [
        {
          name: 'tourName',
          type: 'select' as const,
          label: 'Selecciona el Tour',
          required: true,
          value: tourName || '',
          options: tourOptions
        },
        {
          name: 'fullName',
          type: 'text' as const,
          label: 'Nombre Completo',
          required: true,
          placeholder: 'Juan Pérez'
        },
        {
          name: 'email',
          type: 'email' as const,
          label: 'Correo Electrónico',
          required: true,
          placeholder: 'juan@ejemplo.com'
        },
        {
          name: 'phone',
          type: 'tel' as const,
          label: 'Teléfono',
          required: true,
          placeholder: '+1234567890'
        },
        {
          name: 'numberOfPeople',
          type: 'number' as const,
          label: 'Número de Personas',
          required: true,
          min: 1,
          max: 10,
          value: 1
        },
        {
          name: 'preferredDate',
          type: 'date' as const,
          label: 'Fecha Preferida',
          required: true,
          min: new Date().toISOString().split('T')[0]
        },
        {
          name: 'paymentMethod',
          type: 'select' as const,
          label: 'Método de Pago',
          required: true,
          options: [
            { value: 'credit_card', label: 'Tarjeta de Crédito' },
            { value: 'debit_card', label: 'Tarjeta de Débito' },
            { value: 'paypal', label: 'PayPal' },
            { value: 'bank_transfer', label: 'Transferencia Bancaria' }
          ]
        },
        {
          name: 'specialRequests',
          type: 'textarea' as const,
          label: 'Solicitudes Especiales',
          required: false,
          placeholder: 'Alergias alimentarias, necesidades especiales, etc.'
        }
      ],
      submitButton: {
        text: 'Confirmar Reserva',
        action: 'submit_booking'
      }
    }
  };

  return baseForm;
};

export const postconversationService = async(chatrequest: ChatInterface): Promise<AIResponse> => {
  try {
    // Detectar si el mensaje tiene intención de compra
    const { isPurchase, tourName } = detectPurchaseIntent(chatrequest.prompt);
    
    if (isPurchase) {
      // Si detectamos intención de compra, devolver el formulario
      return await generatePurchaseForm(tourName);
    }

    // Si no es una intención de compra y no hay OpenAI, devolver mensaje por defecto
    if (!OPENAI_AVAILABLE || !process.env.ASSISTANT_OPENAI_ID) {
      return {
        type: 'text',
        content: 'Lo siento, el servicio de chat no está disponible en este momento. Sin embargo, puedo ayudarte con reservas. Solo dime qué tour quieres reservar.'
      };
    }
    
    const assistant = process.env.ASSISTANT_OPENAI_ID;

    // Crear un nuevo thread para cada conversación
    const thread = await addThread();
    if (!thread) {
      throw new Error('Failed to create thread');
    }

    // Procesar con OpenAI
    await addMessage(chatrequest, thread);
    const run = await runThread(assistant, thread);
    const RunId = run.id;
    const runStatus = await statusThread(thread, RunId);
    const tokensUsage = runStatus.usage;
    const messages = await getMessage(thread);

    const firstContentBlock: any = messages.data[0].content[0];
    let doc;
    if (firstContentBlock?.text?.annotations?.[0] !== undefined) {
      doc = await retrieveFile(firstContentBlock.text.annotations[0].file_citation.file_id);
    }

    const kibanaMessage = {
      req: chatrequest,
      response: messages
    };

    console.log('postConversationOpenai', kibanaMessage);

    return {
      type: 'text',
      content: (messages.data[0].content[0] as any).text?.value ?? '',
      tokensUsage: tokensUsage?.total_tokens ?? 0,
      DOC: doc === undefined ? 'no hay documentos de referencia' : doc.filename
    };

  } catch (error: any) {
    console.error('Error in postconversationService:', error);
    
    return {
      type: 'text',
      content: 'Lo siento, hubo un error procesando tu solicitud. Por favor intenta nuevamente.',
      actionResult: {
        success: false,
        error: error.message
      }
    };
  }
}; 