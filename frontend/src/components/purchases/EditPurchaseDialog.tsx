import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { purchaseService, PurchaseDetails, PurchaseUpdateData } from "@/services/purchaseService";

interface EditPurchaseDialogProps {
  purchase: PurchaseDetails;
  onClose: () => void;
  onSuccess: (updatedPurchase: PurchaseDetails) => void;
}

const EditPurchaseDialog = ({ purchase, onClose, onSuccess }: EditPurchaseDialogProps) => {
  const [cantidad, setCantidad] = useState<number>(purchase.cantidad);
  const [fechaReservada, setFechaReservada] = useState<Date | undefined>(
    purchase.fechaReservada ? new Date(purchase.fechaReservada) : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cantidad < 1) {
      setError("La cantidad debe ser al menos 1");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData: PurchaseUpdateData = { 
        cantidad 
      };
      
      if (fechaReservada) {
        updateData.fechaReservada = fechaReservada.toISOString();
      }
      
      const updatedPurchase = await purchaseService.updatePurchase(
        purchase.id, 
        updateData
      );
      
      onSuccess(updatedPurchase);
    } catch (err) {
      setError("Error al actualizar la reserva");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modificar Reserva</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cantidad">Número de Personas</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value))}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Fecha de Reserva</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={loading}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaReservada && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaReservada ? (
                    format(fechaReservada, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaReservada}
                  onSelect={setFechaReservada}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPurchaseDialog; 