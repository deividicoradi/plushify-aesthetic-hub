
import React, { useState } from "react";
import { Upload, FileJson, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/hooks/inventory/useProductsData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ImportHandlerProps {
  onSuccess: () => void;
  allProducts: Product[];
}

export const ImportHandler: React.FC<ImportHandlerProps> = ({ onSuccess, allProducts }) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'csv' | 'json' | null>(null);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Read file content
      const text = await file.text();
      let products: any[] = [];
      
      // Parse based on file type
      if (importMethod === 'csv') {
        products = parseCSV(text);
      } else if (importMethod === 'json') {
        products = JSON.parse(text);
      }
      
      // Process and validate products
      const validProducts = validateProducts(products);
      
      if (validProducts.length === 0) {
        toast.error("Nenhum produto válido encontrado no arquivo");
        return;
      }
      
      // Insert products into database
      await insertProducts(validProducts);
      
      toast.success(`${validProducts.length} produtos importados com sucesso!`);
      onSuccess();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Erro ao importar: ${error.message}`);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    if (lines.length <= 1) throw new Error("Arquivo CSV vazio ou inválido");
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const product: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          if (header === 'stock' || header === 'min_stock') {
            product[header] = parseInt(value) || 0;
          } else {
            product[header] = value;
          }
        });
        
        return product;
      });
  };

  const validateProducts = (products: any[]): any[] => {
    // Check required fields, add user_id
    return products.filter(p => p.name && p.category)
      .map(p => ({
        name: p.name,
        category: p.category,
        stock: p.stock || 0,
        min_stock: p.min_stock || 5,
        barcode: p.barcode || null,
        user_id: user!.id
      }));
  };

  const insertProducts = async (products: any[]) => {
    const { error } = await supabase
      .from('products')
      .insert(products);
    
    if (error) throw error;
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => {
            setImportMethod('csv');
            setIsDialogOpen(true);
          }}>
            <FileUp className="w-4 h-4 mr-2" />
            Importar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setImportMethod('json');
            setIsDialogOpen(true);
          }}>
            <FileJson className="w-4 h-4 mr-2" />
            Importar JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {importMethod === 'csv' ? 'Importar CSV' : 'Importar JSON'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {importMethod === 'csv' ? 
                'Selecione um arquivo CSV com cabeçalhos: name, category, stock, min_stock, barcode (opcional)' :
                'Selecione um arquivo JSON com uma lista de produtos'
              }
            </p>
            <input
              type="file"
              accept={importMethod === 'csv' ? '.csv' : '.json'}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
