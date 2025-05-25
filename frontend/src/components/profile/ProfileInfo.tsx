import { UserProfile } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ProfileInfoProps {
  isEditable?: boolean;
}

export function ProfileInfo({ isEditable = true }: ProfileInfoProps) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <div>No hay usuario autenticado</div>;
  }

  // Obtener datos combinados de Auth y Firestore
  const displayName = userProfile?.displayName || currentUser.displayName || 'Usuario';
  const email = userProfile?.email || currentUser.email || '';
  const photoURL = userProfile?.photoURL || currentUser.photoURL || '';
  const phoneNumber = userProfile?.phoneNumber || '';
  const address = userProfile?.address || '';
  const city = userProfile?.city || '';
  const country = userProfile?.country || '';
  const birthDate = userProfile?.birthDate || '';
  const bio = userProfile?.bio || '';

  // Obtener iniciales para el avatar fallback
  const getInitials = () => {
    return displayName.charAt(0).toUpperCase();
  };

  // Formatear dirección completa
  const getFullAddress = () => {
    const parts = [address, city, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No especificada';
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col items-center pb-2">
        <Avatar className="w-32 h-32 mb-4">
          <AvatarImage src={photoURL} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold text-center">{displayName}</h2>
        {bio && (
          <p className="text-muted-foreground mt-4 text-center max-w-md">{bio}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">
                  {phoneNumber || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">{getFullAddress()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha de nacimiento</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(birthDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {isEditable && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/perfil/editar">Editar perfil</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 