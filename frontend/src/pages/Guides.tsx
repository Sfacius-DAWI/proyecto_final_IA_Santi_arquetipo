import { useState } from "react";
import PromoBanner from "../components/PromoBanner";
import GuideCard, { GuideType } from "../components/GuideCard";
import { IMAGES } from "@/constants/images";

const promoMessages = [
  "Explore the best tourist routes with our expert guides!",
  "Book guided tours over $100 and get a free souvenir with code TOURISTDEAL",
  "For free shipping on orders over $100 and more use code FREESHIPPINGYAY"
];

const guidesData: GuideType[] = [
  {
    id: 1,
    name: "Bili Rodriguez",
    image: IMAGES.guides.bili,
    specialties: ["Nature Tours", "Mountain Hiking", "Wildlife"],
    description: "An experienced guide with over 10 years of leading nature tours. Bili specializes in mountain hikes and wildlife spotting, with extensive knowledge of local ecosystems.",
    isAvailable: true
  },
  {
    id: 2,
    name: "Maria Sanchez",
    image: IMAGES.guides.maria,
    specialties: ["City Tours", "Cultural Experiences", "History"],
    description: "Maria is our cultural expert with a background in art history. Her city tours offer unique insights into local architecture, art, and traditions.",
    isAvailable: true
  },
  {
    id: 3,
    name: "John Peterson",
    image: IMAGES.guides.john,
    specialties: ["Adventure Tours", "Coastal Explorations", "Photography"],
    description: "With a passion for adventure and photography, John leads our most exciting tours. He knows all the best spots for capturing breathtaking landscapes.",
    isAvailable: false
  },
  {
    id: 4,
    name: "Elena Kim",
    image: IMAGES.guides.elena,
    specialties: ["Food Tours", "Local Cuisine", "Culinary Traditions"],
    description: "Elena is our food and culinary expert. Her tours take you on a journey through local gastronomy, introducing you to authentic flavors and cooking traditions.",
    isAvailable: true
  },
  {
    id: 5,
    name: "Carlos Martinez",
    image: IMAGES.guides.carlos,
    specialties: ["Historical Sites", "Architecture", "Ancient Civilizations"],
    description: "With a PhD in history, Carlos brings historical sites to life with fascinating stories and detailed knowledge of ancient civilizations and architectural styles.",
    isAvailable: false
  },
  {
    id: 6,
    name: "Sophia Wong",
    image: IMAGES.guides.sophia,
    specialties: ["Nature Trails", "Botany", "Eco Tourism"],
    description: "Sophia specializes in eco-friendly tours, focusing on sustainable travel and botany. She knows all about local plant species and their traditional uses.",
    isAvailable: true
  }
];

type FilterType = "all" | "available" | "unavailable";

const Guides = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  
  const filteredGuides = filter === "all" 
    ? guidesData 
    : filter === "available" 
      ? guidesData.filter(guide => guide.isAvailable) 
      : guidesData.filter(guide => !guide.isAvailable);

  return (
    <div className="min-h-screen">
      <PromoBanner messages={promoMessages} />
      
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={IMAGES.guides.hero}
          alt="Our Travel Guides" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold font-playfair text-white mb-4">
              Our Travel Guides
            </h1>
            <p className="text-white/90 max-w-2xl text-lg">
              Meet our experienced guides who will lead you on unforgettable journeys. 
              Each guide brings unique expertise and passion to create memorable experiences.
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <section className="bg-secondary">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Filter</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setFilter("all")} 
                className={`px-4 py-2 rounded ${filter === "all" ? "bg-primary text-white" : "bg-white"}`}
              >
                All Guides
              </button>
              <button 
                onClick={() => setFilter("available")} 
                className={`px-4 py-2 rounded ${filter === "available" ? "bg-primary text-white" : "bg-white"}`}
              >
                Available
              </button>
              <button 
                onClick={() => setFilter("unavailable")} 
                className={`px-4 py-2 rounded ${filter === "unavailable" ? "bg-primary text-white" : "bg-white"}`}
              >
                Unavailable
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Guides Listing */}
      <section className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
        
        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No guides found</h3>
            <p className="text-gray-600">Please try a different filter or check back later.</p>
          </div>
        )}
      </section>
      
      {/* Become a Guide */}
      <section className="bg-secondary">
        <div className="container-custom section-padding">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Interested in Becoming a Guide?</h2>
              <p className="text-gray-600 mb-6">
                Are you passionate about travel and sharing your knowledge? Join our team of professional guides 
                and lead amazing tour experiences around the world.
              </p>
              <button className="btn-primary">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guides;
