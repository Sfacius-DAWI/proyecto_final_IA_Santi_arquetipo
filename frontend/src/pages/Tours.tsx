import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PromoBanner from "../components/PromoBanner";
import TourCard from "../components/TourCard";
import { TourType } from "../types/tour";
import { tourService } from "../services/tourService";

const promoMessages = [
  "For free shipping on orders over $100 and more use code FREESHIPPINGYAY",
  "Explore the world with our curated routes! Use code EXPLORE20 for 20% off",
  "Book guided tours over $100 and get a free souvenir with code TOURISTDEAL"
];

type FilterType = "all" | "city" | "nature" | "adventure";

// Search terms mapping by category
const filterTerms = {
  city: ['city', 'ciudad', 'urbano', 'urban', 'histórico', 'historic'],
  nature: ['nature', 'naturaleza', 'natural', 'eco', 'parque', 'park'],
  adventure: ['adventure', 'aventura', 'montaña', 'mountain', 'extreme', 'extremo']
};

const Tours = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [tours, setTours] = useState<TourType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTours = async () => {
      try {
        console.log('Starting fetchTours...');
        setLoading(true);
        const data = await tourService.getAllTours();
        console.log('Tours received:', data);
        setTours(data);
        setError(null);
      } catch (err) {
        console.error('Error in fetchTours:', err);
        setError('Error loading tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Enhanced filtering logic
  const filteredTours = filter === "all" ? 
    tours : 
    tours.filter(tour => {
      const title = tour.title.toLowerCase();
      const description = (tour.description || '').toLowerCase();
      const searchTerms = filterTerms[filter];
      
      return searchTerms.some(term => 
        title.includes(term) || description.includes(term)
      );
    });

  console.log('Current state:', { 
    loading, 
    error, 
    toursLength: tours.length, 
    filteredToursLength: filteredTours.length,
    currentFilter: filter,
    tours,
    filteredTours 
  });

  return (
    <div className="min-h-screen">
      <PromoBanner messages={promoMessages} />
      
      {/* Tours Header */}
      <section className="bg-primary text-white py-12">
        <div className="container-custom">
          <h1 className="heading-xl text-white text-center">Explore Our Tours</h1>
          <p className="text-center max-w-2xl mx-auto mt-4 text-white/80">
            Discover our wide range of guided tours and adventures. From city explorations to natural wonders, 
            we have the perfect journey for every traveler.
          </p>
        </div>
      </section>
      
      {/* Filters */}
      <section className="bg-secondary">
        <div className="container-custom py-4">
          <div className="flex justify-center space-x-2">
            <button 
              onClick={() => setFilter("all")} 
              className={`px-4 py-2 rounded ${filter === "all" ? "bg-primary text-white" : "bg-white"}`}
            >
              All Tours
            </button>
            <button 
              onClick={() => setFilter("city")} 
              className={`px-4 py-2 rounded ${filter === "city" ? "bg-primary text-white" : "bg-white"}`}
            >
              City Tours
            </button>
            <button 
              onClick={() => setFilter("nature")} 
              className={`px-4 py-2 rounded ${filter === "nature" ? "bg-primary text-white" : "bg-white"}`}
            >
              Nature Tours
            </button>
            <button 
              onClick={() => setFilter("adventure")} 
              className={`px-4 py-2 rounded ${filter === "adventure" ? "bg-primary text-white" : "bg-white"}`}
            >
              Adventure Tours
            </button>
          </div>
        </div>
      </section>
      
      {/* Tours Listing */}
      <section className="container-custom section-padding">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl">Loading tours...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
        
        {!loading && !error && filteredTours.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No tours found</h3>
            <p className="text-gray-600">Please try a different filter or check back later for new tours.</p>
          </div>
        )}
      </section>
      
      {/* Call to Action */}
      <section className="bg-secondary">
        <div className="container-custom section-padding">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Looking for a Custom Tour?</h2>
              <p className="text-gray-600 mb-6">
                Can't find exactly what you're looking for? Contact us and our team will help you design a personalized tour experience.
              </p>
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tours;
