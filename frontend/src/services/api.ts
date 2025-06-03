import axios from 'axios';

// Configuración simplificada para desarrollo
const getBackendUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    // En desarrollo, usar directamente el puerto del backend
    return 'http://localhost:3003';
  }
  
  // En producción, usar la variable de entorno o fallback
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
};

const BACKEND_URL = getBackendUrl();
console.log('🔗 API configurada para:', BACKEND_URL);

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
  withCredentials: false, // Deshabilitar credenciales por ahora
});

// Interceptor para debug de peticiones
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('🚀 Enviando petición:', {
      method: config.method?.toUpperCase(),
      url: fullUrl,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Error en configuración de petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('❌ Error de servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('❌ Error de conexión:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else {
      // Error en la configuración de la petición
      console.error('❌ Error de configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 