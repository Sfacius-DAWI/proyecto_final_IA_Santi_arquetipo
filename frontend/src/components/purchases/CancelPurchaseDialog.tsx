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
      setError("Error cancelling booking");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your booking for {purchase.tour.titulo}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-md bg-destructive/10 p-4 mb-4">
            <p className="text-sm text-destructive font-medium">Important information:</p>
            <ul className="text-sm text-destructive mt-2 list-disc list-inside space-y-1">
              <li>This action cannot be undone</li>
              <li>You will receive a refund according to our cancellation policy</li>
              <li>The refund amount will be {formatCurrency(purchase.precioTotal * 0.8)}</li>
            </ul>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Back
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPurchaseDialog; 