# Componente Chatbot

## 📝 Descripción

Componente de chatbot integrado con la API de OpenAI que proporciona asistencia virtual a los usuarios de la aplicación.

## 🚀 Características

- **Interfaz flotante**: Botón de chat ubicado en la esquina inferior derecha
- **Diseño responsivo**: Se adapta a dispositivos móviles (pantalla completa en móviles)
- **Tiempo real**: Respuestas instantáneas con indicador de carga
- **Historial de conversación**: Mantiene el contexto de la conversación
- **Integración con OpenAI**: Utiliza el servicio backend configurado con OpenAI Assistant

## 🎨 Diseño

El chatbot sigue el sistema de diseño de la aplicación:
- Colores primarios y secundarios definidos en el tema
- Componentes UI de shadcn/ui
- Iconos de lucide-react
- Animaciones suaves y transiciones

## 📱 Responsividad

- **Desktop**: Ventana flotante de 384px de ancho
- **Mobile**: Pantalla completa en dispositivos con ancho < 420px

## 🔧 Uso

El componente se agrega automáticamente en `App.tsx` y está disponible en todas las páginas:

```tsx
import Chatbot from './components/Chatbot';

// En App.tsx
<BrowserRouter>
  <Navbar />
  <Routes>
    {/* ... rutas ... */}
  </Routes>
  <Footer />
  <Chatbot /> {/* Agregado aquí */}
</BrowserRouter>
```

## 🛠️ Configuración Backend

Asegúrate de que las siguientes variables de entorno estén configuradas en el backend:

```env
OPENAI_API_KEY="tu_api_key_de_openai"
ASSISTANT_OPENAI_ID="tu_assistant_id"
```

## 📡 API Endpoint

El chatbot utiliza el siguiente endpoint:

```
POST /api/ai/chat
```

### Payload de solicitud:
```json
{
  "sessionId": "session_unique_id",
  "prompt": "mensaje del usuario",
  "userId": "guest_user",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Respuesta esperada:
```json
{
  "response": "respuesta del asistente",
  "tokensUsage": 25,
  "DOC": "documentos de referencia",
  "success": true
}
```

## 🎯 Funcionalidades

1. **Botón flotante**: Click para abrir el chat
2. **Envío de mensajes**: Enter o click en el botón de enviar
3. **Indicador de escritura**: Muestra cuando el bot está procesando
4. **Timestamps**: Hora de cada mensaje
5. **Auto-scroll**: Se desplaza automáticamente a los nuevos mensajes
6. **Manejo de errores**: Toast notifications para errores

## 🔐 Consideraciones de Seguridad

- Los mensajes se envían a través de la API configurada con axios
- El sessionId es único por sesión de chat
- Los errores se manejan adecuadamente sin exponer información sensible

## 🚧 Mejoras Futuras

- [ ] Persistencia de conversaciones
- [ ] Autenticación de usuario real (actualmente usa 'guest_user')
- [ ] Soporte para archivos adjuntos
- [ ] Comandos especiales
- [ ] Temas personalizables
- [ ] Exportar conversaciones 