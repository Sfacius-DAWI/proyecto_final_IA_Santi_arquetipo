
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Order placed successfully!");
      setIsSubmitting(false);
      navigate("/");
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Items Overview */}
            <div className="md:w-1/3">
              <h2 className="heading-md mb-4">Items overview</h2>
              <p className="text-gray-600 mb-6">
                This is your order summary where you can edit and delete your order and select your preferred delivery type.
              </p>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
                <div className="flex border-b p-4">
                  <div className="w-1/3">
                    <img 
                      src="/lovable-uploads/7225d271-cdc0-4be2-bab9-f4c0c412f4b1.png" 
                      alt="Coastal Adventure" 
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                  <div className="w-2/3 pl-4">
                    <h3 className="font-medium">Route: Coastal Adventure</h3>
                    <p className="text-sm text-gray-600">Guide: Sin guía</p>
                    <p className="text-sm text-gray-600">Name of guide: Bili</p>
                    <p className="text-accent font-medium mt-2">$31</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Available Shipping Methods</h3>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
                <div className="border-b p-4 flex justify-between items-center">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="family-tour"
                      checked={formData.shippingMethod === "family-tour"}
                      onChange={handleRadioChange}
                      className="mr-2 h-4 w-4 text-primary"
                    />
                    Family tour
                  </label>
                  <span className="font-medium">Free</span>
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
                    Credit card
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
              <h2 className="heading-md mb-4">Payment details</h2>
              <p className="text-gray-600 mb-6">
                Fill in your payment details and complete the order.
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
                    Zip Code
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
                  {isSubmitting ? "Processing..." : "Finish purchase"}
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
