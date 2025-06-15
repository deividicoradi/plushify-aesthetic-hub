
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  barcode?: string | null;
};

export type ProductStats = {
  total: number;
  lowStock: number;
  categories: number;
};

export const useProductsData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    lowStock: 0,
    categories: 0
  });
  const { user } = useAuth();

  const calculateStats = (data: Product[]) => {
    const uniqueCategories = new Set(data?.map(p => p.category));
    return {
      total: data?.length || 0,
      lowStock: data?.filter(p => p.stock <= p.min_stock).length || 0,
      categories: uniqueCategories.size
    };
  };

  const refetch = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log("Iniciando busca de produtos...");
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error("Erro na consulta:", error);
        throw error;
      }

      console.log("Produtos encontrados:", data?.length || 0);
      
      const productsData = data || [];
      setProducts(productsData);
      setStats(calculateStats(productsData));
      
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para remover produto da lista local (otimistic update)
  const removeProductFromList = (productId: string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(p => p.id !== productId);
      setStats(calculateStats(updatedProducts));
      return updatedProducts;
    });
  };

  // Função para adicionar produto à lista local
  const addProductToList = (newProduct: Product) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts, newProduct];
      setStats(calculateStats(updatedProducts));
      return updatedProducts;
    });
  };

  // Função para atualizar produto na lista local
  const updateProductInList = (updatedProduct: Product) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      );
      setStats(calculateStats(updatedProducts));
      return updatedProducts;
    });
  };

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user]);

  return {
    products,
    stats,
    isLoading,
    refetch,
    removeProductFromList,
    addProductToList,
    updateProductInList,
  };
};
