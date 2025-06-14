
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
  selectedProducts,
  onToggleSelect,
  onSelectAll
}: InventoryContainerProps) => {
  return (
    <div className="space-y-6">
      <StockAlerts 
        products={products}
        onTransaction={onTransaction}
      />
      
      <StatCards {...stats} />
      
      <ProductsTable 
        products={products}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onTransaction={onTransaction}
        onEditProduct={onEditProduct}
        selectedProducts={selectedProducts}
        onToggleSelect={onToggleSelect}
        onSelectAll={onSelectAll}
      />
    </div>
  );
};
