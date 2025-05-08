
import { useState, useCallback } from "react";
import { Product } from "./useProductsData";
import { toast } from "@/components/ui/sonner";

export const useProductSelection = (products: Product[]) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Validation helper to check if a product is valid
  const isValidProduct = useCallback((product: Product): boolean => {
    return !!product && typeof product === 'object' && 'id' in product && !!product.id;
  }, []);

  // Set selected product with validation
  const safeSetSelectedProduct = useCallback((product: Product | null) => {
    if (product !== null && !isValidProduct(product)) {
      console.error("Attempted to select an invalid product:", product);
      toast.error("Erro ao selecionar produto");
      return;
    }
    setSelectedProduct(product);
  }, [isValidProduct]);

  const toggleProductSelection = useCallback((product: Product) => {
    if (!isValidProduct(product)) {
      console.error("Attempted to toggle selection of an invalid product:", product);
      toast.error("Erro ao selecionar produto");
      return;
    }

    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, [isValidProduct]);

  const selectAllProducts = useCallback(() => {
    if (selectedProducts.length === products.length) {
      // Se todos estão selecionados, deseleciona todos
      setSelectedProducts([]);
    } else {
      // Caso contrário seleciona todos
      // Verifica se todos os produtos são válidos antes
      const validProducts = products.filter(isValidProduct);
      if (validProducts.length !== products.length) {
        console.warn("Some products are invalid and were filtered out during 'selectAll'");
      }
      setSelectedProducts(validProducts);
    }
  }, [selectedProducts.length, products, isValidProduct]);

  return {
    selectedProduct,
    selectedProducts,
    setSelectedProduct: safeSetSelectedProduct,
    setSelectedProducts,
    toggleProductSelection,
    selectAllProducts,
  };
};
