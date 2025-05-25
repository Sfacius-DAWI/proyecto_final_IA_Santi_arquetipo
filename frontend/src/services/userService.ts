import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { User, updateProfile } from 'firebase/auth';
import { auth, db, storage } from '@/config/firebase';
import { UserProfile, ProfileUpdateData } from '@/types/user';
import { toast } from 'sonner';

// Crear o actualizar perfil de usuario
export async function saveUserProfile(user: User, profileData: ProfileUpdateData): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    // Actualizar perfil en Firebase Auth
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL
      });
    }
    
    // Actualizar o crear documento en Firestore
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    throw error;
  }
}

// Obtener perfil de usuario
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

// Subir imagen de perfil
export async function uploadProfileImage(file: File): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso opcional de carga
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso de carga: ${progress}%`);
        },
        (error) => {
          // Error
          toast.error('Error al subir la imagen de perfil');
          reject(error);
        },
        async () => {
          // Completado con éxito
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error en la carga de imagen:', error);
    throw error;
  }
} 