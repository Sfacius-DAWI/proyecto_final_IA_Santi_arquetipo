import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Loader2, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import api from '../services/api';
import { useToast } from './ui/use-toast';
import { DynamicForm } from './DynamicForm';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  form?: {
    title: string;
    fields: any[];
    submitButton: {
      text: string;
      action: string;
    };
  };
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente virtual de Wanderlust Tour Haven. ¿En qué puedo ayudarte hoy? Puedo mostrarte información sobre nuestros tours o ayudarte a hacer una reserva.',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage; // Guardar el input actual antes de limpiarlo
    setInputMessage('');
    setIsLoading(true);

    // Agregar mensaje de carga del asistente
    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      console.log('💬 Enviando mensaje al chatbot:', {
        sessionId,
        prompt: currentInput,
        timestamp: new Date().toISOString(),
      });

      const response = await api.post('/api/ai/chat', {
        sessionId,
        prompt: currentInput,
        // No enviamos userId, el backend lo manejará como guest
        timestamp: new Date().toISOString(),
      });

      console.log('💬 Respuesta del chatbot recibida:', response.data);

      // Verificar el tipo de respuesta
      const aiResponse = response.data;
      
      // Remover mensaje de carga y agregar respuesta real
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        
        if (aiResponse.type === 'form') {
          // Si es un formulario, agregar el mensaje con el formulario
          return [
            ...filtered,
            {
              id: Date.now().toString(),
              content: aiResponse.content || 'Por favor completa el siguiente formulario:',
              role: 'assistant',
              timestamp: new Date(),
              form: aiResponse.form,
            },
          ];
        } else {
          // Si es texto normal
          return [
            ...filtered,
            {
              id: Date.now().toString(),
              content: aiResponse.content || aiResponse.response || 'Lo siento, no pude procesar tu mensaje.',
              role: 'assistant',
              timestamp: new Date(),
            },
          ];
        }
      });
    } catch (error: any) {
      console.error('💬 Error detallado al enviar mensaje:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Remover mensaje de carga
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      
      // Agregar mensaje de error más específico
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: `Error de conexión: ${error.message}. Por favor verifica que el servidor esté funcionando.`,
        role: 'assistant',
        timestamp: new Date(),
      }]);

      toast({
        title: 'Error de conexión',
        description: `No pude conectar con el servidor: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (data: any) => {
    try {
      console.log('📋 Datos del formulario recibidos:', data);

      // Mapear los campos del formulario a los esperados por el backend
      const bookingData = {
        tourName: data.tourName,
        userEmail: data.email,
        userName: data.fullName,
        phoneNumber: data.phone,
        numberOfPeople: Number(data.numberOfPeople),
        preferredDate: data.preferredDate,
        paymentMethod: data.paymentMethod,
        specialRequests: data.specialRequests || ''
      };

      console.log('📤 Datos a enviar al backend:', bookingData);

      // Enviar los datos del formulario al backend
      const response = await api.post('/api/ai/booking', bookingData);

      // Agregar mensaje de confirmación
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: response.data.message || '¡Gracias! Tu reserva ha sido procesada exitosamente. Te enviaremos un correo de confirmación pronto.',
        role: 'assistant',
        timestamp: new Date(),
      }]);

      toast({
        title: 'Reserva exitosa',
        description: 'Tu reserva ha sido registrada correctamente.',
      });
    } catch (error: any) {
      console.error('💥 Error completo al enviar formulario:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar tu reserva. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Botón flotante del chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Ventana del chatbot */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl border-border/50 backdrop-blur-sm bg-background/95 flex flex-col
          max-[420px]:bottom-0 max-[420px]:right-0 max-[420px]:w-full max-[420px]:h-screen max-[420px]:rounded-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg max-[420px]:rounded-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Virtual</h3>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Área de mensajes */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Escribiendo...</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Renderizar formulario si el último mensaje es del asistente y tiene un formulario */}
              {messages.length > 0 && 
               messages[messages.length - 1].role === 'assistant' && 
               messages[messages.length - 1].form && (
                <div className="mt-4">
                  <DynamicForm
                    title={messages[messages.length - 1].form!.title}
                    fields={messages[messages.length - 1].form!.fields}
                    submitButton={messages[messages.length - 1].form!.submitButton}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      // Agregar mensaje de cancelación
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: 'Has cancelado el formulario. ¿En qué más puedo ayudarte?',
                        role: 'assistant',
                        timestamp: new Date(),
                      }]);
                    }}
                  />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input de mensaje */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Asistente de reservas
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot; 