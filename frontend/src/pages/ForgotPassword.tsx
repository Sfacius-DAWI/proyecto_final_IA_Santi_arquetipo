import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      await resetPassword(email);
      setMessage("Se ha enviado un correo para restablecer tu contraseña");
    } catch (error) {
      // Error ya manejado en el contexto de autenticación
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding flex flex-col items-center">
        <div className="w-full max-w-md">
          <h1 className="heading-lg text-center mb-8">Recuperar contraseña</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            {message ? (
              <div className="text-center">
                <p className="text-green-500 mb-4">{message}</p>
                <Link to="/login" className="text-primary hover:text-accent font-medium">
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button type="submit" className="w-full btn-primary" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar correo de recuperación"}
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-600">
                  <Link to="/login" className="text-primary hover:text-accent font-medium">
                    Volver a iniciar sesión
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 