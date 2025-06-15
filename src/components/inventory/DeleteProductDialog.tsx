
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
      console.log("=== INICIANDO EXCLUSÃO ===");
      console.log("Produto:", product.id, product.name);
      
      // Buscar o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Erro ao obter usuário:", userError);
        throw new Error("Usuário não autenticado");
      }
      
      console.log("Usuário autenticado:", user.id);
      
      // Verificar se o produto pertence ao usuário
      const { data: productCheck, error: checkError } = await supabase
        .from('products')
        .select('id, name, user_id')
        .eq('id', product.id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !productCheck) {
        console.error("Produto não encontrado ou não pertence ao usuário:", checkError);
        throw new Error("Produto não encontrado ou você não tem permissão para excluí-lo");
      }
      
      console.log("Produto verificado:", productCheck);
      
      // Aplicar update otimístico
      if (onOptimisticDelete) {
        console.log("Aplicando update otimístico...");
        onOptimisticDelete(product.id);
      }
      
      // Excluir transações relacionadas primeiro
      console.log("Excluindo transações relacionadas...");
      const { error: transactionsError } = await supabase
        .from('inventory_transactions')
        .delete()
        .eq('product_id', product.id)
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error("Erro ao excluir transações:", transactionsError);
        // Não falhar se houver erro nas transações
      } else {
        console.log("Transações excluídas com sucesso");
      }

      // Excluir o produto
      console.log("Excluindo produto do banco...");
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("Erro na exclusão do produto:", deleteError);
        throw deleteError;
      }

      console.log("=== PRODUTO EXCLUÍDO COM SUCESSO ===");
      
      toast.success(`Produto "${product.name}" excluído com sucesso!`);
      
      // Fechar o dialog primeiro
      onOpenChange(false);
      
      // Aguardar um momento e recarregar a lista
      setTimeout(() => {
        console.log("Recarregando lista de produtos...");
        onSuccess();
      }, 500);
      
    } catch (error: any) {
      console.error("=== ERRO AO EXCLUIR PRODUTO ===", error);
      
      // Se houve erro, recarregar a lista para reverter o update otimístico
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
