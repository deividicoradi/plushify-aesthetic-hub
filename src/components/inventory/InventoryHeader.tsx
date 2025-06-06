
import React from "react";
import { Package, Plus, History, Folder, BarChart, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatchActions } from "./BatchActions";
import { Product } from "@/hooks/useInventory";

type InventoryHeaderProps = {
  onAddProduct: () => void;
  onShowTransactionHistory: () => void;
  onManageCategories: () => void;
  onShowReports: () => void;
  onScanBarcode: () => void;
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  allProducts: Product[];
  fetchProducts: () => void;
};

export const InventoryHeader = ({ 
  onAddProduct, 
  onShowTransactionHistory, 
  onManageCategories,
  onShowReports,
  onScanBarcode,
  selectedProducts,
  setSelectedProducts,
  allProducts,
  fetchProducts
}: InventoryHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 mb-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-9 h-9 text-primary animate-float" />
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
            Estoque
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onScanBarcode} className="gap-2 border-border hover:bg-muted">
            <ScanBarcode className="w-4 h-4" />
            <span className="hidden sm:inline">Escanear</span>
          </Button>
          <Button variant="outline" onClick={onShowReports} className="gap-2 border-border hover:bg-muted">
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </Button>
          <Button variant="outline" onClick={onManageCategories} className="gap-2 border-border hover:bg-muted">
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">Categorias</span>
          </Button>
          <Button variant="outline" onClick={onShowTransactionHistory} className="gap-2 border-border hover:bg-muted">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
          <Button onClick={onAddProduct} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-muted-foreground text-sm">
          Gerencie seu inventário, adicione novos produtos, atualize o estoque e edite detalhes dos produtos existentes.
        </p>
        <BatchActions 
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onSuccess={fetchProducts}
          allProducts={allProducts}
        />
      </div>
    </div>
  );
};
