
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
import { Package, Tag, Archive } from "lucide-react";

type ProductFormData = {
  name: string;
  category: string;
  minStock: number;
};

export const ProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      category: "",
      minStock: 5
    }
  });

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
    if (isSubmitting) {
      console.log("Form already being submitted, ignoring duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalCategory = customCategory || data.category;
      
      if (!finalCategory) {
        toast.error("Por favor, selecione ou digite uma categoria");
        return;
      }

      console.log("Submitting product:", { name: data.name, category: finalCategory, minStock: data.minStock });

      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category: finalCategory,
          min_stock: data.minStock,
          user_id: user?.id
        });

      if (error) throw error;

      console.log("Product created successfully");
      toast.success("Produto adicionado com sucesso!");
      form.reset();
      setCustomCategory("");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error("Erro ao adicionar produto: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Novo Produto</h3>
          <p className="text-sm text-muted-foreground">Adicione um novo produto ao seu estoque</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Nome do produto é obrigatório" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Nome do Produto
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Ex: Esmalte Rosa"
                    className="h-11"
                    disabled={isSubmitting}
                  />
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
                <FormLabel className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoria
                </FormLabel>
                <div className="space-y-3">
                  <Select
                    value={customCategory ? "" : field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCustomCategory("");
                    }}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
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
                  
                  <div className="relative">
                    <Input
                      placeholder="Ou digite uma nova categoria"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        if (e.target.value) {
                          field.onChange("");
                        }
                      }}
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            rules={{ 
              required: "Estoque mínimo é obrigatório",
              min: { value: 0, message: "Valor deve ser maior ou igual a 0" }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Estoque Mínimo
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    className="h-11"
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Você será alertado quando o estoque estiver abaixo deste valor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-11 font-medium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Produto"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
