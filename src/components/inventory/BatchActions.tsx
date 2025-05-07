
import React, { useState } from "react";
import { Import, FileUp, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/useInventory";

// Helper function to convert JSON to CSV
const convertToCSV = (objArray: any[]) => {
  if (objArray.length === 0) return '';
  const header = Object.keys(objArray[0]).join(',') + '\n';
  const rows = objArray.map(obj => 
    Object.values(obj).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  ).join('\n');
  return header + rows;
};

interface BatchActionsProps {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  onSuccess: () => void;
  allProducts: Product[];
}

export const BatchActions = ({ 
  selectedProducts, 
  setSelectedProducts, 
  onSuccess,
  allProducts
}: BatchActionsProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
              const barcode = product.barcode; // Extraímos separadamente pois não faz parte do tipo principal
              
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
                // Insert new product - Note: removed barcode field as it's not in the DB schema
                const { error } = await supabase
                  .from('products')
                  .insert({ name, category, stock, min_stock });
                  
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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // If products are selected, export only those. Otherwise, export all products.
      const productsToExport = selectedProducts.length > 0 ? selectedProducts : allProducts;
      
      // Create a simplified version without internal fields
      const cleanedProducts = productsToExport.map(({ id, name, category, stock, min_stock, barcode }) => ({
        id, name, category, stock, min_stock, barcode
      }));
      
      // Create CSV and JSON data
      const jsonData = JSON.stringify(cleanedProducts, null, 2);
      const csvData = convertToCSV(cleanedProducts);
      
      // Function to download file
      const download = (content: string, fileName: string, contentType: string) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      
      // Prompt user for format
      const format = window.confirm(
        'Escolha o formato de exportação:\nOK para JSON, Cancelar para CSV'
      ) ? 'json' : 'csv';
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `inventario-${timestamp}.${format}`;
      
      if (format === 'json') {
        download(jsonData, fileName, 'application/json');
      } else {
        download(csvData, fileName, 'text/csv');
      }
      
      toast.success(`${productsToExport.length} produtos exportados com sucesso!`);
      
      // Clear selection after export if any were selected
      if (selectedProducts.length > 0) {
        setSelectedProducts([]);
      }
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Nenhum produto selecionado');
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produtos?`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const productIds = selectedProducts.map(p => p.id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);
      
      if (error) throw error;
      
      toast.success(`${selectedProducts.length} produtos excluídos com sucesso!`);
      setSelectedProducts([]);
      onSuccess();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAnySelected = selectedProducts.length > 0;

  return (
    <div className="flex space-x-2">
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

      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={handleExport} 
        disabled={isExporting}
      >
        <FileUp className="w-4 h-4" />
        Exportar
      </Button>

      {isAnySelected && (
        <Button 
          variant="destructive" 
          className="gap-2" 
          onClick={handleDeleteSelected}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          Excluir ({selectedProducts.length})
        </Button>
      )}
    </div>
  );
};
