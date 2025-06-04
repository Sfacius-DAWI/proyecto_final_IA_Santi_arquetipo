import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      // Error ya manejado en el contexto de autenticación
    }
  };

  return (
    <div className="container-custom section-padding">
      <h1 className="heading-lg mb-6">Panel de Control</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-medium mb-4">
          Bienvenido, {currentUser?.email || 'Usuario'}
        </h2>
        <p className="text-gray-600 mb-4">Has iniciado sesión correctamente.</p>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Información del usuario</h3>
            <p><span className="text-gray-500">Email:</span> {currentUser?.email}</p>
            <p><span className="text-gray-500">ID:</span> {currentUser?.uid}</p>
            <p>
              <span className="text-gray-500">Email verificado:</span> 
              {currentUser?.emailVerified ? 'Sí' : 'No'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => navigate('/purchases')}
              variant="outline"
            >
              View My Purchases
            </Button>
            
            <Button 
              onClick={handleLogout} 
              variant="destructive"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 