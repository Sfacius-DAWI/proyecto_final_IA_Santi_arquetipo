
import { useState } from "react";
import { X } from "lucide-react";

export interface CartItemType {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
  route: string;
  guide: string;
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const { id, title, image, price, quantity, route, guide } = item;
  const [itemQuantity, setItemQuantity] = useState(quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setItemQuantity(newQuantity);
    onUpdateQuantity(id, newQuantity);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 border-b pb-4 mb-4">
      <div className="md:w-1/4 h-40 rounded-md overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="md:w-3/4 flex flex-col">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={() => onRemove(id)}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2">
          <p className="text-gray-700"><span className="font-medium">Route:</span> {route}</p>
          <p className="text-gray-700"><span className="font-medium">Guide:</span> {guide}</p>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleQuantityChange(itemQuantity - 1)}
              className="w-8 h-8 flex items-center justify-center border rounded-md"
            >
              -
            </button>
            <span className="w-8 text-center">{itemQuantity}</span>
            <button 
              onClick={() => handleQuantityChange(itemQuantity + 1)}
              className="w-8 h-8 flex items-center justify-center border rounded-md"
            >
              +
            </button>
          </div>
          <p className="font-medium text-accent">${price}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
