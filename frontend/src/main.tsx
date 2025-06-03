import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Silenciar logs de Firebase en desarrollo y producción
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Lista de términos relacionados con Firebase que queremos silenciar
const firebaseTerms = [
  'Firebase',
  'Firestore', 
  'firestore',
  'client is offline',
  'WebChannelConnection',
  'Cloud Firestore backend',
  'Connection failed',
  'FirebaseError',
  'unavailable',
  'PERMISSION_DENIED',
  'firestore.googleapis.com',
  'googapis.com',
  'firebase-analytics',
  'firebase-app'
];

// Función para verificar si un mensaje contiene términos de Firebase
const containsFirebaseTerms = (message: string): boolean => {
  return firebaseTerms.some(term => message.toLowerCase().includes(term.toLowerCase()));
};

// Sobrescribir console.error
console.error = (...args) => {
  const errorString = args.join(' ');
  if (!containsFirebaseTerms(errorString)) {
    originalConsoleError(...args);
  }
};

// Sobrescribir console.warn
console.warn = (...args) => {
  const warnString = args.join(' ');
  if (!containsFirebaseTerms(warnString)) {
    originalConsoleWarn(...args);
  }
};

// Sobrescribir console.log para filtrar también logs innecesarios
console.log = (...args) => {
  const logString = args.join(' ');
  if (!containsFirebaseTerms(logString)) {
    originalConsoleLog(...args);
  }
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
