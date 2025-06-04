import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Calendar, Users, CreditCard, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { purchaseService, PurchaseDetails as PurchaseDetailsType } from "@/services/purchaseService";
import { formatDate, formatCurrency } from "@/lib/utils";
import EditPurchaseDialog from "@/components/purchases/EditPurchaseDialog";
import CancelPurchaseDialog from "@/components/purchases/CancelPurchaseDialog";

interface PurchaseDetailsProps {
  purchaseId: string;
  onBack: () => void;
}

const PurchaseDetails = ({ purchaseId, onBack }: PurchaseDetailsProps) => {
  const [purchase, setPurchase] = useState<PurchaseDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        setLoading(true);
        const data = await purchaseService.getPurchaseById(purchaseId);
        setPurchase(data);
      } catch (err) {
        setError("Error loading purchase details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [purchaseId]);

  const handleEditSuccess = (updatedPurchase: PurchaseDetailsType) => {
    setPurchase(updatedPurchase);
    setShowEditDialog(false);
  };

  const handleCancelSuccess = (canceledPurchase: PurchaseDetailsType) => {
    setPurchase(canceledPurchase);
    setShowCancelDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PENDIENTE':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'FALLIDO':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'REEMBOLSADO':
        return <Badge className="bg-blue-500">Refunded</Badge>;
      case 'CANCELADO':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error || "Purchase not found"}</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const isPendingOrCompleted = ['PENDIENTE', 'COMPLETADO'].includes(purchase.estado);

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-playfair">
              {purchase.tour.titulo} Booking
            </CardTitle>
            <CardDescription>
              Reference: {purchase.id.substring(0, 8)}
            </CardDescription>
          </div>
          {getStatusBadge(purchase.estado)}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Booked Date</p>
                  <p>{formatDate(purchase.fechaReservada || purchase.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Number of People</p>
                  <p>{purchase.cantidad}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p>{purchase.metodoPago}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Tour Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Map className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Destination</p>
                  <p>{purchase.tour.destino}</p>
                </div>
              </div>
              
              {purchase.tour.fechaInicio && purchase.tour.fechaFin && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tour Period</p>
                    <p>{formatDate(purchase.tour.fechaInicio)} - {formatDate(purchase.tour.fechaFin)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Price per person:</span>
            <span>{formatCurrency(purchase.tour.precio)}</span>
          </div>
          <div className="flex justify-between">
            <span>Number of people:</span>
            <span>{purchase.cantidad}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(purchase.precioTotal)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="space-x-2">
          {isPendingOrCompleted && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => setShowEditDialog(true)}
              >
                Edit Booking
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Booking
              </Button>
            </>
          )}
        </div>
      </CardFooter>
      
      {showEditDialog && (
        <EditPurchaseDialog
          purchase={purchase}
          onClose={() => setShowEditDialog(false)}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {showCancelDialog && (
        <CancelPurchaseDialog
          purchase={purchase}
          onClose={() => setShowCancelDialog(false)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </Card>
  );
};

export default PurchaseDetails; 