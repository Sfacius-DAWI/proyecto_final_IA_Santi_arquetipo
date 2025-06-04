import axios from 'axios';
import { postconversationService } from './services/santi-openai/index.js';

const API_BASE_URL = 'http://localhost:3003';

async function testChatbotIntegration() {
  console.log('=== Prueba de Integración del Chatbot ===\n');

  // Test 1: Probar el servicio de conversación directamente
  console.log('Test 1: Servicio de conversación con formulario');
  console.log('------------------------------------------------');
  try {
    const formResponse = await postconversationService({
      prompt: 'Quiero reservar el tour de montaña',
      userId: 'test-user',
      sessionId: 'test-session'
    });
    
    console.log('Respuesta del servicio:');
    console.log('- Tipo:', formResponse.type);
    console.log('- Mensaje:', formResponse.content);
    if (formResponse.form) {
      console.log('- Formulario:', formResponse.form.title);
      console.log('- Campos:', formResponse.form.fields.length);
    }
    console.log('✅ Test 1 pasado\n');
  } catch (error) {
    console.error('❌ Error en Test 1:', error);
  }

  // Test 2: Probar el endpoint del chat
  console.log('Test 2: Endpoint /api/ai/chat');
  console.log('------------------------------');
  try {
    const chatResponse = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
      sessionId: 'test-session-001',
      prompt: 'Quiero comprar el tour del caribe',
      userId: 'test-user',
      timestamp: new Date().toISOString()
    });
    
    console.log('Respuesta del endpoint:');
    console.log('- Tipo:', chatResponse.data.type);
    console.log('- Contenido:', chatResponse.data.content?.substring(0, 100) + '...');
    console.log('✅ Test 2 pasado\n');
  } catch (error: any) {
    console.error('❌ Error en Test 2:', error.response?.data || error.message);
  }

  // Test 3: Probar el endpoint de booking
  console.log('Test 3: Endpoint /api/ai/booking');
  console.log('---------------------------------');
  try {
    const bookingResponse = await axios.post(`${API_BASE_URL}/api/ai/booking`, {
      tourName: 'Tour de Montaña',
      userEmail: 'test@example.com',
      userName: 'Juan Pérez',
      phoneNumber: '+1234567890',
      numberOfPeople: 2,
      preferredDate: '2025-06-15',
      paymentMethod: 'credit_card',
      specialRequests: 'Vegetariano'
    });
    
    console.log('Respuesta del booking:');
    console.log('- Success:', bookingResponse.data.success);
    console.log('- Mensaje:', bookingResponse.data.message);
    console.log('- Booking ID:', bookingResponse.data.bookingId);
    console.log('✅ Test 3 pasado\n');
  } catch (error: any) {
    console.error('❌ Error en Test 3:', error.response?.data || error.message);
  }

  console.log('=== Pruebas completadas ===');
  console.log('\nPara probar la interfaz completa:');
  console.log('1. Asegúrate de que el backend esté corriendo (npm run dev)');
  console.log('2. En otra terminal, corre el frontend (cd ../frontend && npm run dev)');
  console.log('3. Abre http://localhost:5173 en tu navegador');
  console.log('4. Interactúa con el chatbot usando frases como "Quiero reservar un tour"');
}

// Ejecutar las pruebas
testChatbotIntegration().catch(console.error); 