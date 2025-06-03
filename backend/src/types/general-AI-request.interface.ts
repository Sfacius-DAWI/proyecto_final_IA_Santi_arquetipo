export interface ChatInterface {
  sessionId: string;
  prompt: string;
  userId?: string;
  timestamp?: string;
}

export interface ThreadOpenAI {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, any>;
}

export interface AIActionRequest {
  action: 'purchase' | 'cancel_purchase' | 'chat';
  data?: Partial<PurchaseActionData> | Partial<CancelActionData>;
}

export interface PurchaseActionData {
  tourId: string;
  cantidad: number;
  metodoPago: 'TARJETA' | 'PAYPAL' | 'TRANSFERENCIA';
  precioTotal: number;
  fechaReservada?: string;
}

export interface CancelActionData {
  purchaseId: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  value?: string | number;
  required: boolean;
  placeholder?: string;
  min?: number | string;
  max?: number;
  options?: { value: string; label: string }[];
}

export interface AIResponse {
  type: 'text' | 'action_result' | 'form';
  content: string;
  actionResult?: {
    success: boolean;
    data?: any;
    error?: string;
  };
  form?: {
    title: string;
    fields: FormField[];
    submitButton: {
      text: string;
      action: string;
    };
  };
  tokensUsage?: number;
  DOC?: string;
} 