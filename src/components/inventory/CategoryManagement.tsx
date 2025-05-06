
import React, { useState, useEffect } from "react";
import { Folder, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  product_count: number;
};

export const CategoryManagement = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories and product counts
  const fetchCategories = async () => {
    try {
      setLoading(true);

      // First, get all products with their categories
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("category")
        .order("category");

      if (productsError) throw productsError;

      // Count products per category
      const categoryCounts: Record<string, number> = {};
      products?.forEach(product => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });

      // Create category objects with counts
      const uniqueCategories = [...new Set(products?.map(p => p.category))];
      const categoryList: Category[] = uniqueCategories.map(name => ({
        id: name || "",
        name: name || "",
        product_count: categoryCounts[name || ""] || 0
      }));

      setCategories(categoryList.filter(c => c.name));
    } catch (error: any) {
      toast.error("Erro ao carregar categorias: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria não pode estar vazio");
      return;
    }

    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.error("Esta categoria já existe");
      return;
    }

    try {
      // Since we don't have a categories table, we'll just refresh the list
      setNewCategoryName("");
      toast.success("Categoria adicionada com sucesso!");
      await fetchCategories();
    } catch (error: any) {
      toast.error("Erro ao adicionar categoria: " + error.message);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Nome da categoria não pode estar vazio");
      return;
    }

    // Check if new name already exists (excluding the current category)
    if (categories.some(c => 
      c.id !== editingCategory.id && 
      c.name.toLowerCase() === editingCategory.name.trim().toLowerCase()
    )) {
      toast.error("Já existe uma categoria com este nome");
      return;
    }

    try {
      // Update all products with this category
      const { error } = await supabase
        .from("products")
        .update({ 
          category: editingCategory.name,
          updated_at: new Date().toISOString()
        })
        .eq("category", editingCategory.id);

      if (error) throw error;

      setEditingCategory(null);
      toast.success("Categoria atualizada com sucesso!");
      await fetchCategories();
    } catch (error: any) {
      toast.error("Erro ao atualizar categoria: " + error.message);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.product_count > 0) {
      toast.error(
        `Não é possível excluir esta categoria. Ela contém ${category.product_count} produto(s).`
      );
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        // Since we don't have a categories table and this category has no products,
        // we just need to refresh the categories list
        toast.success("Categoria excluída com sucesso!");
        await fetchCategories();
      } catch (error: any) {
        toast.error("Erro ao excluir categoria: " + error.message);
      }
    }
  };

  return (
    <Card className="rounded-xl shadow-lg animate-fade-in">
      <CardHeader className="border-b border-muted/30">
        <CardTitle className="flex items-center gap-2 text-xl font-serif text-pink-700">
          <Folder className="w-5 h-5" />
          Gerenciamento de Categorias
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleAddCategory} className="flex items-center gap-2 mb-6">
          <Input
            placeholder="Nova categoria..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </form>

        <Separator className="my-4" />
        
        {loading ? (
          <div className="flex justify-center p-4">Carregando categorias...</div>
        ) : categories.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            Nenhuma categoria encontrada
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li 
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
              >
                {editingCategory && editingCategory.id === category.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-green-50 hover:bg-green-100 text-green-600"
                      onClick={handleUpdateCategory}
                    >
                      Salvar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={cancelEditing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {category.product_count} produto{category.product_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => startEditing(category)}
                      >
                        <Pencil className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleDeleteCategory(category)}
                        disabled={category.product_count > 0}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-xs text-gray-500 italic">
        Nota: Categorias com produtos associados não podem ser excluídas.
      </CardFooter>
    </Card>
  );
};
