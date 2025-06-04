import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Loader2, Bot, User, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import api from '../services/api';
import { useToast } from './ui/use-toast';
import { useAuthSafe } from '@/hooks/useAuthSafe';
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
  requiresAuth?: boolean;
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
  
  // Estados para autenticación
  const { currentUser, login, loginWithGoogle } = useAuthSafe();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

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
    const currentInput = inputMessage;
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
        timestamp: new Date().toISOString(),
      });

      console.log('💬 Respuesta del chatbot recibida:', response.data);

      const aiResponse = response.data;
      
      // Remover mensaje de carga y agregar respuesta real
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        
        if (aiResponse.type === 'form') {
          // Si es un formulario, marcarlo como que requiere autenticación
          return [
            ...filtered,
            {
              id: Date.now().toString(),
              content: aiResponse.content || 'Por favor completa el siguiente formulario:',
              role: 'assistant',
              timestamp: new Date(),
              form: aiResponse.form,
              requiresAuth: true,
            },
          ];
        } else {
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
      
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      
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

  // Manejo del login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      
      // Si había datos de formulario pendientes, procesarlos
      if (pendingFormData) {
        await handleFormSubmitAuthenticated(pendingFormData);
        setPendingFormData(null);
      }
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Ahora puedes continuar con tu reserva.',
      });
    } catch (error) {
      // El error ya se maneja en el contexto de auth
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    
    try {
      await loginWithGoogle();
      setShowLoginModal(false);
      
      if (pendingFormData) {
        await handleFormSubmitAuthenticated(pendingFormData);
        setPendingFormData(null);
      }
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Ahora puedes continuar con tu reserva.',
      });
    } catch (error) {
      // El error ya se maneja en el contexto de auth
    } finally {
      setLoginLoading(false);
    }
  };

  // Función para manejar el envío del formulario con autenticación
  const handleFormSubmitAuthenticated = async (data: any) => {
    try {
      console.log('📋 Datos del formulario recibidos:', data);

      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener token de autenticación
      const token = await currentUser.getIdToken();

      const bookingData = {
        tourName: data.tourName,
        userEmail: currentUser.email || data.email,
        userName: data.fullName,
        phoneNumber: data.phone,
        numberOfPeople: Number(data.numberOfPeople),
        preferredDate: data.preferredDate,
        paymentMethod: data.paymentMethod,
        specialRequests: data.specialRequests || ''
      };

      console.log('📤 Datos a enviar al backend:', bookingData);

      // Enviar con token de autenticación
      const response = await api.post('/api/ai/booking', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Agregar mensaje de confirmación
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: response.data.message || '¡Gracias! Tu reserva ha sido procesada exitosamente. Te enviaremos un correo de confirmación pronto. Puedes ver tus reservas en la sección "Mis Compras".',
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

  // Función que maneja el envío del formulario (verifica autenticación primero)
  const handleFormSubmit = async (data: any) => {
    if (!currentUser) {
      // Guardar los datos del formulario y mostrar modal de login
      setPendingFormData(data);
      setShowLoginModal(true);
      
      // Agregar mensaje informativo
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Para completar tu reserva, necesitas iniciar sesión o crear una cuenta. Esto te permitirá ver y gestionar tus reservas desde tu cuenta.',
        role: 'assistant',
        timestamp: new Date(),
      }]);
      
      return;
    }

    // Si ya está autenticado, procesar directamente
    await handleFormSubmitAuthenticated(data);
  };

  return (
    <>
      {/* Modal de Login */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </DialogTitle>
            <DialogDescription>
              Inicia sesión para completar tu reserva y gestionar tus tours.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loginLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loginLoading}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                className="w-full"
              >
                Continuar con Google
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowLoginModal(false);
                  setPendingFormData(null);
                }}
                disabled={loginLoading}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                <p className="text-xs opacity-90">
                  {currentUser ? `Hola, ${currentUser.email}` : 'En línea'}
                </p>
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
                  {/* Mostrar información de autenticación si se requiere */}
                  {messages[messages.length - 1].requiresAuth && !currentUser && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="flex items-center">
                        <LogIn className="w-4 h-4 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">
                          Necesitas iniciar sesión para hacer una reserva
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <DynamicForm
                    title={messages[messages.length - 1].form!.title}
                    fields={messages[messages.length - 1].form!.fields}
                    submitButton={messages[messages.length - 1].form!.submitButton}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
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
              {currentUser && (
                <span className="text-primary"> • Conectado como {currentUser.email}</span>
              )}
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot; 