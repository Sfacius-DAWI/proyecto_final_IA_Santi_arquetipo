import { ReservationType } from '../types/tour';
import api from './api';
import { getAuth } from 'firebase/auth';

export interface ReservationCreateData {
  tourId: string;
  tourDate: string;
  numberOfPeople: number;
  withGuide: boolean;
  guideId?: number;
  totalPrice: number;
  additionalRequests?: string;
  contactInformation: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface CartReservation {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  tourDate: string;
  numberOfPeople: number;
  withGuide: boolean;
  guideName?: string;
  totalPrice: number;
  additionalRequests?: string;
  contactInformation: {
    fullName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

class ReservationService {
  private reservations: Map<string, CartReservation> = new Map();

  async createReservation(data: ReservationCreateData, tourTitle: string, tourImage: string, guideName?: string): Promise<CartReservation> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const reservation: CartReservation = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tourId: data.tourId,
        tourTitle,
        tourImage,
        tourDate: data.tourDate,
        numberOfPeople: data.numberOfPeople,
        withGuide: data.withGuide,
        guideName,
        totalPrice: data.totalPrice,
        additionalRequests: data.additionalRequests,
        contactInformation: data.contactInformation,
        createdAt: new Date().toISOString()
      };

      // Guardar en localStorage para persistencia temporal
      this.reservations.set(reservation.id, reservation);
      this.saveToLocalStorage();

      console.log('Reserva temporal creada:', reservation);
      return reservation;
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      throw error;
    }
  }

  getCartReservations(): CartReservation[] {
    this.loadFromLocalStorage();
    return Array.from(this.reservations.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  removeReservation(reservationId: string): void {
    this.reservations.delete(reservationId);
    this.saveToLocalStorage();
  }

  updateReservation(reservationId: string, updates: Partial<CartReservation>): CartReservation | null {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return null;

    const updatedReservation = { ...reservation, ...updates };
    this.reservations.set(reservationId, updatedReservation);
    this.saveToLocalStorage();
    
    return updatedReservation;
  }

  clearCart(): void {
    this.reservations.clear();
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const key = `cart_reservations_${user.uid}`;
        const data = Array.from(this.reservations.entries());
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const key = `cart_reservations_${user.uid}`;
        const data = localStorage.getItem(key);
        if (data) {
          const entries = JSON.parse(data);
          this.reservations = new Map(entries);
        }
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
      this.reservations.clear();
    }
  }
}

export const reservationService = new ReservationService(); 