import { useState } from "react";
import { ItineraryItem } from "@/types/tour";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, Footprints } from "lucide-react";

interface TourItineraryProps {
  itinerary: ItineraryItem[];
}

const TourItinerary: React.FC<TourItineraryProps> = ({ itinerary }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(itinerary.length > 0 ? `day-${itinerary[0].day}` : null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Itinerario del Tour</h2>
      <p className="text-gray-600">
        Descubre día a día las actividades que realizarás durante este tour. Cada día está diseñado para brindarte una experiencia inolvidable.
      </p>

      <Accordion 
        type="single" 
        collapsible 
        value={expandedDay || undefined}
        onValueChange={(val) => setExpandedDay(val)}
        className="border rounded-lg overflow-hidden"
      >
        {itinerary.map((day) => (
          <AccordionItem key={day.day} value={`day-${day.day}`} className="border-b last:border-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-primary font-medium">
              <div className="flex items-center">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  {day.day}
                </div>
                <span>{day.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="space-y-4">
                <p className="text-gray-600">{day.description}</p>

                {day.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Duración: {day.duration}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Actividades:</h4>
                  <ul className="space-y-2">
                    {day.activities.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <Footprints className="w-4 h-4 text-primary mt-1 mr-2" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {itinerary.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No hay información de itinerario disponible para este tour.</p>
        </div>
      )}
    </div>
  );
};

export default TourItinerary; 