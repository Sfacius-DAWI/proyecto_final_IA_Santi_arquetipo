import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PromoBanner from "../components/PromoBanner";
import TourCard from "../components/TourCard";
import { TourType } from "../types/tour";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/constants/images";
import { tourService } from "../services/tourService";

const promoMessages = [
  "For free shipping on orders over $100 and more use code FREESHIPPINGYAY",
  "Explore the world with our curated routes! Use code EXPLORE20 for 20% off",
  "Book guided tours over $100 and get a free souvenir with code TOURISTDEAL"
];

const Home = () => {
  const [email, setEmail] = useState("");
  const [featuredTours, setFeaturedTours] = useState<TourType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        console.log('🚀 Starting featured tours loading...');
        setLoading(true);
        const tours = await tourService.getFeaturedTours(4);
        console.log('✅ Featured tours received in Home:', tours);
        console.log('📊 Number of tours:', tours.length);
        setFeaturedTours(tours);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading featured tours:', err);
        setError('Error loading featured tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed email:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      <PromoBanner messages={promoMessages} />
      
      {/* Hero Section */}
      <section className="bg-secondary relative">
        <div className="container-custom section-padding flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="heading-xl mb-4 text-primary">Discover Your Next Adventure</h1>
            <p className="text-gray-700 mb-6">
              Explore breathtaking destinations with our expertly guided tours. From mountain trails to historic cities, 
              we offer unique experiences for every type of traveler.
            </p>
            <div className="flex space-x-4">
              <Link to="/tours" className="btn-primary">
                Browse Tours
              </Link>
              <Link to="/guides" className="btn-outline">
                Meet Our Guides
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src={IMAGES.tours.natureCaves}
                alt="Nature Tours" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl font-semibold mb-2">Nature Tours</h3>
                <p className="text-white/90 mb-3">Experience the beauty of untouched landscapes</p>
                <Link to="/tour/2" className="inline-block text-white font-medium underline">
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Tours Section */}
      <section className="container-custom section-padding">
        <div className="flex justify-between items-center mb-8">
          <h2 className="heading-md">Featured Tours</h2>
          <Link to="/tours" className="text-accent hover:text-accent/80 flex items-center">
            View all tours <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl">Loading featured tours...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
        
        {!loading && !error && featuredTours.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No featured tours available</h3>
            <p className="text-gray-600">Come back later to see our featured tours.</p>
          </div>
        )}
      </section>
      
      {/* Why Choose Us Section */}
      <section className="bg-secondary">
        <div className="container-custom section-padding">
          <h2 className="heading-md text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Curated Routes</h3>
              <p className="text-gray-600">Our travel experts carefully select each route to offer you the best experience.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Expert Guides</h3>
              <p className="text-gray-600">Experienced local guides who know all the hidden gems and cultural details.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a4 4 0 118 0v7M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">All-Inclusive Packages</h3>
              <p className="text-gray-600">Everything you need is included - no hidden costs or unexpected expenses.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="container-custom section-padding">
        <div className="bg-primary rounded-lg p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Stay Updated with Our Latest Tours</h2>
            <p className="text-white/80 mb-6">
              Subscribe to our newsletter for exclusive deals, travel tips, and new tour announcements.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-grow px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
              <button type="submit" className="bg-accent hover:bg-accent/90 px-6 py-2 rounded-md font-medium">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
