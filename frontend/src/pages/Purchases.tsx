import { useState } from "react";
import PurchaseHistory from "@/components/purchases/PurchaseHistory";
import PurchaseDetails from "@/components/purchases/PurchaseDetails";

const Purchases = () => {
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const handleSelectPurchase = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
  };

  const handleBack = () => {
    setSelectedPurchaseId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        {selectedPurchaseId ? (
          <PurchaseDetails 
            purchaseId={selectedPurchaseId} 
            onBack={handleBack} 
          />
        ) : (
          <PurchaseHistory onSelectPurchase={handleSelectPurchase} />
        )}
      </div>
    </div>
  );
};

export default Purchases;
