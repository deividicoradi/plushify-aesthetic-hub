
import React from "react";
import { StockAlerts } from "./StockAlerts";
import { StatCards } from "./StatCards";
import { ProductsTable } from "./ProductsTable";
import { Product } from "@/hooks/useInventory";

type InventoryContainerProps = {
  products: Product[];
  stats: {
    total: number;
    lowStock: number;
    categories: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onTransaction: (product: Product, type: 'entrada' | 'saida') => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  selectedProducts: Product[];
  onToggleSelect: (product: Product) => void;
  onSelectAll: () => void;
};

export const InventoryContainer = ({
  products,
  stats,
  searchTerm,
  setSearchTerm,
  onTransaction,
  onEditProduct,
  onDeleteProduct,
  selectedProducts,
  onToggleSelect,
  onSelectAll
}: InventoryContainerProps) => {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <StockAlerts 
          products={products}
          onTransaction={onTransaction}
        />
      </div>
      
      <div className="animate-fade-in delay-100">
        <StatCards {...stats} />
      </div>
      
      <div className="animate-fade-in delay-200">
        <ProductsTable 
          products={products}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onTransaction={onTransaction}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          selectedProducts={selectedProducts}
          onToggleSelect={onToggleSelect}
          onSelectAll={onSelectAll}
        />
      </div>
    </div>
  );
};
