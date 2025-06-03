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
import { enUS } from "date-fns/locale";
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
        toast.error("Error loading available dates");
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
      toast.error("Please select a date for the tour");
      return;
    }
    
    if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
      toast.error("Please complete all contact fields");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the selected guide's name
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
      
      toast.success("Reservation added to cart!");
      navigate("/cart");
    } catch (error) {
      toast.error("Error creating reservation");
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
        <CardTitle>Book this tour</CardTitle>
        <CardDescription>Complete the details to book your experience</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tourDate">Tour date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: enUS })
                    ) : (
                      <span>Select date</span>
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
                    locale={enUS}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                Only dates with availability are shown
              </p>
            </div>

            <div>
              <Label htmlFor="numberOfPeople">Number of people</Label>
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
              <Label>Guide options</Label>
              <RadioGroup
                value={withGuide ? "with-guide" : "without-guide"}
                onValueChange={(val) => setWithGuide(val === "with-guide")}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with-guide" id="with-guide" />
                  <Label htmlFor="with-guide" className="cursor-pointer">
                    With tour guide (${tour.price} per person)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="without-guide" id="without-guide" />
                  <Label htmlFor="without-guide" className="cursor-pointer">
                    Without guide (${tour.priceWithoutGuide || Math.floor(tour.price * 0.8)} per person)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {withGuide && tour.availableGuides && tour.availableGuides.length > 0 && (
              <div>
                <Label htmlFor="guideSelect">Select a guide</Label>
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
              <Label htmlFor="fullName">Full name</Label>
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
              <Label htmlFor="email">Email address</Label>
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
              <Label htmlFor="phone">Contact phone</Label>
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
              <Label htmlFor="additionalRequests">Additional requests</Label>
              <Textarea
                id="additionalRequests"
                name="additionalRequests"
                value={additionalRequests}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Special diet, accessibility needs, etc."
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
                <span>Discount (without guide):</span>
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
          {loading ? "Processing..." : "Confirm booking"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TourBooking; 