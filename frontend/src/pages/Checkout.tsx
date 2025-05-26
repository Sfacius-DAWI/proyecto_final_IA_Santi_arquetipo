
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
        toast.error("No hay reservas en el carrito");
        navigate('/cart');
        return;
      }
      setReservations(cartReservations);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error("Error al cargar las reservas");
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return reservations.reduce((total, reservation) => total + reservation.totalPrice, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
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
      // Crear compras para cada reserva
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
      
      // Limpiar el carrito después de la compra exitosa
      reservationService.clearCart();
      
      toast.success("¡Compra realizada exitosamente!");
      navigate("/purchases");
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      toast.error("Error al procesar la compra. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando información de pago...</p>
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
              <h2 className="heading-md mb-4">Resumen de Reservas</h2>
              <p className="text-gray-600 mb-6">
                Revisa tus reservas antes de proceder con el pago.
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
                            ? `Con guía: ${reservation.guideName || 'Por asignar'}`
                            : 'Sin guía'
                          }
                        </p>
                        <p className="text-xs text-gray-600">
                          Personas: {reservation.numberOfPeople}
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
                <h3 className="font-medium mb-3">Resumen del Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (10%):</span>
                    <span>{formatCurrency(calculateSubtotal() * 0.1)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(calculateSubtotal() * 1.1)}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Opciones de Pago</h3>
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
                    Tarjeta de Crédito
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
              <h2 className="heading-md mb-4">Detalles de Pago</h2>
              <p className="text-gray-600 mb-6">
                Completa tus datos de pago para finalizar la compra.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
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
                    Nombre Completo
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
                    Dirección
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
                    Ciudad
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
                    Código Postal
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
                        Número de Tarjeta
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
                          Fecha de Vencimiento
                        </label>
                        <input
                          id="expiry"
                          name="expiry"
                          type="text"
                          placeholder="MM/AA"
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
                  {isSubmitting ? "Procesando..." : "Finalizar Compra"}
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
