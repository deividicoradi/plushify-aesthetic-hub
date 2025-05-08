
import { useState } from "react";
import { Product } from "./useProductsData";
import { toast } from "@/components/ui/sonner";

export const useProductActions = (
  setSelectedProduct: (product: Product | null) => void,
  setIsTransactionOpen: (isOpen: boolean) => void,
  setTransactionType: (type: 'entrada' | 'saida') => void,
  setIsEditProductOpen: (isOpen: boolean) => void
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleTransaction = (product: Product, type: 'entrada' | 'saida') => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  const sanitizeSearchTerm = (term: string) => {
    // Remove caracteres potencialmente perigosos
    return term.replace(/[<>]/g, '');
  };

  const setSecureSearchTerm = (term: string) => {
    setSearchTerm(sanitizeSearchTerm(term));
  };

  return {
    searchTerm,
    setSearchTerm: setSecureSearchTerm,
    handleTransaction,
    handleEditProduct,
  };
};
