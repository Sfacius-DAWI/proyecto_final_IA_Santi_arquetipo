import api from './api';
import { getAuth } from 'firebase/auth';

export interface TourInfo {
  id: string;
  titulo: string;
  destino: string;
  descripcion: string;
  precio: number;
  imagen: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PurchaseDetails {
  id: string;
  tourId: string;
  userId: string;
  cantidad: number;
  precioTotal: number;
  metodoPago: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO' | 'CANCELADO';
  fechaReservada: string;
  createdAt: string;
  updatedAt: string;
  tour: TourInfo;
}

export interface Purchase {
  id: string;
  tourId: string;
  cantidad: number;
  precioTotal: number;
  metodoPago: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO' | 'CANCELADO';
  fechaReservada?: string;
  createdAt: string;
  tour: {
    titulo: string;
  };
}

export interface PurchaseUpdateData {
  cantidad?: number;
  fechaReservada?: string;
}

export const purchaseService = {
  async getUserPurchases(): Promise<Purchase[]> {
    try {
    const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const { data } = await api.get('/api/purchases/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Error al obtener las compras:', error);
      throw error;
    }
  },

  async getPurchaseById(purchaseId: string): Promise<PurchaseDetails> {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const { data } = await api.get(`/api/purchases/${purchaseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Error al obtener los detalles de la compra:', error);
      throw error;
    }
  },

  async createPurchase(purchaseData: {
    tourId: string;
    cantidad: number;
    metodoPago: string;
    precioTotal: number;
  }): Promise<Purchase> {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const { data } = await api.post('/api/purchases', purchaseData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Error al crear la compra:', error);
      throw error;
    }
  },

  async updatePurchase(purchaseId: string, updateData: PurchaseUpdateData): Promise<PurchaseDetails> {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const { data } = await api.put(`/api/purchases/${purchaseId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Error al actualizar la compra:', error);
      throw error;
    }
  },

  async cancelPurchase(purchaseId: string): Promise<PurchaseDetails> {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const { data } = await api.post(`/api/purchases/${purchaseId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      throw error;
    }
  }
}; 