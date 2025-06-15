
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package } from "lucide-react";

interface InventoryHeaderProps {
  onCreateProduct: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  onCreateProduct,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Controle de Produtos</h1>
        </div>
        <Button onClick={onCreateProduct} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
};
