
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
      console.log("Iniciando exclusão do produto:", product.id, product.name);
      
      // Aplicar update otimístico imediatamente para feedback visual
      if (onOptimisticDelete) {
        onOptimisticDelete(product.id);
      }
      
      // Primeiro excluir transações de estoque relacionadas
      console.log("Excluindo transações relacionadas...");
      const { error: transactionsError } = await supabase
        .from('inventory_transactions')
        .delete()
        .eq('product_id', product.id);

      if (transactionsError) {
        console.error("Erro ao excluir transações:", transactionsError);
        // Não falhar se houver erro nas transações, continuar com a exclusão do produto
      } else {
        console.log("Transações excluídas com sucesso");
      }

      // Agora excluir o produto
      console.log("Excluindo produto...");
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id); // Garantir que só exclui produtos do usuário atual

      if (deleteError) {
        console.error("Erro na exclusão do produto:", deleteError);
        throw deleteError;
      }

      console.log("Produto excluído com sucesso do banco de dados");
      
      toast.success(`Produto "${product.name}" excluído com sucesso!`);
      
      // Fechar o dialog
      onOpenChange(false);
      
      // Recarregar a lista
      console.log("Recarregando lista de produtos...");
      onSuccess();
      
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      
      // Se houve erro, precisamos reverter o update otimístico
      // Para isso, vamos forçar um reload da lista
      onSuccess();
      
      toast.error(`Erro ao excluir produto: ${error.message || "Erro desconhecido"}`);
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
