import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { reservationService, CartReservation } from "../services/reservationService";
import { purchaseService } from "../services/purchaseService";
import { useAuth } from "../contexts/AuthContext";

interface FormData {
  email: string;
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: "credit-card" | "paypal";
  shippingMethod: "family-tour";
}

const initialFormData: FormData = {
  email: "",
  fullName: "",
  address: "",
  city: "",
  zipCode: "",
  paymentMethod: "credit-card",
  shippingMethod: "family-tour"
};

const Checkout = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservations, setReservations] = useState<CartReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    loadReservations();
  }, [currentUser, navigate]);

  const loadReservations = () => {
    try {
      const cartReservations = reservationService.getCartReservations();
      if (cartReservations.length === 0) {
        toast.error("No reservations in cart");
        navigate('/cart');
        return;
      }
      setReservations(cartReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error("Error loading reservations");
      navigate('/cart');
    } finally {
      setLoading(false);
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create purchases for each reservation
      const purchasePromises = reservations.map(async (reservation) => {
        const purchaseData = {
          tourId: reservation.tourId,
          cantidad: reservation.numberOfPeople,
          metodoPago: formData.paymentMethod === 'credit-card' ? 'TARJETA' : 'PAYPAL',
          precioTotal: reservation.totalPrice
        };
        
        return await purchaseService.createPurchase(purchaseData);
      });

      await Promise.all(purchasePromises);
      
      // Clear cart after successful purchase
      reservationService.clearCart();
      
      toast.success("Purchase completed successfully!");
      navigate("/purchases");
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error("Error processing purchase. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Items Overview */}
            <div className="md:w-1/3">
              <h2 className="heading-md mb-4">Reservation Summary</h2>
              <p className="text-gray-600 mb-6">
                Review your reservations before proceeding with payment.
              </p>
              
              <div className="space-y-4 mb-6">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="flex p-4">
                      <div className="w-1/3">
                        <img 
                          src={reservation.tourImage} 
                          alt={reservation.tourTitle} 
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                      <div className="w-2/3 pl-4">
                        <h3 className="font-medium text-sm">{reservation.tourTitle}</h3>
                        <p className="text-xs text-gray-600">
                          {reservation.withGuide 
                            ? `With guide: ${reservation.guideName || 'To be assigned'}`
                            : 'Without guide'
                          }
                        </p>
                        <p className="text-xs text-gray-600">
                          People: {reservation.numberOfPeople}
                        </p>
                        <p className="text-accent font-medium mt-2">
                          {formatCurrency(reservation.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (10%):</span>
                    <span>{formatCurrency(calculateSubtotal() * 0.1)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(calculateSubtotal() * 1.1)}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Payment Options</h3>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="border-b p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === "credit-card"}
                      onChange={handleRadioChange}
                      className="mr-2 h-4 w-4 text-primary"
                    />
                    Credit Card
                  </label>
                </div>
                <div className="p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === "paypal"}
                      onChange={handleRadioChange}
                      className="mr-2 h-4 w-4 text-primary"
                    />
                    PayPal
                  </label>
                </div>
              </div>
            </div>
            
            {/* Payment Details */}
            <div className="md:w-2/3">
              <h2 className="heading-md mb-4">Payment Details</h2>
              <p className="text-gray-600 mb-6">
                Complete your payment details to finalize the purchase.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                {formData.paymentMethod === "credit-card" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          id="expiry"
                          name="expiry"
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      
                      <div className="w-1/2">
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          name="cvv"
                          type="text"
                          placeholder="123"
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Complete Purchase"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
