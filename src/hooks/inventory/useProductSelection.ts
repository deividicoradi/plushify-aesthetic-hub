import { useState } from "react";
import { Product } from "./useProductsData";

export const useProductSelection = (products: Product[]) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      // If all are selected, unselect all
      setSelectedProducts([]);
    } else {
      // Otherwise select all
      setSelectedProducts([...products]);
    }
  };

  return {
    selectedProduct,
    selectedProducts,
    setSelectedProduct,
    setSelectedProducts,
    toggleProductSelection,
    selectAllProducts,
  };
};
