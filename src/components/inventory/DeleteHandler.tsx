
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/useInventory";

interface DeleteHandlerProps {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  onSuccess: () => void;
}

export const DeleteHandler = ({ 
  selectedProducts, 
  setSelectedProducts, 
  onSuccess 
}: DeleteHandlerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Nenhum produto selecionado');
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produtos?`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const productIds = selectedProducts.map(p => p.id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);
      
      if (error) throw error;
      
      toast.success(`${selectedProducts.length} produtos excluídos com sucesso!`);
      setSelectedProducts([]);
      onSuccess();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      className="gap-2" 
      onClick={handleDeleteSelected}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
      Excluir ({selectedProducts.length})
    </Button>
  );
};
