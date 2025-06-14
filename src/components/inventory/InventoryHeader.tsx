
import React from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatchActions } from "./BatchActions";
import { Product } from "@/hooks/useInventory";

type InventoryHeaderProps = {
  onAddProduct: () => void;
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  allProducts: Product[];
  fetchProducts: () => void;
};

export const InventoryHeader = ({ 
  onAddProduct, 
  selectedProducts,
  setSelectedProducts,
  allProducts,
  fetchProducts
}: InventoryHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Estoque
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus produtos e controle o estoque
            </p>
          </div>
        </div>
        
        <Button onClick={onAddProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>
      
      {selectedProducts.length > 0 && (
        <div className="flex justify-end">
          <BatchActions 
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            onSuccess={fetchProducts}
            allProducts={allProducts}
          />
        </div>
      )}
    </div>
  );
};
