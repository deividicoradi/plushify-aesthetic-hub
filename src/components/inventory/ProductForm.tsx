
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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
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
          .eq('user_id', user?.id)
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
    
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  const onSubmit = async (data: ProductFormData) => {
    if (isSubmitting || hasSubmitted) {
      console.log("Form already being submitted or has been submitted, ignoring duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const finalCategory = customCategory || data.category;
      
      if (!finalCategory) {
        toast.error("Por favor, selecione ou digite uma categoria");
        return;
      }

      console.log("=== CRIANDO PRODUTO ===");
      console.log("Dados:", { name: data.name, category: finalCategory, minStock: data.minStock, userId: user.id });

      // Verificar se já existe um produto com o mesmo nome para este usuário
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('name', data.name.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Erro ao verificar produto existente:", checkError);
        throw checkError;
      }

      if (existingProduct) {
        console.log("Produto já existe:", existingProduct);
        toast.error(`Já existe um produto com o nome "${data.name}"`);
        return;
      }

      // Inserir o produto
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: data.name.trim(),
          category: finalCategory.trim(),
          min_stock: data.minStock,
          user_id: user.id,
          stock: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erro ao inserir produto:", insertError);
        throw insertError;
      }

      console.log("Produto criado com sucesso:", newProduct);
      toast.success("Produto adicionado com sucesso!");
      
      // Reset form
      form.reset();
      setCustomCategory("");
      
      // Call success callback
      onSuccess();
      
    } catch (error: any) {
      console.error("=== ERRO AO CRIAR PRODUTO ===", error);
      toast.error("Erro ao adicionar produto: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
      // Reset hasSubmitted after a delay to allow form reuse
      setTimeout(() => setHasSubmitted(false), 2000);
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
            rules={{ 
              required: "Nome do produto é obrigatório",
              minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
            }}
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
                    onChange={(e) => field.onChange(e.target.value.trim())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            rules={{ required: !customCategory ? "Categoria é obrigatória" : false }}
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
                        setCustomCategory(e.target.value.trim());
                        if (e.target.value.trim()) {
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
              disabled={isSubmitting || hasSubmitted}
            >
              {isSubmitting ? "Adicionando..." : hasSubmitted ? "Adicionado!" : "Adicionar Produto"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
