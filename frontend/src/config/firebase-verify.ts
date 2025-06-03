// Script para verificar la configuración de Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const testFirebaseConnection = async () => {
  console.log('🔍 Iniciando verificación de Firebase...\n');

  // 1. Verificar configuración
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCbGS9lFnFK7_98qxACHDfvsEDKgTJlwP0",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "login-app-ventas-turisticas.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "login-app-ventas-turisticas",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "login-app-ventas-turisticas.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "294562557196",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:294562557196:web:fd3f9046c67c3005982d29",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2KECSCS65X"
  };

  console.log('📋 Configuración actual:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n');

  // 2. Verificar proyecto ID
  console.log('🔍 Verificando proyecto ID:', config.projectId);
  console.log('URL de verificación: https://console.firebase.google.com/project/' + config.projectId);
  console.log('\n');

  try {
    // 3. Intentar inicializar
    const apps = getApps();
    const app = apps.length ? apps[0] : initializeApp(config);
    console.log('✅ Firebase inicializado');

    // 4. Probar autenticación
    const auth = getAuth(app);
    console.log('🔐 Probando autenticación anónima...');
    await signInAnonymously(auth);
    console.log('✅ Autenticación funcionando');

    // 5. Probar Firestore
    const db = getFirestore(app);
    console.log('💾 Probando Firestore...');
    const testDoc = doc(db, 'test', 'connection-test');
    await setDoc(testDoc, {
      timestamp: new Date().toISOString(),
      test: true
    });
    console.log('✅ Firestore funcionando');

    console.log('\n✅ ¡TODO FUNCIONA CORRECTAMENTE!');

  } catch (error: any) {
    console.error('\n❌ ERROR DETECTADO:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'auth/configuration-not-found') {
      console.error('\n🚨 El proyecto no existe o no está configurado.');
      console.error('Soluciones:');
      console.error('1. Verifica que el proyecto existe en: https://console.firebase.google.com/');
      console.error('2. Crea un nuevo proyecto si no existe');
      console.error('3. Habilita Authentication y Firestore en el proyecto');
    }
  }
};

// Ejecutar verificación
testFirebaseConnection(); 