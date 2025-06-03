import { postconversationService } from './services/ava-openai/index.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testOpenAIFormFunctions() {
  console.log('=== Probando generación de formularios de OpenAI ===\n');

  // Test 1: Mensajes que deberían generar formularios
  console.log('Test 1: Mensajes con intención de compra');
  console.log('----------------------------------------');
  
  const purchaseMessages = [
    'Quiero comprar el tour de montaña',
    'Deseo reservar el tour del caribe',
    'Me gustaría adquirir el tour de aventura amazónica',
    'Necesito reservar el tour cultural en europa'
  ];

  for (const message of purchaseMessages) {
    console.log(`\nProbando: "${message}"`);
    try {
      const response = await postconversationService({
        prompt: message,
        userId: 'test-user-123',
        sessionId: 'test-session-001'
      });
      
      if (response.type === 'form') {
        console.log('✅ Formulario generado:');
        console.log(`   Título: ${response.form?.title}`);
        console.log(`   Campos: ${response.form?.fields.length}`);
        console.log(`   Botón: ${response.form?.submitButton.text}`);
        console.log(`   Mensaje: ${response.content}`);
      } else {
        console.log('❌ No se generó formulario, respuesta tipo:', response.type);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Test 2: Mensajes que NO deberían generar formularios
  console.log('\n\nTest 2: Mensajes sin intención de compra');
  console.log('----------------------------------------');
  
  const generalMessages = [
    '¿Qué tours tienes disponibles?',
    '¿Cuál es el clima en la montaña?',
    'Cuéntame más sobre los tours'
  ];

  for (const message of generalMessages) {
    console.log(`\nProbando: "${message}"`);
    try {
      const response = await postconversationService({
        prompt: message,
        userId: 'test-user-123',
        sessionId: 'test-session-001'
      });
      
      if (response.type === 'form') {
        console.log('❌ Se generó formulario cuando no debería');
      } else {
        console.log('✅ Respuesta normal de texto');
        console.log(`   Tipo: ${response.type}`);
        console.log(`   Contenido: ${response.content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  console.log('\n=== Pruebas completadas ===');
}

// Ejecutar pruebas
testOpenAIFormFunctions().catch(console.error); 