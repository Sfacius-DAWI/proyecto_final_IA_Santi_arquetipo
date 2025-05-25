export interface TourType {
  id: string;
  title: string;
  image: string;
  price: number;
  tag?: string;
  tagType?: 'limited' | 'new' | 'popular';
  description?: string;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  groupSize?: string;
  startDates?: string[];
  location?: string;
  features?: string[];
  availableGuides?: GuideInfo[];
  itinerary?: ItineraryItem[];
  hasGuideOption: boolean;
  priceWithoutGuide?: number;
  galleryImages?: string[];
  difficulty?: 'easy' | 'moderate' | 'difficult';
  availableDates?: {
    date: string;
    availableSpots: number;
  }[];
}

export interface GuideInfo {
  id: number;
  name: string;
  photo?: string;
  specialization?: string;
  languages?: string[];
  rating?: number;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  activities: string[];
  duration?: string;
}

export interface ReservationType {
  id?: string;
  tourId: string;
  userId?: string;
  reservationDate: string;
  tourDate: string;
  numberOfPeople: number;
  withGuide: boolean;
  guideId?: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  additionalRequests?: string;
  contactInformation?: ContactInformation;
  paymentInfo?: PaymentInformation;
}

export interface ContactInformation {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PaymentInformation {
  method: 'credit_card' | 'paypal' | 'transfer';
  transactionId?: string;
  paymentDate?: string;
} 