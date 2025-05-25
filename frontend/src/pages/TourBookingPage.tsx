import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { TourType } from "@/types/tour";
import { tourService } from "@/services/tourService";
import TourBooking from "@/components/TourBooking";
import PromoBanner from "@/components/PromoBanner";

const promoMessages = [
  "¡Reserva ahora y obtén un 10% de descuento con el código RESERVAHOY!",
  "Garantía de mejor precio en todos nuestros tours",
  "Cancelación gratuita hasta 48 horas antes del tour"
];

const TourBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del tour. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id, navigate]);
  
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
          <Link to={`/tour/${id}`} className="hover:text-primary">{tour.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Reservar</span>
        </div>
      </div>
      
      {/* Tour Booking */}
      <div className="container-custom py-8">
        <Link to={`/tour/${id}`} className="inline-flex items-center mb-6 text-primary hover:underline">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Volver a detalles del tour</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Reservar {tour.title}</h1>
                <TourBooking tour={tour} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumen del Tour</h2>
                
                <div className="mb-4">
                  <img 
                    src={tour.image} 
                    alt={tour.title} 
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{tour.title}</h3>
                    <p className="text-gray-600 text-sm">{tour.location}</p>
                  </div>
                  
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-medium">Precio desde:</span>
                    <span className="font-bold text-primary">${Math.min(tour.price, tour.priceWithoutGuide || tour.price)}</span>
                  </div>
                  
                  {tour.features && tour.features.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Incluye:</h4>
                      <ul className="text-sm space-y-1">
                        {tour.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                        {tour.features.length > 3 && (
                          <li className="text-primary italic">Y {tour.features.length - 3} beneficios más...</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 text-sm">
                    <p className="mb-2">
                      <span className="font-medium">Duración:</span> {tour.duration}
                    </p>
                    {tour.groupSize && (
                      <p className="mb-2">
                        <span className="font-medium">Tamaño del grupo:</span> {tour.groupSize}
                      </p>
                    )}
                    {tour.difficulty && (
                      <p>
                        <span className="font-medium">Dificultad:</span> {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourBookingPage;