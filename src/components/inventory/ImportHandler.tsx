
import React, { useState } from "react";
import { Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/useInventory";
import { useAuth } from "@/contexts/AuthContext";

interface ImportHandlerProps {
  onSuccess: () => void;
  allProducts: Product[];
}

export const ImportHandler = ({ onSuccess, allProducts }: ImportHandlerProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();

  const handleImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.json';
    
    fileInput.onchange = async (e: any) => {
      try {
        setIsImporting(true);
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const result = event.target?.result as string;
            let products: Product[] = [];
            
            if (file.name.endsWith('.json')) {
              products = JSON.parse(result);
            } else if (file.name.endsWith('.csv')) {
              // Simple CSV parser - this could be improved
              const lines = result.split('\n');
              const headers = lines[0].split(',');
              
              for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',');
                const product: any = {};
                
                headers.forEach((header, index) => {
                  const value = values[index];
                  product[header.trim()] = value?.trim();
                });
                
                // Convert string numbers to actual numbers
                if (product.stock) product.stock = Number(product.stock);
                if (product.min_stock) product.min_stock = Number(product.min_stock);
                
                // Generate an ID if not present
                if (!product.id) product.id = crypto.randomUUID();
                
                products.push(product as Product);
              }
            }
            
            for (const product of products) {
              const { name, category, stock, min_stock } = product;
              
              // Check if product with same name already exists
              const existingProduct = allProducts.find(p => p.name === name);
              
              if (existingProduct) {
                // Update existing product
                const { error } = await supabase
                  .from('products')
                  .update({ category, stock, min_stock })
                  .eq('id', existingProduct.id);
                  
                if (error) throw error;
              } else {
                // Insert new product
                const { error } = await supabase
                  .from('products')
                  .insert({ 
                    name, 
                    category, 
                    stock, 
                    min_stock,
                    user_id: user?.id
                  });
                  
                if (error) throw error;
              }
            }
            
            toast.success(`Importados ${products.length} produtos com sucesso!`);
            onSuccess();
          } catch (error: any) {
            toast.error(`Erro ao processar arquivo: ${error.message}`);
          }
        };
        
        if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else {
          toast.error('Formato de arquivo não suportado. Use CSV ou JSON.');
        }
      } catch (error: any) {
        toast.error(`Erro ao importar: ${error.message}`);
      } finally {
        setIsImporting(false);
      }
    };
    
    fileInput.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Import className="w-4 h-4" />
          Importar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Importar produtos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleImport} disabled={isImporting}>
          Importar arquivo CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImport} disabled={isImporting}>
          Importar arquivo JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
