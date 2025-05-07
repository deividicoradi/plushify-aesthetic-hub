import React from "react";
import { StockAlerts } from "./StockAlerts";
import { StatCards } from "./StatCards";
import { ProductsTable } from "./ProductsTable";
import { BannerAside } from "./BannerAside";
import { InventoryReports } from "./InventoryReports";
import { TransactionHistory } from "./TransactionHistory";
import { CategoryManagement } from "./CategoryManagement";
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
  isHistoryOpen: boolean;
  isCategoriesOpen: boolean;
  isReportsOpen: boolean;
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
  isHistoryOpen,
  isCategoriesOpen,
  isReportsOpen,
  selectedProducts,
  onToggleSelect,
  onSelectAll
}: InventoryContainerProps) => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
      <main>
        {isHistoryOpen ? (
          <TransactionHistory />
        ) : isCategoriesOpen ? (
          <CategoryManagement />
        ) : isReportsOpen ? (
          <InventoryReports />
        ) : (
          <>
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
          </>
        )}
      </main>

      <aside className="hidden lg:block">
        <BannerAside />
      </aside>
    </div>
  );
};
