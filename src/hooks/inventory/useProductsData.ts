
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
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    lowStock: 0,
    categories: 0
  });
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
      
      const uniqueCategories = new Set(data?.map(p => p.category));
      setStats({
        total: data?.length || 0,
        lowStock: data?.filter(p => p.stock <= p.min_stock).length || 0,
        categories: uniqueCategories.size
      });
    } catch (error: any) {
      toast.error("Erro ao carregar produtos: " + error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  return {
    products,
    stats,
    fetchProducts,
  };
};
