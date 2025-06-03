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

// Create or update user profile
export async function saveUserProfile(user: User, profileData: ProfileUpdateData): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    // Update profile in Firebase Auth
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL
      });
    }
    
    // Update or create document in Firestore
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
    console.error('Error saving profile:', error);
    throw error;
  }
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    // Si no existe, crear un perfil vacío
    const emptyProfile: UserProfile = {
      uid: userId,
      displayName: null,
      email: null,
      photoURL: null,
      phoneNumber: null,
      address: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, emptyProfile);
    return emptyProfile;
  } catch (error: any) {
    // Lista de códigos de error que indican problemas de conexión
    const offlineErrors = [
      'unavailable', 
      'permission-denied', 
      'failed-precondition',
      'aborted'
    ];
    
    const offlineMessages = [
      'client is offline',
      'Connection failed',
      'WebChannelConnection',
      'transport errored',
      'Could not reach Cloud Firestore'
    ];

    const isOfflineError = offlineErrors.includes(error?.code) || 
                          offlineMessages.some(msg => error?.message?.includes(msg));

    if (isOfflineError) {
      // Devolver perfil básico sin mostrar error
      console.log('🔒 Firestore offline detectado, devolviendo perfil por defecto');
      return {
        uid: userId,
        displayName: null,
        email: null,
        photoURL: null,
        phoneNumber: null,
        address: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Para otros errores, mostrar en consola
    console.error("Error getting profile:", error);
    throw error;
  }
};

// Upload profile image
export async function uploadProfileImage(file: File): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Optional upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          // Error
          toast.error('Error uploading profile image');
          reject(error);
        },
        async () => {
          // Successfully completed
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error in image upload:', error);
    throw error;
  }
} 