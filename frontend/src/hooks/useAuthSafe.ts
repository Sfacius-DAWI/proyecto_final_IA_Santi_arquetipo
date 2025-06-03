import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Hook seguro que verifica que el contexto esté disponible
export function useAuthSafe() {
  const context = useContext(AuthContext);
  
  // Si el contexto no está disponible, devolver valores por defecto
  if (context === undefined) {
    console.warn('useAuthSafe: AuthContext no disponible, devolviendo valores por defecto');
    return {
      currentUser: null,
      userProfile: null,
      loading: true,
      profileLoading: false,
      register: async () => {
        console.error('AuthContext no disponible');
      },
      login: async () => {
        console.error('AuthContext no disponible');
      },
      loginWithGoogle: async () => {
        console.error('AuthContext no disponible');
      },
      logout: async () => {
        console.error('AuthContext no disponible');
      },
      resetPassword: async () => {
        console.error('AuthContext no disponible');
      },
      updateUserProfile: async () => {
        console.error('AuthContext no disponible');
      },
      refreshUserProfile: async () => {
        console.error('AuthContext no disponible');
      }
    };
  }
  
  return context;
} 