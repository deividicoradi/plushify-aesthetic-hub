
import React from "react";
import { Package, Plus, History, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

type InventoryHeaderProps = {
  onAddProduct: () => void;
  onShowTransactionHistory: () => void;
  onManageCategories: () => void;
};

export const InventoryHeader = ({ 
  onAddProduct, 
  onShowTransactionHistory, 
  onManageCategories 
}: InventoryHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 mb-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-9 h-9 text-pink-600 animate-float" />
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
            Estoque
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onManageCategories} className="gap-2">
            <Folder className="w-4 h-4" />
            Categorias
          </Button>
          <Button variant="outline" onClick={onShowTransactionHistory} className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </Button>
          <Button onClick={onAddProduct} className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>
      </div>
      <p className="text-gray-500 text-sm">
        Gerencie seu inventário, adicione novos produtos, atualize o estoque e edite detalhes dos produtos existentes.
      </p>
    </div>
  );
};
