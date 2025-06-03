import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  
  // Get redirect location if it exists
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error already handled in authentication context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      // Error already handled in authentication context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding flex flex-col items-center">
        <div className="w-full max-w-md">
          <h1 className="heading-lg text-center mb-8">Welcome back</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-primary hover:text-accent">
                  Forgot your password?
                </Link>
                <Link to="/purchases" className="text-sm text-primary hover:text-accent">
                  View Purchases
                </Link>
              </div>
              
              <div className="space-y-3">
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                >
                  Create a new account
                </Button>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:text-accent font-medium">
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
