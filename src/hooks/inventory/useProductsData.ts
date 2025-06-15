
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  category?: string;
  brand?: string;
  barcode?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductFormData = {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  category?: string;
  brand?: string;
  barcode?: string;
  active: boolean;
};

export const useProductsData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate key')) {
        toast.error('Produto com este nome ou SKU já existe');
      } else {
        toast.error('Erro ao criar produto: ' + error.message);
      }
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { data: result, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate key')) {
        toast.error('Produto com este nome ou SKU já existe');
      } else {
        toast.error('Erro ao atualizar produto: ' + error.message);
      }
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir produto: ' + error.message);
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
};
