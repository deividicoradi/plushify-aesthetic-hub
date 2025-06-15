
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

  // Função para limpar duplicatas
  const cleanDuplicates = async () => {
    if (!user) return;

    try {
      console.log("=== LIMPANDO DUPLICATAS ===");
      
      // Buscar todos os produtos do usuário
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }); // Manter o mais antigo

      if (error) throw error;

      if (!allProducts || allProducts.length === 0) return;

      // Agrupar por nome (ignorando case)
      const groupedByName = allProducts.reduce((acc, product) => {
        const normalizedName = product.name.toLowerCase().trim();
        if (!acc[normalizedName]) {
          acc[normalizedName] = [];
        }
        acc[normalizedName].push(product);
        return acc;
      }, {} as Record<string, any[]>);

      // Identificar duplicatas
      const duplicateIds: string[] = [];
      Object.values(groupedByName).forEach(group => {
        if (group.length > 1) {
          // Manter o primeiro (mais antigo) e marcar os outros para exclusão
          const toDelete = group.slice(1);
          duplicateIds.push(...toDelete.map(p => p.id));
          console.log(`Duplicatas encontradas para "${group[0].name}":`, toDelete.map(p => p.id));
        }
      });

      if (duplicateIds.length > 0) {
        console.log("Removendo duplicatas:", duplicateIds);
        
        // Remover transações das duplicatas primeiro
        await supabase
          .from('inventory_transactions')
          .delete()
          .in('product_id', duplicateIds)
          .eq('user_id', user.id);

        // Remover as duplicatas
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', duplicateIds)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        console.log(`${duplicateIds.length} duplicatas removidas com sucesso`);
        toast.success(`${duplicateIds.length} produto(s) duplicado(s) removido(s)`);
      }
    } catch (error: any) {
      console.error("Erro ao limpar duplicatas:", error);
      toast.error("Erro ao limpar duplicatas: " + error.message);
    }
  };

  const refetch = async () => {
    if (!user) {
      console.log("Usuário não autenticado, limpando produtos");
      setProducts([]);
      setStats({ total: 0, lowStock: 0, categories: 0 });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("=== RECARREGANDO PRODUTOS ===");
      console.log("Usuário:", user.id);

      // Primeiro, limpar duplicatas
      await cleanDuplicates();
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error("Erro na consulta de produtos:", error);
        throw error;
      }

      console.log("Produtos carregados do banco:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Lista atualizada de produtos:", data.map(p => ({ id: p.id, name: p.name })));
      }
      
      const productsData = data || [];
      setProducts(productsData);
      setStats(calculateStats(productsData));
      
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos: " + error.message);
      setProducts([]);
      setStats({ total: 0, lowStock: 0, categories: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para remover produto da lista local (otimistic update IMEDIATO)
  const removeProductFromList = (productId: string) => {
    console.log("=== UPDATE OTIMÍSTICO IMEDIATO ===");
    console.log("Removendo produto da lista local:", productId);
    
    setProducts(prevProducts => {
      const filteredProducts = prevProducts.filter(p => p.id !== productId);
      console.log("Produtos após remoção otimística:", filteredProducts.length);
      console.log("IDs restantes:", filteredProducts.map(p => p.id));
      
      const newStats = calculateStats(filteredProducts);
      setStats(newStats);
      
      return filteredProducts;
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
