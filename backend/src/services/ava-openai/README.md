# Servicio AVA-OpenAI

Este servicio integra OpenAI Assistant API para manejar conversaciones y detectar intenciones de compra para generar formularios de reserva.

## Estructura

```
ava-openai/
├── index.ts                    # Exportaciones principales del módulo
├── post-conversation.ts        # Servicio principal de conversación y detección
├── add-thread.ts              # Creación de threads de OpenAI
├── run-thread.ts              # Ejecución y estado de threads
├── add-message.ts             # Gestión de mensajes en threads
├── retrieve-file.ts           # Recuperación de archivos de OpenAI
└── README.md                  # Documentación
```

## Funcionalidades

### Detección de Intención de Compra
- Detecta palabras clave de compra: comprar, reservar, adquirir, etc.
- Identifica tours específicos mencionados
- Genera formularios dinámicos de reserva

### Conversación con OpenAI
- Integración con OpenAI Assistant API (cuando está disponible)
- Manejo de threads y mensajes
- Recuperación de archivos de referencia

## Uso

```typescript
import { postconversationService } from './services/ava-openai';

// Solicitud que genera formulario
const formResponse = await postconversationService({
  prompt: "Quiero reservar el tour de montaña",
  userId: "user123",
  sessionId: "session-001"
});

// Solicitud de conversación normal
const chatResponse = await postconversationService({
  prompt: "¿Qué tours tienes disponibles?",
  userId: "user123",
  sessionId: "session-001"
});
```

## Variables de Entorno

- `OPENAI_API_KEY`: API key de OpenAI (opcional)
- `ASSISTANT_OPENAI_ID`: ID del asistente de OpenAI (opcional)

Si no están configuradas, el servicio funcionará en modo limitado pero seguirá generando formularios. 