import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { currentUser, loading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireccionar si no hay sesión iniciada
    if (!loading && !currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser) {
      // Asegurar que tenemos los datos más recientes
      refreshUserProfile();
    }
  }, [currentUser, loading, navigate, refreshUserProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </div>
        
        <ProfileInfo />
      </div>
    </div>
  );
} 