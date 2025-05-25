import axios from 'axios';

// Asegurarnos de que la URL del backend esté correctamente formada
const getBackendUrl = () => {
  // En desarrollo, usar la URL relativa para que funcione con el proxy de Vite
  const isDevelopment = import.meta.env.MODE === 'development';
  const url = isDevelopment ? '/api' : import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
  console.log('URL del backend:', url);
  return url;
};

const BACKEND_URL = getBackendUrl();
console.log('URL del backend configurada:', BACKEND_URL);

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración adicional
  timeout: 10000, // 10 segundos de timeout
  withCredentials: true, // Habilitar credenciales para CORS
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de petición:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        error: error.message
      });
    } else {
      // Algo sucedió en la configuración de la petición que causó el error
      console.error('Error de configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor para peticiones
api.interceptors.request.use(
  (config) => {
    console.log('Realizando petición a:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

export default api; 