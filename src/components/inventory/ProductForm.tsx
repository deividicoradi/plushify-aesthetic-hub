
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Archive } from "lucide-react";

type ProductFormData = {
  name: string;
  category: string;
  minStock: number;
  barcode: string;
};

export const ProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      category: "",
      minStock: 5,
      barcode: ""
    }
  });

  // Check for pending barcode from scanner
  useEffect(() => {
    const pendingBarcode = sessionStorage.getItem('pendingBarcode');
    if (pendingBarcode) {
      form.setValue('barcode', pendingBarcode);
      sessionStorage.removeItem('pendingBarcode');
    }
  }, [form]);

  // Fetch all existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .order('category');
        
        if (error) throw error;
        
        // Get unique categories
        const uniqueCategories = [...new Set(data?.map(p => p.category))]
          .filter(Boolean) as string[];
        
        setCategories(uniqueCategories);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category: data.category,
          min_stock: data.minStock,
          barcode: data.barcode || null,
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
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 7891234567890" />
              </FormControl>
              <FormDescription>
                Opcional. Pode ser escaneado utilizando a câmera do dispositivo.
              </FormDescription>
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
              <div className="flex gap-2">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Ou digite uma nova"
                  onChange={(e) => {
                    if (e.target.value) {
                      field.onChange(e.target.value);
                    }
                  }}
                  className="w-1/2"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-1">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span>Estoque Mínimo</span>
                </div>
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" min="0" />
              </FormControl>
              <FormDescription>
                Você será alertado quando o estoque estiver abaixo deste valor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Adicionar Produto</Button>
      </form>
    </Form>
  );
};
