
import React from "react";
import { StockAlerts } from "./StockAlerts";
import { StatCards } from "./StatCards";
import { ProductsTable } from "./ProductsTable";
import { BannerAside } from "./BannerAside";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
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
                selectedProducts={selectedProducts}
                onToggleSelect={onToggleSelect}
                onSelectAll={onSelectAll}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BannerAside />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
