
import React from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type InventoryHeaderProps = {
  onAddProduct: () => void;
};

export const InventoryHeader = ({ onAddProduct }: InventoryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-7">
      <div className="flex items-center gap-3">
        <Package className="w-9 h-9 text-pink-600 animate-float" />
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
          Estoque
        </h1>
      </div>
      <Button onClick={onAddProduct} className="gap-2 bg-pink-600 hover:bg-pink-700">
        <Plus className="w-4 h-4" />
        Novo Produto
      </Button>
    </div>
  );
};
