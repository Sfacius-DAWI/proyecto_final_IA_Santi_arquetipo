import { TourType, ReservationType } from '../types/tour';
import api from './api';
import { IMAGES } from '@/constants/images';

// Helper function to map backend data to frontend format
const mapTourData = (tourData: any): TourType => {
  console.log('Tour data received:', tourData);
  
  // Map title to a specific image
  let image = IMAGES.tours.historicCity; // default image
  const title = tourData.titulo.toLowerCase();
  
  if (title.includes('historic') || title.includes('city') || title.includes('walking')) {
    image = IMAGES.tours.historicCity;
  } else if (title.includes('cave') || title.includes('underground') || title.includes('nature')) {
    image = IMAGES.tours.natureCaves;
  } else if (title.includes('quad') || title.includes('adventure') || title.includes('snorkel')) {
    image = IMAGES.tours.quadAdventure;
  }

  // Create image gallery with the 3 available images
  const allTourImages = Object.values(IMAGES.tours);
  const galleryImages = [image];
  for (let i = 0; i < 4; i++) {
    galleryImages.push(allTourImages[Math.floor(Math.random() * allTourImages.length)]);
  }

  // Create specific itinerary based on tour type
  let itinerary;
  
  if (title.includes('quad') && title.includes('snorkel')) {
    // Specific itinerary for Quad Adventure & Snorkeling Experience
    itinerary = [{
      day: 1,
      title: "Quad Adventure & Snorkeling Experience - 5-Hour Adventure",
      description: "Experience the ultimate adventure combining off-road quad biking through rugged terrain with snorkeling in crystal-clear waters. Drive through scenic mountain paths, hidden valleys, and coastal routes before diving into pristine waters to explore underwater marine life.",
      activities: [
        "09:00 AM - Check-In & Safety Briefing: Meet your guide, sign waivers, and get the lowdown on quad controls and snorkeling signals",
        "09:30 AM - Gear Up & Warm-Up Loop: Strap in helmets and gloves, then cruise a gentle practice loop to get comfortable with your machine",
        "10:00 AM - Hidden Valley Charge: Kick up dust on a winding mountain path, weaving through oak groves and rocky outcrops—thrills guaranteed!",
        "10:45 AM - Coastal Trail Sprint: Transition to seaside terrain for stunning ocean views as you barrel toward a cliff-side overlook",
        "11:30 AM - Break & Beachside Snack: Refuel with fresh fruit and energy bars while soaking in the salt-air panorama",
        "11:50 AM - Snorkeling Brief & Swim: Don fins and mask, then slip beneath the waves to explore a colorful reef teeming with fish and marine critters",
        "12:50 PM - Wrap-Up & Photo Op: Regroup onshore for debrief, share your best quad-and-snorkel shots, and swap \"did-you-see\" stories",
        "01:00 PM - Farewell & Optional Refreshments: High-fives all around—stick around for a cold drink or head off to plan your next escapade"
      ],
      duration: "5 hours"
    }];
  } else if (title.includes('historic') || title.includes('city') || title.includes('walking')) {
    // Specific itinerary for Historic City Walking Tour
    itinerary = [{
      day: 1,
      title: "Historic City Walking Tour - Cultural Journey",
      description: "Step through centuries of history as you explore ancient Roman foundations, medieval streets, and architectural marvels. This walking tour combines historical insights with cultural discoveries in the heart of the historic city center.",
      activities: [
        "09:00 AM - Meet & Greet: Check in, gear up with a map, and get a quick safety & history briefing",
        "09:15 AM - Roman Foundations: Explore the forum ruins and imagine gladiators' footsteps beneath your soles",
        "10:00 AM - Medieval Maze: Wander narrow lanes past timbered houses and artisan workshops",
        "10:45 AM - Cathedral & Courtyards: Marvel at soaring vaults, then slip into a hidden cloister garden",
        "11:15 AM - Coffee Break: Pause for espresso or local pastries in a quaint plaza café",
        "11:30 AM - Jewish Quarter Secrets: Discover tucked-away synagogues and Mudejar details off the beaten path",
        "12:00 PM - Royal Palace Finale: Conclude at the grand palace gates—perfect for that \"I conquered history\" selfie",
        "12:15 PM - Farewell & Tips: Receive personalized recommendations for lunch spots and evening strolls"
      ],
      duration: "3.25 hours"
    }];
  } else if (title.includes('cave') || title.includes('underground') || title.includes('nature')) {
    // Specific itinerary for Underground Caves & Nature Experience
    itinerary = [{
      day: 1,
      title: "Underground Caves & Nature Experience - Natural Wonders Journey",
      description: "Discover the hidden underground world of spectacular limestone caves with stunning stalactite formations, underground lakes, and classical concerts. Combined with guided nature walks to observe local wildlife in their natural habitat.",
      activities: [
        "09:00 AM - Check-In & Safety Briefing: Pick up helmet/headlamp, life jacket, and meet your guide for a quick orientation",
        "09:20 AM - Cave Entrance & Geological Intro: Step inside the mouth of the cave and hear the origin story of these limestone marvels",
        "10:00 AM - Stalactite & Stalagmite Gallery: Wander past colossal formations, learn the drip-by-drip process that built them over millennia",
        "10:45 AM - Underground Lake & Classical Concert: Board the boat, drift into the amphitheater chamber, and let live strings echo through the tunnels",
        "11:30 AM - Surface Break & Refreshments: Step back into daylight for snacks and hot drinks in a riverside clearing",
        "11:45 AM - Guided Nature Walk: Follow forest trails to lookout points—keep an eye out for roe deer and songbirds",
        "12:30 PM - Wildlife Observation Stop: Pause at a hidden meadow to scan with binoculars and learn about local conservation efforts",
        "12:50 PM - Wrap-Up & Farewell: Return gear, swap highlights with your group, and collect personalized recommendations for more outdoor thrills",
        "01:00 PM - Tour Concludes: Leave with fresh stories—and maybe a few cave-dusted souvenirs (photos!)"
      ],
      duration: "4 hours"
    }];
  } else {
    // Create simulated itinerary for other tours
    itinerary = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} - ${['Exploration', 'Adventure', 'Discovery'][i % 3]}`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies.',
      activities: [
        'Guided visit to main points of interest',
        'Free time to explore',
        'Traditional meal at local restaurant'
      ],
      duration: '8 hours'
    }));
  }

  // Get a random image for the guide
  const getRandomGuideImage = () => {
    const guideImages = Object.values(IMAGES.guides).filter(img => img !== IMAGES.guides.hero);
    return guideImages[Math.floor(Math.random() * guideImages.length)];
  };

  // Create specific features based on tour type
  let features;
  let location;
  let groupSize;
  let difficulty;
  
  if (title.includes('quad') && title.includes('snorkel')) {
    // Specific features for Quad Adventure & Snorkeling Experience
    features = [
      "Professional quad bikes with safety equipment",
      "Full snorkeling gear (mask, fins, wetsuit)",
      "Experienced adventure guide",
      "Safety briefing and training session",
      "Fresh fruit and energy bars snack",
      "Photo opportunities and memories capture",
      "Insurance coverage included",
      "Small group size for personalized experience"
    ];
    location = "Costa Aventura, Mallorca";
    groupSize = "4-8 people";
    difficulty = "moderate" as const;
  } else if (title.includes('historic') || title.includes('city') || title.includes('walking')) {
    // Specific features for Historic City Walking Tour
    features = [
      "Expert history guide with local knowledge",
      "Detailed city map and historical timeline",
      "Access to hidden courtyards and gardens",
      "Coffee break in traditional plaza café",
      "Small group for intimate experience",
      "Photography tips and perfect selfie spots",
      "Personalized restaurant recommendations",
      "Walking through UNESCO heritage sites"
    ];
    location = "Historic City Center, Palma";
    groupSize = "6-12 people";
    difficulty = "easy" as const;
  } else if (title.includes('cave') || title.includes('underground') || title.includes('nature')) {
    // Specific features for Underground Caves & Nature Experience
    features = [
      "Professional safety equipment (helmet, headlamp, life jacket)",
      "Expert geological and nature guide",
      "Live classical music concert in underground amphitheater",
      "Boat ride through underground lake",
      "Wildlife observation with binoculars provided",
      "Hot drinks and snacks during surface break",
      "Educational insights on conservation efforts",
      "Access to restricted cave chambers"
    ];
    location = "Drach Caves Natural Park, Mallorca";
    groupSize = "8-15 people";
    difficulty = "easy" as const;
  } else {
    features = undefined;
    location = "Location to be defined";
    groupSize = "10-15";
    difficulty = ['easy', 'moderate', 'difficult'][Math.floor(Math.random() * 3)] as 'easy' | 'moderate' | 'difficult';
  }

  return {
    id: tourData.id,
    title: tourData.titulo,
    description: tourData.descripcion,
    price: tourData.precio,
    image: image,
    galleryImages: galleryImages,
    duration: `${tourData.duracion} minutes`,
    tag: tourData.etiqueta,
    tagType: tourData.tipoEtiqueta,
    rating: 4.5,
    reviewCount: 10,
    groupSize: groupSize,
    startDates: ["2024-05-01", "2024-06-01"],
    location: location,
    availableGuides: tourData.guias?.map((guiaRelation: any) => ({
      id: guiaRelation.guiaId || guiaRelation.id,
      name: `Guide ${guiaRelation.guiaId ? guiaRelation.guiaId.slice(0, 8) : 'Professional'}`,
      photo: getRandomGuideImage(),
      specialization: "Specialized tour",
      languages: ["Spanish", "English"],
      rating: 4.8
    })) || [],
    hasGuideOption: Boolean(tourData.guias?.length),
    priceWithoutGuide: tourData.precio * 0.8,
    itinerary: itinerary,
    difficulty: difficulty,
    availableDates: Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i * 2);
      return {
        date: date.toISOString().split('T')[0],
        availableSpots: Math.floor(Math.random() * 10) + 5
      };
    }),
    features: features
  };
};

export const tourService = {
  async getAllTours(): Promise<TourType[]> {
    try {
      console.log('Making request to:', `${api.defaults.baseURL}/api/tours`);
      const { data } = await api.get('/api/tours');
      console.log('Complete response:', data);
      return Array.isArray(data) ? data.map(mapTourData) : 
             data.tours ? data.tours.map(mapTourData) : [];
    } catch (error) {
      console.error('Error getting tours:', error);
      throw error;
    }
  },

  async getFeaturedTours(limit: number = 4): Promise<TourType[]> {
    try {
      console.log('🔄 Making request to featured tours:', `${api.defaults.baseURL}/api/tours/featured`);
      const { data } = await api.get(`/api/tours/featured?limit=${limit}`);
      console.log('📦 Featured tours received (raw):', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Is array?:', Array.isArray(data));
      
      if (!data) {
        console.warn('⚠️ No data received');
        return [];
      }
      
      const mappedTours = Array.isArray(data) ? data.map(mapTourData) : 
                         data.tours ? data.tours.map(mapTourData) : [];
      
      console.log('🎯 Mapped tours:', mappedTours);
      console.log('🎯 Number of mapped tours:', mappedTours.length);
      
      return mappedTours;
    } catch (error) {
      console.error('❌ Error getting featured tours:', error);
      throw error;
    }
  },

  async getTourById(id: string): Promise<TourType> {
    try {
      const { data } = await api.get(`/api/tours/${id}`);
      return mapTourData(data);
    } catch (error) {
      console.error('Error getting tour:', error);
      throw error;
    }
  },

  async getFilteredTours(filter: string, sortBy?: string): Promise<TourType[]> {
    try {
      // In a real environment, this logic would be in the backend
      const allTours = await this.getAllTours();
      let filteredTours = allTours;
      
      // Apply filters
      if (filter && filter !== 'all') {
        filteredTours = allTours.filter(tour => {
          const title = tour.title.toLowerCase();
          const description = (tour.description || '').toLowerCase();
          return title.includes(filter) || description.includes(filter);
        });
      }
      
      // Apply sorting
      if (sortBy) {
        filteredTours.sort((a, b) => {
          if (sortBy === 'price-low') return a.price - b.price;
          if (sortBy === 'price-high') return b.price - a.price;
          if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
          return 0;
        });
      }
      
      return filteredTours;
    } catch (error) {
      console.error('Error filtering tours:', error);
      throw error;
    }
  },

  async reserveTour(reservationData: Omit<ReservationType, 'id' | 'status'>): Promise<ReservationType> {
    try {
      // In a real environment, this logic would be in the backend
      const reservation: ReservationType = {
        ...reservationData,
        id: `r${Date.now()}`,
        status: 'pending',
        reservationDate: new Date().toISOString(),
      };
      
      // Simulate an API call
      // const { data } = await api.post('/api/reservations', reservation);
      console.log('Reservation created:', reservation);
      
      return reservation;
    } catch (error) {
      console.error('Error reserving tour:', error);
      throw error;
    }
  },
  
  async getAvailableDates(tourId: string): Promise<{date: string, availableSpots: number}[]> {
    try {
      // Simulate available dates
      const dates = [];
      const now = new Date();
      
      for (let i = 1; i <= 15; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        
        dates.push({
          date: date.toISOString().split('T')[0],
          availableSpots: Math.floor(Math.random() * 10) + 1
        });
      }
      
      return dates;
    } catch (error) {
      console.error('Error getting available dates:', error);
      throw error;
    }
  }
}; 