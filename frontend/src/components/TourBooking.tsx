import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourType, ReservationType } from "@/types/tour";
import { tourService } from "@/services/tourService";
import { reservationService, ReservationCreateData } from "@/services/reservationService";
import { useAuth } from "@/contexts/AuthContext";

interface TourBookingProps {
  tour: TourType;
}

const TourBooking: React.FC<TourBookingProps> = ({ tour }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [withGuide, setWithGuide] = useState(true);
  const [selectedGuideId, setSelectedGuideId] = useState<number | undefined>(
    tour.availableGuides && tour.availableGuides.length > 0 ? tour.availableGuides[0].id : undefined
  );
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [contactInfo, setContactInfo] = useState({
    fullName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
  });
  const [availableDates, setAvailableDates] = useState<{date: string, availableSpots: number}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const dates = await tourService.getAvailableDates(tour.id);
        setAvailableDates(dates);
      } catch (error) {
        toast.error("Error al cargar fechas disponibles");
      }
    };

    fetchAvailableDates();
  }, [tour.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "numberOfPeople") {
      const num = parseInt(value);
      if (num > 0 && num <= 20) {
        setNumberOfPeople(num);
      }
    } else if (name === "additionalRequests") {
      setAdditionalRequests(value);
    } else {
      setContactInfo({
        ...contactInfo,
        [name]: value,
      });
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = withGuide ? tour.price : (tour.priceWithoutGuide || tour.price * 0.8);
    return basePrice * numberOfPeople;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha para el tour");
      return;
    }
    
    if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
      toast.error("Por favor completa todos los campos de contacto");
      return;
    }
    
    try {
      setLoading(true);
      
      // Obtener el nombre del guía seleccionado
      const selectedGuide = withGuide && selectedGuideId 
        ? tour.availableGuides?.find(guide => guide.id === selectedGuideId)
        : undefined;
      
      const reservationData: ReservationCreateData = {
        tourId: tour.id,
        tourDate: format(selectedDate, 'yyyy-MM-dd'),
        numberOfPeople,
        withGuide,
        guideId: withGuide ? selectedGuideId : undefined,
        totalPrice: calculateTotalPrice(),
        additionalRequests,
        contactInformation: {
          fullName: contactInfo.fullName,
          email: contactInfo.email,
          phone: contactInfo.phone,
        },
      };
      
      const reservation = await reservationService.createReservation(
        reservationData,
        tour.title,
        tour.image,
        selectedGuide?.name
      );
      
      toast.success("¡Reserva agregada al carrito!");
      navigate("/cart");
    } catch (error) {
      toast.error("Error al crear la reserva");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const disabledDates = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = availableDates.some(d => 
      d.date === dateStr && d.availableSpots >= numberOfPeople
    );
    return !isAvailable;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reservar este tour</CardTitle>
        <CardDescription>Completa los detalles para reservar tu experiencia</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tourDate">Fecha del tour</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDates}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                Solo se muestran fechas con disponibilidad
              </p>
            </div>

            <div>
              <Label htmlFor="numberOfPeople">Número de personas</Label>
              <Input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                min={1}
                max={20}
                value={numberOfPeople}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Opciones de guía</Label>
              <RadioGroup
                value={withGuide ? "con-guia" : "sin-guia"}
                onValueChange={(val) => setWithGuide(val === "con-guia")}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="con-guia" id="con-guia" />
                  <Label htmlFor="con-guia" className="cursor-pointer">
                    Con guía turístico (${tour.price} por persona)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sin-guia" id="sin-guia" />
                  <Label htmlFor="sin-guia" className="cursor-pointer">
                    Sin guía (${tour.priceWithoutGuide || Math.floor(tour.price * 0.8)} por persona)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {withGuide && tour.availableGuides && tour.availableGuides.length > 0 && (
              <div>
                <Label htmlFor="guideSelect">Selecciona un guía</Label>
                <select
                  id="guideSelect"
                  className="w-full p-2 border rounded-md mt-1"
                  value={selectedGuideId}
                  onChange={(e) => setSelectedGuideId(Number(e.target.value))}
                >
                  {tour.availableGuides.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.name} {guide.languages ? `(${guide.languages.join(", ")})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={contactInfo.fullName}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={contactInfo.email}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono de contacto</Label>
              <Input
                id="phone"
                name="phone"
                value={contactInfo.phone}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="additionalRequests">Solicitudes adicionales</Label>
              <Textarea
                id="additionalRequests"
                name="additionalRequests"
                value={additionalRequests}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Dieta especial, necesidades de accesibilidad, etc."
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${tour.price * numberOfPeople}</span>
            </div>
            {!withGuide && (
              <div className="flex justify-between text-green-600">
                <span>Descuento (sin guía):</span>
                <span>-${(tour.price - (tour.priceWithoutGuide || tour.price * 0.8)) * numberOfPeople}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${calculateTotalPrice()}</span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !selectedDate}
          className="w-full sm:w-auto"
        >
          {loading ? "Procesando..." : "Confirmar reserva"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TourBooking; 