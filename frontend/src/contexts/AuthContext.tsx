import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { toast } from 'sonner';
import { getUserProfile, saveUserProfile } from '@/services/userService';
import { UserProfile, ProfileUpdateData } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Exportar el contexto para uso en otros archivos
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function fetchUserProfile(user: User) {
    if (!user) {
      console.log('👤 No hay usuario autenticado, omitiendo carga de perfil');
      return;
    }
    
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error: any) {
      // Solo mostrar errores que no sean de conexión offline
      if (error?.code !== 'unavailable' && 
          !error?.message?.includes('client is offline') &&
          !error?.message?.includes('Connection failed')) {
        console.error('Error loading user profile:', error);
      }
      // Establecer perfil null en caso de error
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        console.log('✅ Usuario autenticado detectado, cargando perfil...');
        fetchUserProfile(user);
      } else {
        console.log('❌ Usuario no autenticado, limpiando perfil...');
        setUserProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(email: string, password: string) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Registration successful!');
    } catch (error: any) {
      let errorMessage = 'Error registering user';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters';
          break;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error('Incorrect email or password');
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Google login successful!');
    } catch (error) {
      toast.error('Error signing in with Google');
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast.success('Session closed successfully');
    } catch (error) {
      toast.error('Error signing out');
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('A password reset email has been sent');
    } catch (error) {
      toast.error('Error sending password reset email');
      throw error;
    }
  }

  async function updateUserProfile(data: ProfileUpdateData) {
    if (!currentUser) {
      toast.error('You must be logged in to update your profile');
      throw new Error('User not authenticated');
    }

    try {
      setProfileLoading(true);
      await saveUserProfile(currentUser, data);
      await refreshUserProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }

  async function refreshUserProfile() {
    if (!currentUser) return;
    
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 