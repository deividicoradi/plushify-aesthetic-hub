
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
    if (!user) {
      console.log("Usuário não autenticado, não carregando produtos");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Buscando produtos para usuário:", user.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error("Erro na consulta de produtos:", error);
        throw error;
      }

      console.log("Produtos encontrados:", data?.length || 0);
      console.log("Lista de produtos:", data?.map(p => ({ id: p.id, name: p.name })));
      
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
    console.log("Removendo produto da lista local:", productId);
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(p => p.id !== productId);
      console.log("Lista atualizada, produtos restantes:", updatedProducts.length);
      setStats(calculateStats(updatedProducts));
      return updatedProducts;
    });
  };

  // Função para adicionar produto à lista local
  const addProductToList = (newProduct: Product) => {
    console.log("Adicionando produto à lista local:", newProduct.name);
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts, newProduct];
      setStats(calculateStats(updatedProducts));
      return updatedProducts;
    });
  };

  // Função para atualizar produto na lista local
  const updateProductInList = (updatedProduct: Product) => {
    console.log("Atualizando produto na lista local:", updatedProduct.name);
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
