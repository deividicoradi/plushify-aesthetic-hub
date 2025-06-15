
import { useState } from "react";
import { Product } from "./useProductsData";
import { toast } from "@/components/ui/sonner";

export const useProductActions = (refetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStockTransaction = (product: Product, type: 'entrada' | 'saida') => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    // This will be handled by the parent component to open the transaction dialog
    console.log("Stock transaction:", product, type);
  };
  
  const handleEditProduct = (product: Product) => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    // This will be handled by the parent component to open the edit dialog
    console.log("Edit product:", product);
  };

  const handleDeleteProduct = (product: Product) => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const sanitizeSearchTerm = (term: string) => {
    return term.replace(/[<>]/g, '');
  };

  const setSecureSearchTerm = (term: string) => {
    setSearchTerm(sanitizeSearchTerm(term));
  };

  return {
    searchTerm,
    setSearchTerm: setSecureSearchTerm,
    handleStockTransaction,
    handleEditProduct,
    handleDeleteProduct,
    selectedProduct,
    setSelectedProduct,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  };
};
