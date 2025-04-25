
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ProductFormData = {
  name: string;
  category: string;
  minStock: number;
};

export const ProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      category: "",
      minStock: 0
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category: data.category,
          min_stock: data.minStock,
          user_id: user?.id
        });

      if (error) throw error;

      toast.success("Produto adicionado com sucesso!");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao adicionar produto: " + error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Esmalte Rosa" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Esmaltes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estoque Mínimo</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Adicionar Produto</Button>
      </form>
    </Form>
  );
};
