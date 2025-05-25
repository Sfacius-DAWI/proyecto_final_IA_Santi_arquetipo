import { Link } from "react-router-dom";
import { ShoppingCart, Search, UserRound, LogOut, User, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="bg-primary text-white py-2 text-center text-sm md:text-base">
        <p>Explore the best tourist routes with our expert guides!</p>
      </div>
      
      <div className="container-custom py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary italic">
            Adventure<span className="block -mt-1">Tours</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/tours" className="text-primary hover:text-accent font-medium">
            Tours
          </Link>
          <Link to="/guides" className="text-primary hover:text-accent font-medium">
            Guides
          </Link>
          <Link to="/about" className="text-primary hover:text-accent font-medium">
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0" aria-label="User menu">
                  <UserRound className="w-5 h-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases" className="flex items-center cursor-pointer">
                    <Package className="w-4 h-4 mr-2" />
                    <span>Mis compras</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Iniciar sesión</Button>
              </Link>
              <Link to="/register" className="hidden md:block">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
          
          <Link to="/cart">
            <ShoppingCart className="w-6 h-6 text-primary" />
          </Link>
          
          <div className="hidden md:flex items-center relative">
            <input 
              type="text" 
              placeholder="Search tours"
              className="border border-gray-300 rounded-md pl-3 pr-10 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="w-5 h-5 absolute right-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="md:hidden border-t border-gray-200">
        <div className="container-custom py-2 flex justify-around">
          <Link to="/tours" className="text-primary text-sm">Tours</Link>
          <Link to="/guides" className="text-primary text-sm">Guides</Link>
          <Link to="/about" className="text-primary text-sm">About</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
