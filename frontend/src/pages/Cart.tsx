
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import CartItem, { CartItemType } from "../components/CartItem";

// Example cart items (in a real app, this would come from context/state)
const initialCartItems: CartItemType[] = [
  {
    id: 3,
    title: "Nature Tours",
    image: "/lovable-uploads/7225d271-cdc0-4be2-bab9-f4c0c412f4b1.png",
    price: 31,
    quantity: 1,
    route: "Coastal Adventure",
    guide: "Bili"
  }
];

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>(initialCartItems);
  
  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };
  
  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        <Link to="/tours" className="flex items-center text-primary hover:text-accent mb-8">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back
        </Link>
        
        <h1 className="heading-lg mb-8">My Travel Plans</h1>
        
        {cartItems.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cart Items */}
            <div className="md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
              
              <div className="flex space-x-4">
                <Link to="/tours" className="btn-outline">
                  Continue Shopping
                </Link>
                <button className="btn-outline" onClick={() => setCartItems([])}>
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span>${(calculateSubtotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${(calculateSubtotal() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Additional options */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gift"
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="gift">Gift a route? Tick here to include a personalized message.</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="newsletter">Subscribe to our newsletter for exclusive travel deals?</label>
                  </div>
                </div>
                
                <Link to="/checkout" className="btn-primary w-full text-center">
                  Plan my trip
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any tours to your cart yet.
              Start exploring our amazing tours to find your next adventure.
            </p>
            <Link to="/tours" className="btn-primary">
              Browse Tours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
