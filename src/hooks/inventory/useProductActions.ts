
import { useState } from "react";
import { Product } from "./useProductsData";

export const useProductActions = (
  setSelectedProduct: (product: Product | null) => void,
  setIsTransactionOpen: (isOpen: boolean) => void,
  setTransactionType: (type: 'entrada' | 'saida') => void,
  setIsEditProductOpen: (isOpen: boolean) => void
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleTransaction = (product: Product, type: 'entrada' | 'saida') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    handleTransaction,
    handleEditProduct,
  };
};
