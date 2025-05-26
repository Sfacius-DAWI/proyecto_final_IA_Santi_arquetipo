import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../config/firebase.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Verificar si el usuario existe en la base de datos, si no, crearlo
    let user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    });

    if (!user) {
      // Crear el usuario en la base de datos
      user = await prisma.user.create({
        data: {
          id: decodedToken.uid,
          nombre: decodedToken.name?.split(' ')[0] || 'Usuario',
          apellido: decodedToken.name?.split(' ').slice(1).join(' ') || '',
          role: 'USUARIO'
        }
      });
      console.log(`Usuario creado en la base de datos: ${user.id}`);
    }
    
    request.user = {
      id: decodedToken.uid
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    return reply.code(401).send({ error: 'Token inválido' });
  }
} 