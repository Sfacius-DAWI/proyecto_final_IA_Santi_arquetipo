import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/';

// Middlewares
app.use(compression());
app.use(cors());
app.use(express.json());

// Healthcheck para orquestación de microservicios
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Configurar proxy para las solicitudes de API
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Error de comunicación con el backend');
  }
}));

// Servir archivos estáticos desde la carpeta dist (generada por Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Configuración para SPA - todas las rutas no definidas van a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend microservice running on port ${PORT}`);
  console.log(`Proxy to backend configured at: ${BACKEND_URL}`);
}); 