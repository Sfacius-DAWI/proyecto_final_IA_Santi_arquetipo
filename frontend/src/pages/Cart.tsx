import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { reservationService, CartReservation } from "../services/reservationService";
import ReservationCartItem from "../components/ReservationCartItem";
import { useAuth } from "../contexts/AuthContext";

const Cart = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<CartReservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      loadReservations();
    } else {
      setReservations([]);
      setLoading(false);
    }
  }, [currentUser]);

  const loadReservations = () => {
    try {
      const cartReservations = reservationService.getCartReservations();
      setReservations(cartReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error("Error loading cart reservations");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveItem = (reservationId: string) => {
    try {
      reservationService.removeReservation(reservationId);
      setReservations(prev => prev.filter(item => item.id !== reservationId));
      toast.success("Reservation removed from cart");
    } catch (error) {
      toast.error("Error removing reservation");
    }
  };
  
  const handleClearCart = () => {
    try {
      reservationService.clearCart();
      setReservations([]);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Error clearing cart");
    }
  };
  
  const calculateSubtotal = () => {
    return reservations.reduce((total, reservation) => total + reservation.totalPrice, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        <Link to="/tours" className="flex items-center text-primary hover:text-accent mb-8">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Tours
        </Link>
        
        <h1 className="heading-lg mb-8">My Reservations</h1>
        
        {reservations.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Reservations List */}
            <div className="lg:w-2/3">
              <div className="space-y-4 mb-6">
                {reservations.map(reservation => (
                  <ReservationCartItem
                    key={reservation.id}
                    reservation={reservation}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              
              <div className="flex space-x-4">
                <Link to="/tours" className="btn-outline">
                  Continue Exploring
                </Link>
                <button className="btn-outline" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes (10%)</span>
                    <span>{formatCurrency(calculateSubtotal() * 0.1)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(calculateSubtotal() * 1.1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Number of tours:</span>
                    <span>{reservations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total people:</span>
                    <span>{reservations.reduce((total, r) => total + r.numberOfPeople, 0)}</span>
                  </div>
                </div>
                
                <Link to="/checkout" className="btn-primary w-full text-center">
                  Proceed to Payment
                </Link>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  You can review all details before confirming your purchase
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              It looks like you haven't added any tours to your cart yet.
              Start exploring our amazing tours to find your next adventure.
            </p>
            <Link to="/tours" className="btn-primary">
              Explore Tours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
