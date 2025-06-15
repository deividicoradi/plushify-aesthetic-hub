
import { useState, useMemo } from "react";
import { Product } from "./useProductsData";

export const useProductSelection = (products: Product[]) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const toggleSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts([...products]);
    }
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return {
    selectedProducts,
    setSelectedProducts,
    toggleSelect,
    selectAll,
    clearSelection,
  };
};
