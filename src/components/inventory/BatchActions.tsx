
import React from "react";
import { Product } from "@/hooks/useInventory";
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
  return (
    <div className="flex items-center gap-2">
      <ExportHandler 
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        allProducts={allProducts}
      />

      {selectedProducts.length > 0 && (
        <DeleteHandler
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};
