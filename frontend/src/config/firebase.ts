import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbGS9lFnFK7_98qxACHDfvsEDKgTJlwP0",
  authDomain: "login-app-ventas-turisticas.firebaseapp.com",
  projectId: "login-app-ventas-turisticas",
  storageBucket: "login-app-ventas-turisticas.appspot.com",
  messagingSenderId: "294562557196",
  appId: "1:294562557196:web:fd3f9046c67c3005982d29",
  measurementId: "G-2KECSCS65X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuración mejorada para evitar errores de conexión
let isOfflineModeEnabled = false;

const enableOfflineMode = async () => {
  if (!isOfflineModeEnabled) {
    try {
      await disableNetwork(db);
      isOfflineModeEnabled = true;
      console.log('🔒 Firestore modo offline activado');
    } catch (error) {
      // Ignorar errores al deshabilitar red
    }
  }
};

// Solo inicializar conexiones cuando hay usuario autenticado
auth.onAuthStateChanged((user) => {
  if (!user && !isOfflineModeEnabled) {
    // Usuario no autenticado: deshabilitar Firestore
    enableOfflineMode();
  } else if (user && isOfflineModeEnabled) {
    // Usuario autenticado: rehabilitar conexión si es necesario
    // (esto se maneja automáticamente por Firebase)
  }
});

// Deshabilitar inmediatamente al cargar si no hay usuario
if (!auth.currentUser) {
  enableOfflineMode();
}

export default app;