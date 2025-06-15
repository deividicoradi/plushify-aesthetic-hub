
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/inventory/useProductsData";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
  onOptimisticDelete?: (productId: string) => void;
}

export const DeleteProductDialog = ({
  open,
  onOpenChange,
  product,
  onSuccess,
  onOptimisticDelete
}: DeleteProductDialogProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!product) return;
    
    setIsDeleting(true);
    
    try {
      console.log("Tentando excluir produto:", product.id, product.name);
      
      // Primeiro verificar se o produto existe
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', product.id)
        .single();

      if (checkError) {
        console.error("Erro ao verificar produto:", checkError);
        throw new Error("Produto não encontrado");
      }

      console.log("Produto encontrado para exclusão:", existingProduct);

      // Excluir transações de estoque relacionadas primeiro
      const { error: transactionsError } = await supabase
        .from('inventory_transactions')
        .delete()
        .eq('product_id', product.id);

      if (transactionsError) {
        console.error("Erro ao excluir transações:", transactionsError);
        // Continuar mesmo se houver erro nas transações
      }

      // Agora excluir o produto
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (deleteError) {
        console.error("Erro na exclusão do produto:", deleteError);
        throw deleteError;
      }

      console.log("Produto excluído com sucesso do banco");
      
      // Aplicar update otimístico imediatamente
      if (onOptimisticDelete) {
        onOptimisticDelete(product.id);
      }
      
      toast.success("Produto excluído com sucesso!");
      
      // Fechar o dialog
      onOpenChange(false);
      
      // Recarregar a lista após um pequeno delay
      setTimeout(() => {
        console.log("Recarregando lista após exclusão");
        onSuccess();
      }, 100);
      
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o produto "{product?.name}"? 
            Esta ação não pode ser desfeita e removerá também todo o histórico de transações deste produto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
