import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { purchaseService, PurchaseDetails } from "@/services/purchaseService";
import { formatCurrency } from "@/lib/utils";

interface CancelPurchaseDialogProps {
  purchase: PurchaseDetails;
  onClose: () => void;
  onSuccess: (canceledPurchase: PurchaseDetails) => void;
}

const CancelPurchaseDialog = ({ purchase, onClose, onSuccess }: CancelPurchaseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const canceledPurchase = await purchaseService.cancelPurchase(purchase.id);
      onSuccess(canceledPurchase);
    } catch (err) {
      setError("Error al cancelar la reserva");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Reserva</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas cancelar tu reserva de {purchase.tour.titulo}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-md bg-destructive/10 p-4 mb-4">
            <p className="text-sm text-destructive font-medium">Información importante:</p>
            <ul className="text-sm text-destructive mt-2 list-disc list-inside space-y-1">
              <li>Esta acción no se puede deshacer</li>
              <li>Recibirás un reembolso según nuestra política de cancelación</li>
              <li>El monto a reembolsar será de {formatCurrency(purchase.precioTotal * 0.8)}</li>
            </ul>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Volver
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPurchaseDialog; 