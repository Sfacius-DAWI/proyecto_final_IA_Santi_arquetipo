import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import api from '../services/api';

interface FormField {
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

interface DynamicFormProps {
  title: string;
  fields: FormField[];
  submitButton: {
    text: string;
    action: string;
  };
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  fields,
  submitButton,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.value || '';
    });
    return initialData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const missingFields = fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos requeridos',
        description: `Por favor completa: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Enviar los datos al backend
      if (submitButton.action === 'submit_booking') {
        const response = await api.post('/api/ai/booking', {
          tourName: formData.tourName,
          userEmail: formData.email,
          userName: formData.fullName,
          phoneNumber: formData.phone,
          numberOfPeople: parseInt(formData.numberOfPeople),
          preferredDate: formData.preferredDate,
          paymentMethod: formData.paymentMethod,
          specialRequests: formData.specialRequests || ''
        });

        if (response.data.success) {
          toast({
            title: '¡Reserva confirmada!',
            description: response.data.message || 'Te hemos enviado un correo con los detalles de tu reserva.',
          });
          
          if (onSubmit) {
            onSubmit({ ...formData, bookingId: response.data.bookingId });
          }
        } else {
          throw new Error(response.data.error || 'Error al procesar la reserva');
        }
      }
    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'No se pudo procesar tu reserva. Por favor intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={formData[field.name]}
            onValueChange={(value) => handleChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Selecciona ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );
      
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              submitButton.text
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 