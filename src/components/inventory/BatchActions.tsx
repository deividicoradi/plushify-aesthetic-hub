
import React from "react";
import { Product } from "@/hooks/useInventory";
import { ImportHandler } from "./ImportHandler";
import { ExportHandler } from "./ExportHandler";
import { DeleteHandler } from "./DeleteHandler";

interface BatchActionsProps {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  onSuccess: () => void;
  allProducts: Product[];
}

export const BatchActions = ({ 
  selectedProducts, 
  setSelectedProducts, 
  onSuccess,
  allProducts
}: BatchActionsProps) => {
  const isAnySelected = selectedProducts.length > 0;

  return (
    <div className="flex space-x-2">
      <ImportHandler 
        onSuccess={onSuccess} 
        allProducts={allProducts} 
      />
      
      <ExportHandler 
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        allProducts={allProducts}
      />

      {isAnySelected && (
        <DeleteHandler
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};
