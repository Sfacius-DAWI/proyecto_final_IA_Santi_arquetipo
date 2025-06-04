import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { purchaseService, Purchase } from "@/services/purchaseService";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Loader2, Search, EyeIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PurchaseHistoryProps {
  onSelectPurchase: (purchaseId: string) => void;
}

const PurchaseHistory = ({ onSelectPurchase }: PurchaseHistoryProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const data = await purchaseService.getUserPurchases();
        setPurchases(data);
        setFilteredPurchases(data);
      } catch (err) {
        setError("Error loading purchases");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  useEffect(() => {
    let result = purchases;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(purchase => 
        purchase.tour.titulo.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(purchase => purchase.estado === statusFilter);
    }
    
    setFilteredPurchases(result);
  }, [searchTerm, statusFilter, purchases]);

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

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair">Your Purchases</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tour name..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDIENTE">Pending</SelectItem>
                <SelectItem value="COMPLETADO">Completed</SelectItem>
                <SelectItem value="FALLIDO">Failed</SelectItem>
                <SelectItem value="REEMBOLSADO">Refunded</SelectItem>
                <SelectItem value="CANCELADO">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              {purchases.length === 0 
                ? "You haven't made any purchases yet" 
                : "No purchases found with the selected filters"}
            </p>
            {purchases.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                    <TableCell className="font-medium">{purchase.tour.titulo}</TableCell>
                    <TableCell>{purchase.cantidad}</TableCell>
                    <TableCell>{formatCurrency(purchase.precioTotal)}</TableCell>
                    <TableCell>{getStatusBadge(purchase.estado)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onSelectPurchase(purchase.id)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory; 