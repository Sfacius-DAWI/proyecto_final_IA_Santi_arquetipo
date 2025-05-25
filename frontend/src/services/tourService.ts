import { TourType, ReservationType } from '../types/tour';
import api from './api';
import { IMAGES } from '@/constants/images';

// Función auxiliar para mapear los datos del backend al formato del frontend
const mapTourData = (tourData: any): TourType => {
  console.log('Tour data recibida:', tourData);
  
  // Mapear el título a una imagen específica o usar una por defecto
  let image = IMAGES.tours.mountainAdventure; // imagen por defecto
  const title = tourData.titulo.toLowerCase();
  
  if (title.includes('mountain') || title.includes('montaña')) {
    image = IMAGES.tours.mountainAdventure;
  } else if (title.includes('city') || title.includes('ciudad')) {
    image = IMAGES.tours.historicCity;
  } else if (title.includes('nature') || title.includes('naturaleza')) {
    image = IMAGES.tours.natureTours;
  } else if (title.includes('sunset') || title.includes('atardecer')) {
    image = IMAGES.tours.sunsetExcursion;
  }

  // Crear galería de imágenes simulada si no existe
  const galleryImages = [image];
  for (let i = 0; i < 4; i++) {
    galleryImages.push(Object.values(IMAGES.tours)[Math.floor(Math.random() * Object.values(IMAGES.tours).length)]);
  }

  // Crear itinerario simulado si no existe
  const itinerary = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
    day: i + 1,
    title: `Día ${i + 1} - ${['Exploración', 'Aventura', 'Descubrimiento'][i % 3]}`,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies.',
    activities: [
      'Visita guiada a los principales puntos de interés',
      'Tiempo libre para explorar',
      'Comida típica en restaurante local'
    ],
    duration: '8 horas'
  }));

  // Obtener una imagen aleatoria para el guía
  const getRandomGuideImage = () => {
    const guideImages = Object.values(IMAGES.guides);
    return guideImages[Math.floor(Math.random() * guideImages.length)];
  };

  return {
    id: tourData.id,
    title: tourData.titulo,
    description: tourData.descripcion,
    price: tourData.precio,
    image: image,
    galleryImages: galleryImages,
    duration: `${tourData.duracion} minutos`,
    tag: tourData.etiqueta,
    tagType: tourData.tipoEtiqueta,
    rating: 4.5,
    reviewCount: 10,
    groupSize: "10-15",
    startDates: ["2024-05-01", "2024-06-01"],
    location: "Ubicación por definir",
    availableGuides: tourData.guias?.map((guia: any) => ({
      id: guia.id,
      name: `${guia.nombre} ${guia.apellido}`,
      photo: getRandomGuideImage(),
      specialization: "Tour especializado",
      languages: ["Español", "Inglés"],
      rating: 4.8
    })) || [],
    hasGuideOption: Boolean(tourData.guias?.length),
    priceWithoutGuide: tourData.precio * 0.8,
    itinerary: itinerary,
    difficulty: ['easy', 'moderate', 'difficult'][Math.floor(Math.random() * 3)] as 'easy' | 'moderate' | 'difficult',
    availableDates: Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i * 2);
      return {
        date: date.toISOString().split('T')[0],
        availableSpots: Math.floor(Math.random() * 10) + 5
      };
    })
  };
};

export const tourService = {
  async getAllTours(): Promise<TourType[]> {
    try {
      console.log('Haciendo petición a:', `${api.defaults.baseURL}/api/tours`);
      const { data } = await api.get('/api/tours');
      console.log('Respuesta completa:', data);
      return Array.isArray(data) ? data.map(mapTourData) : 
             data.tours ? data.tours.map(mapTourData) : [];
    } catch (error) {
      console.error('Error al obtener los tours:', error);
      throw error;
    }
  },

  async getTourById(id: string): Promise<TourType> {
    try {
      const { data } = await api.get(`/api/tours/${id}`);
      return mapTourData(data);
    } catch (error) {
      console.error('Error al obtener el tour:', error);
      throw error;
    }
  },

  async getFilteredTours(filter: string, sortBy?: string): Promise<TourType[]> {
    try {
      // En un entorno real, esta lógica estaría en el backend
      const allTours = await this.getAllTours();
      let filteredTours = allTours;
      
      // Aplicar filtros
      if (filter && filter !== 'all') {
        filteredTours = allTours.filter(tour => {
          const title = tour.title.toLowerCase();
          const description = (tour.description || '').toLowerCase();
          return title.includes(filter) || description.includes(filter);
        });
      }
      
      // Aplicar ordenamiento
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
      console.error('Error al filtrar tours:', error);
      throw error;
    }
  },

  async reserveTour(reservationData: Omit<ReservationType, 'id' | 'status'>): Promise<ReservationType> {
    try {
      // En un entorno real, esta lógica estaría en el backend
      const reservation: ReservationType = {
        ...reservationData,
        id: `r${Date.now()}`,
        status: 'pending',
        reservationDate: new Date().toISOString(),
      };
      
      // Simulamos una API call
      // const { data } = await api.post('/api/reservations', reservation);
      console.log('Reserva creada:', reservation);
      
      return reservation;
    } catch (error) {
      console.error('Error al reservar tour:', error);
      throw error;
    }
  },
  
  async getAvailableDates(tourId: string): Promise<{date: string, availableSpots: number}[]> {
    try {
      // Simulamos fechas disponibles
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
      console.error('Error al obtener fechas disponibles:', error);
      throw error;
    }
  }
}; 