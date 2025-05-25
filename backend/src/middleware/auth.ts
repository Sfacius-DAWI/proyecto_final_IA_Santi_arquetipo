import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../config/firebase.js';

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    request.user = {
      id: decodedToken.uid
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    return reply.code(401).send({ error: 'Token inválido' });
  }
} 