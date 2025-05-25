import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Users, Calendar, Map, Zap, Award } from "lucide-react";
import PromoBanner from "../components/PromoBanner";
import TourCard from "../components/TourCard";
import { TourType } from "../types/tour";
import { tourService } from "../services/tourService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TourGallery from "@/components/TourGallery";
import TourItinerary from "@/components/TourItinerary";
import TourGuides from "@/components/TourGuides";
import TourBooking from "@/components/TourBooking";

const promoMessages = [
  "Book guided tours over $100 and get a free souvenir with code TOURISTDEAL",
  "For free shipping on orders over $100 and more use code FREESHIPPINGYAY",
  "Explore the world with our curated routes! Use code EXPLORE20 for 20% off"
];

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<number>(0);
  const [similarTours, setSimilarTours] = useState<TourType[]>([]);
  const [activeTab, setActiveTab] = useState("descripcion");
  
  useEffect(() => {
    const fetchTourDetails = async () => {
      if (!id) {
        navigate('/tours');
        return;
      }

      try {
        setLoading(true);
        const tourData = await tourService.getTourById(id);
        setTour(tourData);
        setSelectedGuide(tourData.availableGuides?.[0]?.id || 0);
        
        // Fetch similar tours
        const allTours = await tourService.getAllTours();
        const filtered = allTours
          .filter(t => t.id !== id)
          .slice(0, 4);
        setSimilarTours(filtered);
        
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del tour. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id, navigate]);
  
  const handleSelectGuide = (guideId: number) => {
    setSelectedGuide(guideId);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando detalles del tour...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Tour no encontrado'}</p>
          <Link to="/tours" className="text-primary hover:underline">
            Volver a todos los tours
          </Link>
        </div>
      </div>
    );
  }
  
  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'difficult': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen">
      <PromoBanner messages={promoMessages} />
      
      {/* Breadcrumbs */}
      <div className="container-custom py-4">
        <div className="flex items-center text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tours" className="hover:text-primary">Tours</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">{tour.title}</span>
        </div>
      </div>
      
      {/* Tour Gallery and Info */}
      <div className="bg-secondary py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gallery - 2/3 width on desktop */}
            <div className="lg:col-span-2">
              <TourGallery 
                images={tour.galleryImages || [tour.image]} 
                title={tour.title} 
              />
            </div>
            
            {/* Tour Info - 1/3 width on desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{tour.title}</h1>
                
                {tour.rating && (
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        className={`w-4 h-4 ${index < (tour.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{tour.reviewCount} Reviews</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tour.tag && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {tour.tag}
                    </span>
                  )}
                  {tour.difficulty && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {tour.duration && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Duración</p>
                        <p className="font-medium">{tour.duration}</p>
                      </div>
                    </div>
                  )}
                  
                  {tour.groupSize && (
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Tamaño del grupo</p>
                        <p className="font-medium">{tour.groupSize}</p>
                      </div>
                    </div>
                  )}
                  
                  {tour.startDates && tour.startDates.length > 0 && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Próximas fechas</p>
                        <p className="font-medium">{tour.startDates.slice(0, 1).join(", ")}</p>
                      </div>
                    </div>
                  )}
                  
                  {tour.location && (
                    <div className="flex items-center">
                      <Map className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Ubicación</p>
                        <p className="font-medium">{tour.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-b py-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-2xl font-bold text-primary">${tour.price}</span>
                      <span className="text-gray-600"> / persona</span>
                    </div>
                    
                    {tour.hasGuideOption && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Sin guía desde</p>
                        <p className="font-medium">${tour.priceWithoutGuide || Math.floor(tour.price * 0.8)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/tour/${id}/book`} className="w-full">
                      <button className="w-full btn-primary">
                        Reservar ahora
                      </button>
                    </Link>
                  </div>
                </div>
                
                {tour.features && tour.features.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Lo que incluye:</h3>
                    <ul className="space-y-2">
                      {tour.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Zap className="w-4 h-4 text-green-500 mt-1 mr-2" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tour Content Tabs */}
      <div className="container-custom py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="descripcion">Descripción</TabsTrigger>
            <TabsTrigger value="itinerario">Itinerario</TabsTrigger>
            <TabsTrigger value="guias">Guías</TabsTrigger>
            <TabsTrigger value="reservar">Reservar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="descripcion" className="mt-0">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Sobre este tour</h2>
                <p className="text-gray-600 whitespace-pre-line">{tour.description}</p>
              </div>
              
              {tour.availableDates && tour.availableDates.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Fechas disponibles</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {tour.availableDates.slice(0, 10).map((dateInfo, index) => (
                      <div key={index} className="border rounded-md p-2 text-center">
                        <p className="font-medium">{dateInfo.date}</p>
                        <p className="text-sm text-gray-600">{dateInfo.availableSpots} plazas</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="itinerario" className="mt-0">
            <TourItinerary itinerary={tour.itinerary || []} />
          </TabsContent>
          
          <TabsContent value="guias" className="mt-0">
            <TourGuides 
              guides={tour.availableGuides || []} 
              onSelectGuide={handleSelectGuide}
              selectedGuideId={selectedGuide}
            />
          </TabsContent>
          
          <TabsContent value="reservar" className="mt-0">
            <TourBooking tour={tour} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Similar Tours */}
      {similarTours.length > 0 && (
        <div className="bg-secondary py-12">
          <div className="container-custom">
            <h2 className="heading-md text-center mb-8">Tours similares que te pueden interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarTours.map(tour => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetails;
