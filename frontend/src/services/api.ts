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
  withCredentials: false, // Deshabilitar credenciales por ahora
});

// Interceptor para debug de peticiones
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Enviando petición:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
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
      console.error('❌ Error de servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ Error de conexión:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else {
      console.error('❌ Error de configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 