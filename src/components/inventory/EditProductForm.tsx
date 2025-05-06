
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string;
  min_stock: number;
};

type EditProductFormData = {
  name: string;
  category: string;
  minStock: number;
};

type EditProductFormProps = {
  product: Product;
  onSuccess: () => void;
};

export const EditProductForm = ({ product, onSuccess }: EditProductFormProps) => {
  const form = useForm<EditProductFormData>({
    defaultValues: {
      name: "",
      category: "",
      minStock: 0
    }
  });

  // Preencher o formulário com os dados do produto quando o componente é montado
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category,
        minStock: product.min_stock
      });
    }
  }, [product, form]);

  const onSubmit = async (data: EditProductFormData) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          category: data.category,
          min_stock: data.minStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success("Produto atualizado com sucesso!");
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao atualizar produto: " + error.message);
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

        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">Salvar Alterações</Button>
      </form>
    </Form>
  );
};
