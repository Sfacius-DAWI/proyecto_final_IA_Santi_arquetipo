import { useState } from "react";
import { Trash2, Calendar, Users, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CartReservation } from "@/services/reservationService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReservationCartItemProps {
  reservation: CartReservation;
  onRemove: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

const ReservationCartItem: React.FC<ReservationCartItemProps> = ({
  reservation,
  onRemove,
  onUpdateQuantity
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      onRemove(reservation.id);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Imagen del tour */}
          <div className="w-full md:w-32 h-32 flex-shrink-0">
            <img
              src={reservation.tourImage}
              alt={reservation.tourTitle}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Información del tour */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">
                {reservation.tourTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Detalles de la reserva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>Fecha: {formatDate(reservation.tourDate)}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>Personas: {reservation.numberOfPeople}</span>
              </div>
              
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                <span>
                  {reservation.withGuide 
                    ? `Con guía: ${reservation.guideName || 'Por asignar'}`
                    : 'Sin guía'
                  }
                </span>
              </div>

              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{reservation.contactInformation.fullName}</span>
              </div>
            </div>

            {/* Solicitudes adicionales */}
            {reservation.additionalRequests && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Solicitudes especiales: {reservation.additionalRequests}
                </Badge>
              </div>
            )}

            {/* Información de contacto */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Email: {reservation.contactInformation.email}</div>
              <div>Teléfono: {reservation.contactInformation.phone}</div>
            </div>
          </div>

          {/* Precio */}
          <div className="flex flex-col justify-between items-end">
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(reservation.totalPrice)}
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(reservation.totalPrice / reservation.numberOfPeople)} / persona
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCartItem; 