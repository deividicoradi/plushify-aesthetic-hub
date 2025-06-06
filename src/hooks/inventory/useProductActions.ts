import { useState } from "react";
import { Product } from "./useProductsData";
import { toast } from "@/components/ui/sonner";

export const useProductActions = (refetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleStockTransaction = (product: Product, type: 'entrada' | 'saida') => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    // Handle transaction logic here
    console.log("Stock transaction:", product, type);
  };
  
  const handleEditProduct = (product: Product) => {
    if (!product || !product.id) {
      toast.error("Produto inválido selecionado");
      return;
    }
    
    setSelectedProduct(product);
    // Handle edit product logic here
    console.log("Edit product:", product);
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
    handleStockTransaction,
    handleEditProduct,
    selectedProduct,
  };
};
