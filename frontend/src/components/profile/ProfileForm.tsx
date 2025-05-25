import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProfileUpdateData, UserProfile } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfileImage } from '@/services/userService';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Esquema de validación
const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.string().optional(),
  bio: z.string().max(500, {
    message: 'La biografía no puede exceder los 500 caracteres.',
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  onProfileUpdate?: () => void;
}

export function ProfileForm({ onProfileUpdate }: ProfileFormProps) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      phoneNumber: '',
      address: '',
      city: '',
      country: '',
      birthDate: '',
      bio: '',
    },
  });

  // Cargar datos del perfil al formulario
  useEffect(() => {
    if (currentUser || userProfile) {
      form.reset({
        displayName: userProfile?.displayName || currentUser?.displayName || '',
        phoneNumber: userProfile?.phoneNumber || '',
        address: userProfile?.address || '',
        city: userProfile?.city || '',
        country: userProfile?.country || '',
        birthDate: userProfile?.birthDate || '',
        bio: userProfile?.bio || '',
      });
      
      setAvatarUrl(userProfile?.photoURL || currentUser?.photoURL || null);
    }
  }, [currentUser, userProfile, form]);

  // Manejar el envío del formulario
  async function onSubmit(data: ProfileFormValues) {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Preparar datos a actualizar
      const profileData: ProfileUpdateData = { ...data };
      
      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        const photoURL = await uploadProfileImage(imageFile);
        profileData.photoURL = photoURL;
      }
      
      // Actualizar el perfil
      await updateUserProfile(profileData);
      
      // Callback opcional
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Manejar la selección de imagen
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de archivo
    if (!file.type.includes('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    
    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede exceder los 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Mostrar vista previa
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  }

  // Obtener primera letra del nombre para avatar
  const getInitials = () => {
    const name = form.getValues().displayName || currentUser?.displayName || '';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center">
            <label
              htmlFor="profile-image"
              className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline"
            >
              <Upload size={16} />
              <span>Cambiar foto de perfil</span>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Tu número de teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Tu dirección" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Tu ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="Tu país" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografía</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos sobre ti..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </form>
    </Form>
  );
} 