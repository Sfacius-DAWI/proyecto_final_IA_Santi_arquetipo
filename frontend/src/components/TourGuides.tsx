import { GuideInfo } from "@/types/tour";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, Star, User } from "lucide-react";

interface TourGuidesProps {
  guides: GuideInfo[];
  onSelectGuide?: (guideId: number) => void;
  selectedGuideId?: number;
}

const TourGuides: React.FC<TourGuidesProps> = ({ 
  guides, 
  onSelectGuide,
  selectedGuideId 
}) => {
  if (!guides || guides.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay guías disponibles para este tour</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Guías Disponibles</h2>
        <p className="text-sm text-gray-500">{guides.length} guías</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <Card 
            key={guide.id} 
            className={`overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
              selectedGuideId === guide.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectGuide && onSelectGuide(guide.id)}
          >
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-1/3">
                  <img 
                    src={guide.photo || "https://via.placeholder.com/150"} 
                    alt={guide.name} 
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h3 className="font-medium text-lg">{guide.name}</h3>
                  
                  {guide.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm">{guide.rating} / 5</span>
                    </div>
                  )}
                  
                  {guide.specialization && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{guide.specialization}</span>
                    </div>
                  )}
                  
                  {guide.languages && guide.languages.length > 0 && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Languages className="h-4 w-4 mr-2" />
                      <span>{guide.languages.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TourGuides; 